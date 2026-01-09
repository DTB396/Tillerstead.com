[CmdletBinding()]
param(
  [string]$ThemeConfig = "$(Join-Path $HOME ".config/oh-my-posh/tillerstead.omp.json")"
)

$ErrorActionPreference = "Stop"

$profilePath = $PROFILE.CurrentUserCurrentHost
$profileDir = Split-Path $profilePath -Parent

if (-not (Test-Path $profileDir)) {
  New-Item -ItemType Directory -Path $profileDir -Force | Out-Null
}

if (-not (Test-Path $profilePath)) {
  New-Item -ItemType File -Path $profilePath -Force | Out-Null
}

$startMarker = "# >>> tillerstead cli init >>>"
$endMarker = "# <<< tillerstead cli init <<<"

$snippet = @(
  $startMarker,
  "if (Get-Command oh-my-posh -ErrorAction SilentlyContinue) {",
  "  oh-my-posh init pwsh --config `"$ThemeConfig`" | Invoke-Expression",
  "}",
  "if (Get-Command gh -ErrorAction SilentlyContinue) {",
  "  gh completion -s powershell | Out-String | Invoke-Expression",
  "}",
  $endMarker
) -join [Environment]::NewLine

$profileContent = Get-Content -Path $profilePath -Raw

if ($profileContent -match [regex]::Escape($startMarker)) {
  $pattern = [regex]::Escape($startMarker) + ".*?" + [regex]::Escape($endMarker)
  $updatedContent = [regex]::Replace($profileContent, $pattern, $snippet, "Singleline")
} else {
  $separator = if ($profileContent.Trim()) { [Environment]::NewLine + [Environment]::NewLine } else { "" }
  $updatedContent = $profileContent + $separator + $snippet + [Environment]::NewLine
}

Set-Content -Path $profilePath -Value $updatedContent -Encoding UTF8

Write-Host "Profile updated: $profilePath" -ForegroundColor Green
