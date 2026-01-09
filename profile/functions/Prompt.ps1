function Get-GitBranchName {
    $branch = git rev-parse --abbrev-ref HEAD 2>$null
    if ($LASTEXITCODE -ne 0) {
        return $null
    }

    if ($branch -eq "HEAD") {
        return $null
    }

    return $branch
}

function prompt {
    $currentPath = (Get-Location).Path
    $branchName = Get-GitBranchName

    Write-Host "[" -NoNewline -ForegroundColor DarkGray
    Write-Host $currentPath -NoNewline -ForegroundColor Cyan

    if ($branchName) {
        Write-Host " ($branchName)" -NoNewline -ForegroundColor Yellow
    }

    Write-Host "]" -NoNewline -ForegroundColor DarkGray
    return " > "
}
