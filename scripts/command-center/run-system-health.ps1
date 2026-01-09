Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $scriptRoot "command-center.ps1")

$config = Get-CommandCenterConfig
$systemHealth = $config.systemHealth

try {
    if ($systemHealth -and $systemHealth.diskWarningThresholdGB) {
        monitor-disk-space -WarningThresholdGB $systemHealth.diskWarningThresholdGB -DriveName $systemHealth.driveName
    }
    else {
        monitor-disk-space
    }

    if (-not $systemHealth -or $systemHealth.cleanupTemp -ne $false) {
        clean-temp-files
    }
}
catch {
    send-error-notification -ErrorMessage $_.Exception.Message
    throw
}
