function quick-recall {
    $history = Get-History | Sort-Object Id

    if (-not $history) {
        Write-Host "No history available in this session." -ForegroundColor Yellow
        return
    }

    $history | ForEach-Object {
        "{0,5}  {1}" -f $_.Id, $_.CommandLine
    }

    $commandId = Read-Host "Enter the command ID to run"
    if ($commandId) {
        Invoke-History -Id $commandId
    }
}
