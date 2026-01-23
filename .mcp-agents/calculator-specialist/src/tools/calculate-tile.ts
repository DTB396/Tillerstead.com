import { formatTimestamp } from '@tillerstead/shared';
import type { AgentResult } from '@tillerstead/shared';

interface TileCalculation {
  areaSquareFeet: number;
  tileSizeInches: number;
  tilesRequired: number;
  boxesRequired: number;
  wasteFactor: number;
  totalTiles: number;
  groutRequired: string;
}

export async function calculateTile(
  length: number,
  width: number,
  tileSize: number,
  wasteFactor = 10
): Promise<AgentResult<TileCalculation>> {
  try {
    const areaSquareFeet = length * width;
    const tileSizeSquareFeet = (tileSize * tileSize) / 144; // Convert sq inches to sq feet
    const tilesRequired = Math.ceil(areaSquareFeet / tileSizeSquareFeet);
    const wasteMultiplier = 1 + (wasteFactor / 100);
    const totalTiles = Math.ceil(tilesRequired * wasteMultiplier);
    const tilesPerBox = 12; // Standard, can be configurable
    const boxesRequired = Math.ceil(totalTiles / tilesPerBox);
    
    // Grout calculation (simplified)
    const groutBagsNeeded = Math.ceil(areaSquareFeet / 100); // 1 bag per 100 sq ft
    const groutRequired = `${groutBagsNeeded} bag${groutBagsNeeded > 1 ? 's' : ''}`;
    
    const calculation: TileCalculation = {
      areaSquareFeet,
      tileSizeInches: tileSize,
      tilesRequired,
      boxesRequired,
      wasteFactor,
      totalTiles,
      groutRequired,
    };
    
    return {
      success: true,
      data: calculation,
      timestamp: formatTimestamp(),
    };
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : String(error)],
      timestamp: formatTimestamp(),
    };
  }
}
