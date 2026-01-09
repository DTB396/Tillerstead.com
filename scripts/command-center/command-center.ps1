<#
Command Center
-------------
PowerShell helpers for batch command execution, a command database, and
profile-oriented convenience functions.

Usage:
  .\scripts\command-center\command-center.ps1
  Show-CommandCenter

  $db = Get-CommandDatabase
  Invoke-CommandSet -Name "sync-and-build"
  Invoke-MassExecute -Commands @("git status -sb", "bundle exec jekyll build")
#>

Set-StrictMode -Version Latest

$script:CommandCenterRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$script:CommandCenterScriptsRoot = Split-Path -Parent $script:CommandCenterRoot
$script:CommandCenterRepoRoot = Split-Path -Parent $script:CommandCenterScriptsRoot
$script:CommandDatabasePath = Join-Path $script:CommandCenterRepoRoot "data/command-db.json"
$script:CommandCenterConfigPath = Join-Path $script:CommandCenterRepoRoot "data/command-center-config.json"
$script:CommandCenterLogsRoot = Join-Path $script:CommandCenterRepoRoot "logs"
$script:SystemHealthLogPath = Join-Path $script:CommandCenterLogsRoot "system-health.log"

function Initialize-CommandCenterLogs {
    if (-not (Test-Path $script:CommandCenterLogsRoot)) {
        New-Item -Path $script:CommandCenterLogsRoot -ItemType Directory | Out-Null
    }
}

function Write-SystemHealthLog {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Message,
        [string]$Level = "INFO",
        [string]$LogPath = $script:SystemHealthLogPath
    )

    Initialize-CommandCenterLogs
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp [$Level] $Message" | Out-File -FilePath $LogPath -Append
}

function Get-CommandCenterConfig {
    if (-not (Test-Path $script:CommandCenterConfigPath)) {
        throw "Command center config not found at $script:CommandCenterConfigPath"
    }

    $raw = Get-Content -Path $script:CommandCenterConfigPath -Raw
    return $raw | ConvertFrom-Json
}

function Get-CommandDatabase {
    if (-not (Test-Path $script:CommandDatabasePath)) {
        throw "Command database not found at $script:CommandDatabasePath"
    }

    $raw = Get-Content -Path $script:CommandDatabasePath -Raw
    return $raw | ConvertFrom-Json
}

function Test-CommandDatabase {
    $db = Get-CommandDatabase
    $issues = @()

    foreach ($command in $db.commands) {
        if (-not $command.name) {
            $issues += "Command entry missing name."
        }
        if (-not $command.command) {
            $issues += "Command '$($command.name)' missing command string."
        }
    }

    foreach ($set in $db.commandSets) {
        if (-not $set.name) {
            $issues += "Command set entry missing name."
        }
        foreach ($commandName in $set.commands) {
            $exists = $db.commands | Where-Object { $_.name -eq $commandName } | Select-Object -First 1
            if (-not $exists) {
                $issues += "Command set '$($set.name)' references missing command '$commandName'."
            }
        }
    }

    return $issues
}

function Write-AvailableCommands {
    param(
        [Parameter(Mandatory = $true)]
        [object[]]$Commands
    )

    $available = $Commands | Where-Object { $_.name } | ForEach-Object { $_.name } | Sort-Object
    if ($available.Count -gt 0) {
        Write-Host "Available commands: $($available -join ', ')" -ForegroundColor Yellow
    }
}

function Get-CommandFromDb {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    $db = Get-CommandDatabase
    if ([string]::IsNullOrWhiteSpace($Name)) {
        Write-AvailableCommands -Commands $db.commands
        throw "Command name is required."
    }

    $entry = $db.commands | Where-Object { $_.name -eq $Name } | Select-Object -First 1
    if (-not $entry) {
        Write-AvailableCommands -Commands $db.commands
        throw "Command '$Name' not found in database."
    }

    return $entry
}

function get-command-from-db {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    return Get-CommandFromDb -Name $Name
}

function Resolve-CommandStrings {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Names
    )

    $commands = @()
    foreach ($name in $Names) {
        $entry = Get-CommandFromDb -Name $name
        if ($entry.command -is [string]) {
            $commands += $entry.command
        }
        elseif ($entry.command -is [System.Collections.IEnumerable]) {
            $commands += $entry.command
        }
        else {
            throw "Command '$name' has no runnable command string."
        }
    }

    return $commands
}

function Write-CommandCenterLog {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Message,
        [string]$LogPath = (Join-Path $script:CommandCenterRoot "command-center.log")
    )

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp $Message" | Out-File -FilePath $LogPath -Append
}

function Confirm-CommandExecution {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Command
    )

    $choice = Read-Host "Run command? [y/N] $Command"
    return $choice -match '^[Yy]$'
}

function Invoke-MassExecute {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Commands,
        [switch]$ContinueOnError,
        [switch]$DryRun,
        [switch]$RequireConfirmation,
        [string]$LogPath = (Join-Path $script:CommandCenterRoot "command-center.log")
    )

    foreach ($cmd in $Commands) {
        Write-Host "Executing: $cmd" -ForegroundColor Cyan
        Write-CommandCenterLog -Message "Executing: $cmd" -LogPath $LogPath

        if ($RequireConfirmation -and -not (Confirm-CommandExecution -Command $cmd)) {
            Write-Host "Skipped: $cmd" -ForegroundColor Yellow
            Write-CommandCenterLog -Message "Skipped: $cmd" -LogPath $LogPath
            continue
        }

        if ($DryRun) {
            Write-Host "Dry run enabled: skipped execution." -ForegroundColor Yellow
            Write-CommandCenterLog -Message "Dry run skipped: $cmd" -LogPath $LogPath
            continue
        }

        Invoke-Expression $cmd
        if ($LASTEXITCODE -ne 0) {
            $errorMessage = "Command failed with exit code $LASTEXITCODE: $cmd"
            Write-CommandCenterLog -Message $errorMessage -LogPath $LogPath
            if (-not $ContinueOnError) {
                throw $errorMessage
            }
        }
    }

    Write-Host "All commands executed successfully!" -ForegroundColor Green
}

function Invoke-CommandSet {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,
        [switch]$ContinueOnError,
        [switch]$DryRun,
        [switch]$RequireConfirmation,
        [string]$LogPath = (Join-Path $script:CommandCenterRoot "command-center.log")
    )

    $db = Get-CommandDatabase
    $set = $db.commandSets | Where-Object { $_.name -eq $Name } | Select-Object -First 1
    if (-not $set) {
        throw "Command set '$Name' not found in database."
    }

    $commands = Resolve-CommandStrings -Names $set.commands
    Invoke-MassExecute -Commands $commands -ContinueOnError:$ContinueOnError -DryRun:$DryRun -RequireConfirmation:$RequireConfirmation -LogPath $LogPath
}

function invoke-command-from-db {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,
        [switch]$ContinueOnError,
        [switch]$DryRun,
        [switch]$RequireConfirmation,
        [string]$LogPath = (Join-Path $script:CommandCenterRoot "command-center.log")
    )

    $commands = Resolve-CommandStrings -Names @($Name)
    Invoke-MassExecute -Commands $commands -ContinueOnError:$ContinueOnError -DryRun:$DryRun -RequireConfirmation:$RequireConfirmation -LogPath $LogPath
}

function Show-CommandCenter {
    $db = Get-CommandDatabase
    $sets = $db.commandSets
    $commands = $db.commands

    $issues = Test-CommandDatabase
    if ($issues.Count -gt 0) {
        Write-Host "Command database validation issues:" -ForegroundColor Red
        $issues | ForEach-Object { Write-Host "- $_" -ForegroundColor Red }
        return
    }

    Write-Host "Select a batch operation or command:" -ForegroundColor Yellow
    Write-Host "Batch command sets:" -ForegroundColor Cyan
    for ($i = 0; $i -lt $sets.Count; $i++) {
        $index = $i + 1
        $description = if ($sets[$i].description) { " - $($sets[$i].description)" } else { "" }
        Write-Host "$index. $($sets[$i].name)$description"
    }

    $commandOffset = $sets.Count
    Write-Host ""
    Write-Host "Single commands:" -ForegroundColor Cyan
    for ($i = 0; $i -lt $commands.Count; $i++) {
        $index = $commandOffset + $i + 1
        $description = if ($commands[$i].description) { " - $($commands[$i].description)" } else { "" }
        Write-Host "$index. $($commands[$i].name)$description"
    }

    Write-Host "Q. Exit"

    $choice = Read-Host "Enter your choice"
    if ($choice -match '^[Qq]$') {
        Write-Host "Exiting..." -ForegroundColor Yellow
        return
    }

    if (-not ($choice -as [int])) {
        Write-Host "Invalid choice!" -ForegroundColor Red
        return
    }

    $selection = [int]$choice - 1
    if ($selection -lt 0 -or $selection -ge ($sets.Count + $commands.Count)) {
        Write-Host "Invalid choice!" -ForegroundColor Red
        return
    }

    if ($selection -lt $sets.Count) {
        Invoke-CommandSet -Name $sets[$selection].name
        return
    }

    $commandIndex = $selection - $sets.Count
    invoke-command-from-db -Name $commands[$commandIndex].name
}

function Monitor-DiskSpace {
    param(
        [int]$WarningThresholdGB = 80,
        [string]$DriveName = "C"
    )

    $disk = Get-PSDrive -Name $DriveName
    if (-not $disk) {
        Write-Host "Drive $DriveName not found." -ForegroundColor Yellow
        return
    }

    $usedGB = [Math]::Round($disk.Used / 1GB, 2)
    if ($usedGB -gt $WarningThresholdGB) {
        Write-Host "Warning: $DriveName drive usage is ${usedGB}GB, above ${WarningThresholdGB}GB." -ForegroundColor Red
    }
    else {
        Write-Host "Drive $DriveName usage: ${usedGB}GB." -ForegroundColor Green
    }
}

function Clear-TempFiles {
    [CmdletBinding(SupportsShouldProcess = $true)]
    param(
        [string]$TempPath = (Join-Path $env:TEMP "*")
    )

    if ($PSCmdlet.ShouldProcess($TempPath, "Remove temporary files")) {
        Remove-Item -Path $TempPath -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "Temp files cleaned at $TempPath." -ForegroundColor Green
    }
}

function Send-CommandCenterErrorNotification {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ErrorMessage,
        [Parameter(Mandatory = $true)]
        [string]$ToEmail,
        [Parameter(Mandatory = $true)]
        [string]$FromEmail,
        [string]$SmtpServer = "localhost"
    )

    Send-MailMessage -To $ToEmail -From $FromEmail -Subject "Command Center Error" -Body $ErrorMessage -SmtpServer $SmtpServer
}

function monitor-disk-space {
    param(
        [int]$WarningThresholdGB = 80,
        [string]$DriveName = "C",
        [string]$LogPath = $script:SystemHealthLogPath
    )

    $disk = Get-PSDrive -Name $DriveName
    if (-not $disk) {
        Write-Host "Drive $DriveName not found." -ForegroundColor Yellow
        Write-SystemHealthLog -Message "Drive $DriveName not found." -Level "WARN" -LogPath $LogPath
        return
    }

    $usedGB = [Math]::Round($disk.Used / 1GB, 2)
    if ($usedGB -gt $WarningThresholdGB) {
        $message = "Warning: $DriveName drive usage is ${usedGB}GB, above ${WarningThresholdGB}GB."
        Write-Host $message -ForegroundColor Red
        Write-SystemHealthLog -Message $message -Level "WARN" -LogPath $LogPath
    }
    else {
        $message = "Drive $DriveName usage: ${usedGB}GB."
        Write-Host $message -ForegroundColor Green
        Write-SystemHealthLog -Message $message -Level "INFO" -LogPath $LogPath
    }
}

function clean-temp-files {
    [CmdletBinding(SupportsShouldProcess = $true)]
    param(
        [string]$TempPath = $env:TEMP,
        [string]$LogPath = $script:SystemHealthLogPath
    )

    if ([string]::IsNullOrWhiteSpace($TempPath)) {
        throw "Temp path is required."
    }

    $resolvedTemp = [System.IO.Path]::GetFullPath($TempPath)
    $userTempRoot = [System.IO.Path]::GetFullPath($env:TEMP)

    if (-not ($resolvedTemp -like "$userTempRoot*")) {
        throw "Safety check failed: $resolvedTemp is outside user temp path $userTempRoot."
    }

    $targetPath = Join-Path $resolvedTemp "*"
    if ($PSCmdlet.ShouldProcess($targetPath, "Remove temporary files")) {
        Remove-Item -Path $targetPath -Recurse -Force -ErrorAction SilentlyContinue
        $message = "Temp files cleaned at $resolvedTemp."
        Write-Host $message -ForegroundColor Green
        Write-SystemHealthLog -Message $message -Level "INFO" -LogPath $LogPath
    }
}

function send-error-notification {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ErrorMessage,
        [string]$ConfigPath = $script:CommandCenterConfigPath
    )

    if (-not (Test-Path $ConfigPath)) {
        throw "SMTP config not found at $ConfigPath"
    }

    $config = Get-Content -Path $ConfigPath -Raw | ConvertFrom-Json
    $smtp = $config.smtp
    if (-not $smtp) {
        throw "SMTP configuration missing in $ConfigPath"
    }

    $params = @{
        To = $smtp.toEmail
        From = $smtp.fromEmail
        Subject = "Command Center Error"
        Body = $ErrorMessage
        SmtpServer = $smtp.server
    }

    if ($smtp.port) {
        $params.Port = [int]$smtp.port
    }

    if ($smtp.useSsl -ne $null) {
        $params.UseSsl = [bool]$smtp.useSsl
    }

    if ($smtp.username -and $smtp.password) {
        $securePassword = ConvertTo-SecureString $smtp.password -AsPlainText -Force
        $params.Credential = [PSCredential]::new($smtp.username, $securePassword)
    }

    Send-MailMessage @params
}

function Register-CommandCenterMaintenanceTask {
    param(
        [string]$TaskName = "CommandCenterSystemHealth",
        [int]$IntervalMinutes,
        [string]$ScriptPath = (Join-Path $script:CommandCenterRoot "run-system-health.ps1")
    )

    if (-not $IsWindows) {
        Write-Host "Scheduled tasks are only supported on Windows." -ForegroundColor Yellow
        return
    }

    if (-not $IntervalMinutes) {
        $config = Get-CommandCenterConfig
        $IntervalMinutes = $config.systemHealth.scheduleMinutes
    }

    if (-not $IntervalMinutes) {
        throw "IntervalMinutes is required to schedule maintenance."
    }

    if (-not (Test-Path $ScriptPath)) {
        throw "System health script not found at $ScriptPath"
    }

    $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$ScriptPath`""
    $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes $IntervalMinutes) -RepetitionDuration ([TimeSpan]::MaxValue)
    Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Force | Out-Null
    Write-Host "Scheduled task '$TaskName' registered to run every $IntervalMinutes minutes." -ForegroundColor Green
}

function Enable-CommandCenterProfile {
    <#
    Adds prompt, quick-recall, and system info helpers to the current session.
    Dot-source this function from your PowerShell profile if desired.
    #>

    function prompt {
        $cwd = Get-Location
        $gitBranch = git rev-parse --abbrev-ref HEAD 2>$null
        $gitStatus = if ($gitBranch) { " ($gitBranch)" } else { "" }
        "$cwd$gitStatus> "
    }

    function quick-recall {
        $history = Get-History
        $history | ForEach-Object { Write-Host "$($_.Id): $($_.CommandLine)" }
        $commandId = Read-Host "Enter the command number to re-execute"
        Invoke-History -Id $commandId
    }

    function show-system-info {
        $uptime = (Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
        Write-Host "System uptime: $uptime" -ForegroundColor Green
        Write-Host "User: $env:UserName" -ForegroundColor Green
        Write-Host "Host: $env:COMPUTERNAME" -ForegroundColor Green
    }

    show-system-info
}
