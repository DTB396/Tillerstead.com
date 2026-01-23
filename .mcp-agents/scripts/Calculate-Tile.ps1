<#
.SYNOPSIS
    Calculate tile requirements for a project

.DESCRIPTION
    Calculates the number of tiles, boxes, and grout needed for a tiling project.

.PARAMETER Length
    Length in feet

.PARAMETER Width
    Width in feet

.PARAMETER TileSize
    Tile size in inches

.PARAMETER WasteFactor
    Waste factor percentage (default: 10)

.EXAMPLE
    .\Calculate-Tile.ps1 -Length 10 -Width 12 -TileSize 12 -WasteFactor 10
#>

param(
    [Parameter(Mandatory=$true)]
    [decimal]$Length,
    
    [Parameter(Mandatory=$true)]
    [decimal]$Width,
    
    [Parameter(Mandatory=$true)]
    [int]$TileSize,
    
    [int]$WasteFactor = 10
)

$ErrorActionPreference = "Stop"

Write-Host "🧮 Tile Calculator" -ForegroundColor Cyan
Write-Host "=" * 60

# Calculate area
$areaSquareFeet = $Length * $Width
Write-Host "`n📏 Dimensions:" -ForegroundColor Yellow
Write-Host "  Length: $Length ft"
Write-Host "  Width: $Width ft"
Write-Host "  Area: $areaSquareFeet sq ft"

# Calculate tile requirements
$tileSizeSquareFeet = ($TileSize * $TileSize) / 144  # Convert sq inches to sq feet
$tilesRequired = [Math]::Ceiling($areaSquareFeet / $tileSizeSquareFeet)
$wasteMultiplier = 1 + ($WasteFactor / 100)
$totalTiles = [Math]::Ceiling($tilesRequired * $wasteMultiplier)

Write-Host "`n🔲 Tile Requirements:" -ForegroundColor Yellow
Write-Host "  Tile Size: $TileSize x $TileSize inches"
Write-Host "  Tiles (no waste): $tilesRequired"
Write-Host "  Waste Factor: $WasteFactor%"
Write-Host "  Total Tiles Needed: $totalTiles" -ForegroundColor Green

# Calculate boxes
$tilesPerBox = 12  # Standard
$boxesRequired = [Math]::Ceiling($totalTiles / $tilesPerBox)
Write-Host "  Boxes Required: $boxesRequired (@ $tilesPerBox tiles/box)" -ForegroundColor Green

# Calculate grout
$groutBagsNeeded = [Math]::Ceiling($areaSquareFeet / 100)  # 1 bag per 100 sq ft
Write-Host "`n🪣 Grout Requirements:" -ForegroundColor Yellow
Write-Host "  Bags Needed: $groutBagsNeeded (@ 1 bag per 100 sq ft)" -ForegroundColor Green

# Cost estimate (placeholder - update with actual pricing)
$tilePrice = 2.50  # per tile
$groutPrice = 15.00  # per bag
$totalCost = ($totalTiles * $tilePrice) + ($groutBagsNeeded * $groutPrice)

Write-Host "`n💰 Cost Estimate:" -ForegroundColor Yellow
Write-Host "  Tiles: `$$([Math]::Round($totalTiles * $tilePrice, 2))"
Write-Host "  Grout: `$$([Math]::Round($groutBagsNeeded * $groutPrice, 2))"
Write-Host "  Total: `$$([Math]::Round($totalCost, 2))" -ForegroundColor Green

# Export results
$results = @{
    Timestamp = Get-Date -Format 'o'
    Dimensions = @{
        Length = $Length
        Width = $Width
        AreaSquareFeet = $areaSquareFeet
    }
    Tile = @{
        SizeInches = $TileSize
        TilesRequired = $tilesRequired
        WasteFactor = $WasteFactor
        TotalTiles = $totalTiles
        BoxesRequired = $boxesRequired
    }
    Grout = @{
        BagsNeeded = $groutBagsNeeded
    }
    CostEstimate = @{
        TileCost = [Math]::Round($totalTiles * $tilePrice, 2)
        GroutCost = [Math]::Round($groutBagsNeeded * $groutPrice, 2)
        Total = [Math]::Round($totalCost, 2)
    }
}

Write-Host "`n📋 Calculation Results:" -ForegroundColor Cyan
$results | ConvertTo-Json -Depth 5
