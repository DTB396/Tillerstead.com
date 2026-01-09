# List of common subfolders previously used in _includes
$subfolders = @(
    'layout/',
    'schema/',
    'build/',
    'partials/',
    'components/'
)

# File types to scan
$fileTypes = @('*.html', '*.md', '*.liquid', '*.scss')

# Get repo root
$repoRoot = Get-Location

# For each file type, recursively find and update include statements
foreach ($type in $fileTypes) {
    Get-ChildItem -Path $repoRoot -Recurse -Include $type | ForEach-Object {
        $file = $_.FullName
        $content = Get-Content $file -Raw
        $newContent = $content

        foreach ($folder in $subfolders) {
            # Replace {% include folder/filename.html %} with {% include filename.html %}
            $pattern = [regex]::Escape($folder)
            $newContent = $newContent -replace "include\s+$pattern", "include "
        }

        if ($newContent -ne $content) {
            Set-Content $file $newContent
            Write-Host "Updated includes in $file"
        }
    }
}

Write-Host "All include statements updated to match flat _includes structure."