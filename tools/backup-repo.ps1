[CmdletBinding()]
param(
  [string]$RepoName,
  [switch]$All,
  [string]$ConfigPath,
  [switch]$Incremental,
  [ValidateSet("Timestamped", "Mirror")]
  [string]$IncrementalMode = "Timestamped",
  [string]$LogPath,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$script:ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$script:RepoRoot = Split-Path -Parent $script:ScriptRoot

if (-not $ConfigPath) {
  $ConfigPath = Join-Path $script:RepoRoot "data/backup-config.json"
}

if (-not $LogPath) {
  $LogPath = Join-Path $script:ScriptRoot "logs/backup.log"
}

$logDir = Split-Path $LogPath -Parent
if (-not (Test-Path $logDir)) {
  New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

function Write-BackupLog {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Message
  )

  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Add-Content -Path $LogPath -Value "[$timestamp] $Message"
}

function Load-BackupConfig {
  if (-not (Test-Path $ConfigPath)) {
    throw "Backup config not found at $ConfigPath"
  }

  $raw = Get-Content -Path $ConfigPath -Raw
  $config = $raw | ConvertFrom-Json
  if (-not $config.repositories) {
    throw "Backup config missing repositories mapping."
  }

  return $config
}

function Get-RepoEntries {
  param(
    [Parameter(Mandatory = $true)]
    [object]$Config
  )

  $entries = @()
  $repos = $Config.repositories

  if ($repos -is [System.Collections.IDictionary]) {
    foreach ($key in $repos.Keys) {
      $entries += [pscustomobject]@{
        Name  = $key
        Entry = $repos[$key]
      }
    }
    return $entries
  }

  if ($repos -is [System.Collections.IEnumerable]) {
    foreach ($item in $repos) {
      if ($item.name) {
        $entries += [pscustomobject]@{
          Name  = $item.name
          Entry = $item
        }
      }
    }
    return $entries
  }

  throw "Unsupported repositories mapping format in $ConfigPath"
}

function Resolve-BackupDestination {
  param(
    [Parameter(Mandatory = $true)]
    [object]$Entry
  )

  if ($Entry -is [string]) {
    return $Entry
  }

  if ($Entry.destination) {
    return $Entry.destination
  }

  throw "Destination missing for repo entry."
}

function Resolve-BackupSource {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name,
    [Parameter(Mandatory = $true)]
    [object]$Entry
  )

  if ($Entry.source) {
    return $Entry.source
  }

  if ($Name -eq (Split-Path -Leaf $script:RepoRoot)) {
    return $script:RepoRoot
  }

  throw "Source path missing for repo '$Name'. Add a source path in $ConfigPath."
}

function Invoke-MirrorCopy {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Source,
    [Parameter(Mandatory = $true)]
    [string]$Destination,
    [switch]$DryRun
  )

  if ($IsWindows -and (Get-Command robocopy -ErrorAction SilentlyContinue)) {
    $args = @(
      $Source,
      $Destination,
      "/MIR",
      "/R:1",
      "/W:1",
      "/NFL",
      "/NDL",
      "/NJH",
      "/NJS",
      "/NP"
    )

    if ($DryRun) {
      $args += "/L"
    }

    & robocopy @args | Out-Null
    $exitCode = $LASTEXITCODE
    if ($exitCode -gt 7) {
      throw "Robocopy failed with exit code $exitCode"
    }

    return
  }

  if (Get-Command rsync -ErrorAction SilentlyContinue) {
    $rsyncArgs = @("-a", "--delete")
    if ($DryRun) {
      $rsyncArgs += "--dry-run"
    }
    $rsyncArgs += @("$Source/", "$Destination/")

    & rsync @rsyncArgs | Out-Null
    if ($LASTEXITCODE -ne 0) {
      throw "rsync failed with exit code $LASTEXITCODE"
    }

    return
  }

  throw "Mirror mode requires robocopy (Windows) or rsync (macOS/Linux)."
}

function Invoke-BackupCopy {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Source,
    [Parameter(Mandatory = $true)]
    [string]$DestinationRoot,
    [switch]$Incremental,
    [string]$IncrementalMode,
    [switch]$DryRun
  )

  if (-not (Test-Path $Source)) {
    throw "Source path not found: $Source"
  }

  $destination = $DestinationRoot
  if ($Incremental -and $IncrementalMode -eq "Timestamped") {
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $destination = Join-Path $DestinationRoot $timestamp
  }

  if (-not (Test-Path $destination)) {
    New-Item -ItemType Directory -Path $destination -Force | Out-Null
  }

  if ($Incremental -and $IncrementalMode -eq "Mirror") {
    Invoke-MirrorCopy -Source $Source -Destination $destination -DryRun:$DryRun
    return
  }

  if ($DryRun) {
    return
  }

  Copy-Item -Path (Join-Path $Source "*") -Destination $destination -Recurse -Force
}

try {
  Write-BackupLog "Backup run starting."
  $config = Load-BackupConfig
  $repoEntries = Get-RepoEntries -Config $config

  if (-not $All -and [string]::IsNullOrWhiteSpace($RepoName)) {
    $available = $repoEntries | ForEach-Object { $_.Name } | Sort-Object
    throw "RepoName is required unless -All is set. Available repos: $($available -join ', ')"
  }

  $targets = if ($All) {
    $repoEntries
  } else {
    $match = $repoEntries | Where-Object { $_.Name -eq $RepoName } | Select-Object -First 1
    if (-not $match) {
      $available = $repoEntries | ForEach-Object { $_.Name } | Sort-Object
      throw "Repo '$RepoName' not found in config. Available repos: $($available -join ', ')"
    }
    @($match)
  }

  foreach ($target in $targets) {
    $name = $target.Name
    $entry = $target.Entry
    $source = Resolve-BackupSource -Name $name -Entry $entry
    $destinationRoot = Resolve-BackupDestination -Entry $entry

    Write-BackupLog "Starting backup for '$name' from '$source' to '$destinationRoot'."
    Invoke-BackupCopy -Source $source -DestinationRoot $destinationRoot -Incremental:$Incremental -IncrementalMode $IncrementalMode -DryRun:$DryRun
    Write-BackupLog "Completed backup for '$name'."
  }

  Write-BackupLog "Backup run completed."
} catch {
  Write-BackupLog "ERROR: $($_.Exception.Message)"
  Write-Error $_.Exception.Message
  exit 1
}

exit 0
