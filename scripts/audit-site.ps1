<#
.SYNOPSIS
  Repo Audit: YAML + Front Matter + Dupes + Encoding suspects + Jekyll build

.NOTES
  PowerShell 5.1+ compatible.
  Uses Ruby Psych (same YAML engine as Jekyll) when ruby is available.
#>

[CmdletBinding()]
param(
  [string]$Root = (Get-Location).Path,
  [string]$ReportDir = ".\_audit"
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

function Ensure-Dir([string]$Path) {
  New-Item -ItemType Directory -Force -Path $Path | Out-Null
}

function Out-Report([string]$Name, [object]$Content) {
  $Path = Join-Path $ReportDir $Name
  $Text =
  if ($null -eq $Content) { "" }
  elseif ($Content -is [string]) { $Content }
  else { ($Content | Out-String) }

  $Text | Out-File -FilePath $Path -Encoding UTF8
  Write-Host ("Wrote " + $Path)
}

function Try-GetCommand([string]$Name) {
  Get-Command $Name -ErrorAction SilentlyContinue
}

function Read-FileRawSafe([string]$Path) {
  # Avoid PS parser issues: read bytes then decode UTF-8 with replacement.
  try {
    $Bytes = [System.IO.File]::ReadAllBytes($Path)
    return [System.Text.Encoding]::UTF8.GetString($Bytes)
  }
  catch {
    return (Get-Content -Raw -Path $Path -ErrorAction SilentlyContinue)
  }
}

function Get-RepoFiles {
  param(
    [string[]]$Include,
    [string[]]$ExcludeDirNames
  )

  $ExcludeRegex = "\\(" + (($ExcludeDirNames | ForEach-Object { [regex]::Escape($_) }) -join "|") + ")\\"

  Get-ChildItem -Path $Root -Recurse -File -Include $Include |
  Where-Object { $_.FullName -notmatch $ExcludeRegex }
}

function Get-Sha256([string]$Path) {
  (Get-FileHash -Algorithm SHA256 -Path $Path).Hash
}

function Invoke-RubyYamlFileCheck {
  param([string]$YamlPath)

  $ruby = Try-GetCommand "ruby"
  if (-not $ruby) { return "ruby not found" }

  $Script = @"
begin
  require 'yaml'
  YAML.load_file(ARGV[0])
  puts 'OK'
rescue Exception => e
  puts e.message
  exit 1
end
"@

  $Tmp = [System.IO.Path]::GetTempFileName() + ".rb"
  [System.IO.File]::WriteAllText($Tmp, $Script, [System.Text.Encoding]::UTF8)

  try {
    $out = & ruby $Tmp $YamlPath 2>&1
    if ($LASTEXITCODE -ne 0) { return ($out | Out-String).Trim() }
    return $null
  }
  finally {
    Remove-Item -Force -ErrorAction SilentlyContinue $Tmp
  }
}

function Invoke-RubyYamlStringCheck {
  param([string]$YamlString)

  $ruby = Try-GetCommand "ruby"
  if (-not $ruby) { return "ruby not found" }

  $Script = @"
begin
  require 'yaml'
  y = STDIN.read
  YAML.safe_load(y, aliases: true)
  puts 'OK'
rescue Exception => e
  puts e.message
  exit 1
end
"@

  $Tmp = [System.IO.Path]::GetTempFileName() + ".rb"
  [System.IO.File]::WriteAllText($Tmp, $Script, [System.Text.Encoding]::UTF8)

  try {
    $out = $YamlString | & ruby $Tmp 2>&1
    if ($LASTEXITCODE -ne 0) { return ($out | Out-String).Trim() }
    return $null
  }
  finally {
    Remove-Item -Force -ErrorAction SilentlyContinue $Tmp
  }
}

function Extract-FrontMatterYaml {
  param([string]$RawText)

  if (-not $RawText) { return $null }
  $Lines = $RawText -split "`r?`n"
  if ($Lines.Count -lt 3) { return $null }
  if ($Lines[0].Trim() -ne "---") { return $null }

  $Close = $null
  for ($i = 1; $i -lt $Lines.Count; $i++) {
    if ($Lines[$i].Trim() -eq "---") { $Close = $i; break }
  }
  if ($null -eq $Close) { return "__NO_CLOSE__" }

  return ($Lines[1..($Close - 1)] -join "`n")
}

# ----------------------------
# Start
# ----------------------------
$ExcludeDirs = @("node_modules", "vendor", "_site", ".git", ".bundle", ".jekyll-cache")

Ensure-Dir $ReportDir
Write-Host "Auditing repo: $Root"
Out-Report "audit-meta.txt" ("Root: $Root`r`nDate: " + (Get-Date).ToString("yyyy-MM-dd HH:mm:ss"))

# ----------------------------
# 1) YAML parse check (Psych)
# ----------------------------
$yamlFiles = Get-RepoFiles -Include @("*.yml", "*.yaml") -ExcludeDirNames $ExcludeDirs
$yamlParseFailures = New-Object System.Collections.Generic.List[object]

foreach ($f in $yamlFiles) {
  $err = Invoke-RubyYamlFileCheck -YamlPath $f.FullName
  if ($err -and $err -ne "ruby not found") {
    $yamlParseFailures.Add([pscustomobject]@{ file = $f.FullName; error = $err })
  }
}
Out-Report "yaml-parse-failures.txt" ($yamlParseFailures | Sort-Object file | Format-List | Out-String)

# ----------------------------
# 2) Front matter: close marker + YAML parse
# ----------------------------
$fmFiles = Get-RepoFiles -Include @("*.html", "*.md", "*.markdown") -ExcludeDirNames $ExcludeDirs
$frontMatterProblems = New-Object System.Collections.Generic.List[object]

foreach ($f in $fmFiles) {
  $raw = Read-FileRawSafe $f.FullName
  $yaml = Extract-FrontMatterYaml $raw

  if ($yaml -eq "__NO_CLOSE__") {
    $frontMatterProblems.Add([pscustomobject]@{ file = $f.FullName; issue = "Front matter opens with --- but has no closing ---." })
    continue
  }

  if ($yaml) {
    $err = Invoke-RubyYamlStringCheck -YamlString $yaml
    if ($err -and $err -ne "ruby not found") {
      $frontMatterProblems.Add([pscustomobject]@{ file = $f.FullName; issue = "Front matter YAML parse failed"; error = $err })
    }
  }
}
Out-Report "front-matter-problems.txt" ($frontMatterProblems | Sort-Object file | Format-List | Out-String)

# ----------------------------
# 3) Duplicate YAML copies by hash + baseline vs _data overlap
# ----------------------------
$hashToFiles = @{}
foreach ($f in $yamlFiles) {
  $h = Get-Sha256 $f.FullName
  if (-not $hashToFiles.ContainsKey($h)) {
    $hashToFiles[$h] = New-Object System.Collections.Generic.List[string]
  }
  $hashToFiles[$h].Add($f.FullName)
}

$dupes = New-Object System.Collections.Generic.List[object]
foreach ($kvp in $hashToFiles.GetEnumerator()) {
  if ($kvp.Value.Count -gt 1) {
    $dupes.Add([pscustomobject]@{
        hash  = $kvp.Key
        count = $kvp.Value.Count
        files = ($kvp.Value -join "`n")
      })
  }
}
Out-Report "yaml-duplicates-by-hash.txt" ($dupes | Sort-Object count -Descending | Format-List | Out-String)

$baseline = $yamlFiles | Where-Object { $_.FullName -match "\\docs\\baseline\\" }
$data = $yamlFiles | Where-Object { $_.FullName -match "\\_data\\" }

$baselineByName = @{}
foreach ($f in $baseline) { $baselineByName[$f.Name] = $f.FullName }

$baselineDataOverlap = New-Object System.Collections.Generic.List[object]
foreach ($d in $data) {
  if ($baselineByName.ContainsKey($d.Name)) {
    $bPath = $baselineByName[$d.Name]
    $baselineDataOverlap.Add([pscustomobject]@{
        name     = $d.Name
        baseline = $bPath
        data     = $d.FullName
        sameHash = ((Get-Sha256 $bPath) -eq (Get-Sha256 $d.FullName))
      })
  }
}
Out-Report "baseline-vs-data-overlap.txt" ($baselineDataOverlap | Sort-Object name | Format-Table -AutoSize | Out-String)

# ----------------------------
# 4) Encoding/mojibake suspects (NO literal weird characters)
# ----------------------------
# We look for common Unicode codepoints that often appear in broken text:
# - U+00C2, U+00C3, U+00E2 (often show up in mojibake)
# - smart quotes/dashes: U+2013..U+201D
# - NBSP: U+00A0
$encodingTargets = Get-RepoFiles -Include @("*.yml", "*.yaml", "*.html", "*.md", "*.scss", "*.css", "*.js") -ExcludeDirNames $ExcludeDirs
$encodingHits = New-Object System.Collections.Generic.List[object]
$mojibakeCharPattern = "[\u00A0\u00C2\u00C3\u00E2\u2013\u2014\u2018\u2019\u201C\u201D]"

foreach ($f in $encodingTargets) {
  $raw = Read-FileRawSafe $f.FullName
  if ($raw -match $mojibakeCharPattern) {
    $encodingHits.Add([pscustomobject]@{ file = $f.FullName; note = "Contains characters commonly seen in encoding/mojibake issues." })
  }
}
Out-Report "encoding-suspects.txt" ($encodingHits | Sort-Object file | Format-Table -AutoSize | Out-String)

# ----------------------------
# 5) Utility-class scan (simple + robust)
# ----------------------------
$utilityTokens = @(
  "sm:", "md:", "lg:", "xl:", "2xl:",
  "md:grid-cols-", "grid-cols-",
  "gap-", "p-", "px-", "py-", "rounded-", "text-"
)

$utilityHits = New-Object System.Collections.Generic.List[object]
$markupFiles = Get-RepoFiles -Include @("*.html", "*.md") -ExcludeDirNames $ExcludeDirs

foreach ($f in $markupFiles) {
  $raw = Read-FileRawSafe $f.FullName
  foreach ($tok in $utilityTokens) {
    if ($raw -like "*$tok*") {
      $utilityHits.Add([pscustomobject]@{ file = $f.FullName; token = $tok })
    }
  }
}
Out-Report "possible-utility-usage.txt" ($utilityHits | Sort-Object file, token | Format-Table -AutoSize | Out-String)

# ----------------------------
# 6) Jekyll build trace capture
# ----------------------------
$jekyllReport = New-Object System.Collections.Generic.List[string]
try {
  $bundle = Try-GetCommand "bundle"
  if (-not $bundle) {
    $jekyllReport.Add("bundle not found in PATH")
  }
  else {
    Push-Location $Root
    try {
      $jekyllReport.Add("Running: bundle exec jekyll build --trace")
      $out = & bundle exec jekyll build --trace 2>&1
      $jekyllReport.Add(($out | Out-String))
    }
    finally {
      Pop-Location
    }
  }
}
catch {
  $jekyllReport.Add("Build threw exception:")
  $jekyllReport.Add($_.Exception.Message)
}
Out-Report "jekyll-build-trace.txt" ($jekyllReport -join "`r`n")

# ----------------------------
# 7) Script inventory
# ----------------------------
$scriptsDir = Join-Path $Root "scripts"
if (Test-Path $scriptsDir) {
  $scripts = Get-ChildItem -Path $scriptsDir -File | Sort-Object Name | Select-Object Name, Length, LastWriteTime
  Out-Report "scripts-inventory.txt" ($scripts | Format-Table -AutoSize | Out-String)
}
else {
  Out-Report "scripts-inventory.txt" "No ./scripts directory found."
}

Write-Host ""
Write-Host ("Audit done. Review files in " + $ReportDir)
Write-Host "Key outputs:"
Write-Host (" - " + (Join-Path $ReportDir "yaml-parse-failures.txt"))
Write-Host (" - " + (Join-Path $ReportDir "front-matter-problems.txt"))
Write-Host (" - " + (Join-Path $ReportDir "baseline-vs-data-overlap.txt"))
Write-Host (" - " + (Join-Path $ReportDir "encoding-suspects.txt"))
Write-Host (" - " + (Join-Path $ReportDir "jekyll-build-trace.txt"))
