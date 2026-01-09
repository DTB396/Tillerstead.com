function show-system-info {
    $user = $env:USERNAME
    $computer = $env:COMPUTERNAME
    $bootTime = (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
    $uptime = (Get-Date) - $bootTime

    Write-Host "User: $user" -ForegroundColor Green
    Write-Host "Computer: $computer" -ForegroundColor Green
    Write-Host ("Uptime: {0:dd\:hh\:mm\:ss}" -f $uptime) -ForegroundColor Green
}
