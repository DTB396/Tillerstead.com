param(
  [string]$Root = ".",
  [int]$MaxFilesPerCommit = 50,
  [string]$Branch = ""
)

Set-Location $Root

# Optional: switch branch if provided
if ($Branch -ne "") {
  git checkout $Branch
}

# Find untracked PDFs (not yet added to git)
$untracked = git status --porcelain | ForEach-Object { $_ } |
  Where-Object { $_ -match "^\?\?\s+" } |
  ForEach-Object { $_ -replace "^\?\?\s+", "" } |
  Where-Object { $_.ToLower().EndsWith(".pdf") }

if (-not $untracked -or $untracked.Count -eq 0) {
  Write-Host "No untracked PDFs found."
  exit 0
}

Write-Host "Found $($untracked.Count) untracked PDFs."

# Chunk commits so you never do a giant confusing commit
$chunks = @()
for ($i=0; $i -lt $untracked.Count; $i += $MaxFilesPerCommit) {
  $chunks += ,($untracked[$i..([Math]::Min($i+$MaxFilesPerCommit-1, $untracked.Count-1))])
}

$commitIndex = 1
foreach ($chunk in $chunks) {
  foreach ($file in $chunk) {
    git add -- "$file"
  }

  $msg = "Add PDFs batch $commitIndex of $($chunks.Count)"
  git commit -m $msg
  Write-Host "Committed: $msg"
  $commitIndex++
}

git push
Write-Host "Done. Pushed to remote."
