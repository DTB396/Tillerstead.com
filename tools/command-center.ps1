function Get-CommandGroups {
    $commandGroups = [ordered]@{
        "Sync + Build" = @(
            "git pull --rebase",
            "bundle exec jekyll build"
        )
        "Backups" = @(
            "pwsh tools/backup-repo.ps1 -All -Incremental",
            "Write-Host 'Backups completed.' -ForegroundColor Green"
        )
        "Maintenance" = @(
            "pwsh tools/00-doctor.ps1",
            "pwsh tools/05-frontmatter-guard.ps1"
        )
    }

    return $commandGroups
}

function Invoke-LoggedCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Command
    )

    Write-Host "Executing: $Command" -ForegroundColor Cyan

    try {
        $global:LASTEXITCODE = 0
        Invoke-Expression $Command
        $commandSucceeded = $?
        $exitCode = $global:LASTEXITCODE

        if (-not $commandSucceeded) {
            throw "Command failed: $Command"
        }

        if ($exitCode -ne 0) {
            throw "Command exited with code $exitCode: $Command"
        }
    } catch {
        Write-Error "Failure while running: $Command"
        throw
    }
}

function mass-execute {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Commands,
        [string]$GroupName = "Batch"
    )

    Write-Host "Starting $GroupName batch..." -ForegroundColor Yellow

    foreach ($command in $Commands) {
        Invoke-LoggedCommand -Command $command
    }

    Write-Host "Completed $GroupName batch." -ForegroundColor Green
}

function command-center {
    $commandGroups = Get-CommandGroups
    $groupNames = @($commandGroups.Keys)

    Write-Host "Command Center" -ForegroundColor Cyan
    Write-Host "Select a batch operation:" -ForegroundColor Cyan

    for ($index = 0; $index -lt $groupNames.Count; $index++) {
        $menuNumber = $index + 1
        Write-Host "$menuNumber. $($groupNames[$index])"
    }

    Write-Host "Q. Quit"
    $choice = Read-Host "Enter your choice"

    if ($choice -match '^[Qq]$') {
        Write-Host "Exiting..." -ForegroundColor Yellow
        return
    }

    $selection = $choice -as [int]
    if (-not $selection -or $selection -lt 1 -or $selection -gt $groupNames.Count) {
        Write-Host "Invalid choice." -ForegroundColor Red
        return
    }

    $groupName = $groupNames[$selection - 1]
    $commands = $commandGroups[$groupName]

    try {
        mass-execute -Commands $commands -GroupName $groupName
    } catch {
        Write-Error "Batch '$groupName' failed. Review output above for details."
        exit 1
    }
}

if ($MyInvocation.InvocationName -ne '.') {
    command-center
}
