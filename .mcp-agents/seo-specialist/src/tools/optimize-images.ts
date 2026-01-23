import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { formatTimestamp } from '@tillerstead/shared';
import type { AgentResult } from '@tillerstead/shared';

interface ImageOptimization {
  file: string;
  currentSize: number;
  format: string;
  recommendations: string[];
}

export async function optimizeImages(
  rootPath: string,
  dryRun = true
): Promise<AgentResult<ImageOptimization[]>> {
  try {
    const assetsPath = join(rootPath, 'assets', 'img');
    const images = await findImages(assetsPath);
    const optimizations: ImageOptimization[] = [];
    
    for (const image of images) {
      const stats = await stat(image);
      const recommendations: string[] = [];
      const ext = image.toLowerCase().split('.').pop() || '';
      
      // Check if WebP conversion recommended
      if (['jpg', 'jpeg', 'png'].includes(ext)) {
        recommendations.push('Convert to WebP format for better compression');
      }
      
      // Check file size
      if (stats.size > 500 * 1024) {
        recommendations.push(`Large file size (${Math.round(stats.size / 1024)}KB) - consider compression`);
      }
      
      // Check if lazy loading is applied (would need to check HTML)
      recommendations.push('Ensure loading="lazy" attribute is set');
      
      // Check if srcset is defined
      recommendations.push('Consider adding srcset for responsive images');
      
      optimizations.push({
        file: image.replace(rootPath, ''),
        currentSize: stats.size,
        format: ext.toUpperCase(),
        recommendations,
      });
    }
    
    return {
      success: true,
      data: optimizations,
      warnings: dryRun ? ['DRY RUN - No optimizations applied'] : undefined,
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

async function findImages(dir: string): Promise<string[]> {
  const images: string[] = [];
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        images.push(...(await findImages(fullPath)));
      } else if (entry.isFile()) {
        const ext = '.' + entry.name.toLowerCase().split('.').pop();
        if (imageExtensions.includes(ext)) {
          images.push(fullPath);
        }
      }
    }
  } catch {
    // Directory not accessible
  }
  
  return images;
}
