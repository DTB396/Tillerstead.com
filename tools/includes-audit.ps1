# tools\includes-audit.ps1
# Usage:
#   pwsh .\tools\includes-audit.ps1
# Outputs:
#   .\_reports\includes-inventory.csv
#   .\_reports\includes-usage.csv
#   .\_reports\includes-duplicates.csv
#   .\_reports\includes-unused.csv

$ErrorActionPreference = "Stop"

$repoRoot = (Get-Location).Path
$includesRoot = Join-Path $repoRoot "_includes"
$reportsDir = Join-Path $repoRoot "_reports"
New-Item -ItemType Directory -Force -Path $reportsDir | Out-Null

if (!(Test-Path $includesRoot)) {
  throw "Not in a Jekyll repo root (missing _includes). Current: $repoRoot"
}

function Get-FileTextSafe([string]$path) {
  try { return Get-Content -LiteralPath $path -Raw -ErrorAction Stop }
  catch { return "" }
}

# 1) Inventory + hash
$includes = Get-ChildItem -LiteralPath $includesRoot -Recurse -File -Filter "*.html" |
  ForEach-Object {
    $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $_.FullName).Hash
    [PSCustomObject]@{
      IncludeRel = $_.FullName.Replace($repoRoot + "\", "").Replace("\", "/")
      IncludeName = $_.Name
      FolderRel = $_.DirectoryName.Replace($repoRoot + "\", "").Replace("\", "/")
      Length = $_.Length
      LastWriteTime = $_.LastWriteTime
      SHA256 = $hash
    }
  }

$includes | Sort-Object IncludeRel |
  Export-Csv (Join-Path $reportsDir "includes-inventory.csv") -NoTypeInformation

# 2) Find include calls across repo
# Capture patterns:
#   {% include file.html %}
#   {% include folder/file.html %}
#   {% include_relative file.html %} (rare in Jekyll sites, but catch it)
$scanTargets = @(
  (Join-Path $repoRoot "_layouts"),
  (Join-Path $repoRoot "_includes"),
  (Join-Path $repoRoot "_posts"),
  (Join-Path $repoRoot "_pages"),
  (Join-Path $repoRoot "pages"),
  $repoRoot
) | Where-Object { Test-Path $_ } | Select-Object -Unique

$includeRegex = [regex]"{%\s*(include|include_relative)\s+([^\s%}]+)"

$usage = New-Object System.Collections.Generic.List[object]

foreach ($dir in $scanTargets) {
  Get-ChildItem -LiteralPath $dir -Recurse -File |
    Where-Object { $_.Extension -match "\.(html|md|markdown|liquid|scss|css|js)$" } |
    ForEach-Object {
      $text = Get-FileTextSafe $_.FullName
      if ([string]::IsNullOrWhiteSpace($text)) { return }

      $matches = $includeRegex.Matches($text)
      foreach ($m in $matches) {
        $callee = $m.Groups[2].Value.Trim().Trim("'`"")
        $usage.Add([PSCustomObject]@{
          CallerRel = $_.FullName.Replace($repoRoot + "\", "").Replace("\", "/")
          IncludeRef = $callee
          IncludeTag = $m.Groups[1].Value
        })
      }
    }
}

$usage |
  Sort-Object CallerRel, IncludeRef |
  Export-Csv (Join-Path $reportsDir "includes-usage.csv") -NoTypeInformation

# 3) Duplicate detection by identical content hash
$dupes = $includes |
  Group-Object SHA256 |
  Where-Object { $_.Count -gt 1 } |
  ForEach-Object {
    [PSCustomObject]@{
      SHA256 = $_.Name
      Count = $_.Count
      Files = ($_.Group | Sort-Object IncludeRel | ForEach-Object { $_.IncludeRel }) -join " | "
    }
  }

$dupes | Export-Csv (Join-Path $reportsDir "includes-duplicates.csv") -NoTypeInformation

# 4) Unused includes (best-effort):
# Jekyll resolves includes by name or relative path.
# We'll mark as "used" if referenced by filename OR by relative path.
$usageRefs = $usage | Select-Object -ExpandProperty IncludeRef
$usageSet = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
foreach ($r in $usageRefs) { [void]$usageSet.Add($r) }

$unused = $includes | Where-Object {
  $fileName = $_.IncludeName
  $relFromIncludes = $_.IncludeRel -replace "^_includes/",""
  -not ($usageSet.Contains($fileName) -or $usageSet.Contains($relFromIncludes))
} | Select-Object IncludeRel, IncludeName, FolderRel, Length, LastWriteTime

$unused | Sort-Object IncludeRel |
  Export-Csv (Join-Path $reportsDir "includes-unused.csv") -NoTypeInformation

Write-Host "✅ Reports written to: $reportsDir" -ForegroundColor Green
Write-Host " - includes-inventory.csv"
Write-Host " - includes-usage.csv"
Write-Host " - includes-duplicates.csv"
Write-Host " - includes-unused.csv"
