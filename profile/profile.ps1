$profileRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$functionsPath = Join-Path $profileRoot "functions"

Get-ChildItem -Path $functionsPath -Filter "*.ps1" | ForEach-Object {
    . $_.FullName
}

show-system-info
