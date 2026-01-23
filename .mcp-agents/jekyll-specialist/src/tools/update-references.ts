import { readFile, writeFile } from 'fs/promises';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { getDefaultConfig, formatTimestamp } from '@tillerstead/shared';
import type { AgentResult } from '@tillerstead/shared';

interface UpdateResult {
  updated: string[];
  skipped: string[];
}

export async function updateReferences(
  rootPath: string,
  oldPath: string,
  newPath: string,
  dryRun = true
): Promise<AgentResult<UpdateResult>> {
  const config = getDefaultConfig(rootPath);
  const updated: string[] = [];
  const skipped: string[] = [];
  
  try {
    const filesToCheck = [
      ...(await scanDirectory(config.layoutsPath, '.html')),
      ...(await scanDirectory(config.includesPath, '.html')),
      ...(await scanDirectory(rootPath, '.html', 1)),
      ...(await scanDirectory(rootPath, '.md', 1)),
    ];
    
    for (const file of filesToCheck) {
      const content = await readFile(file, 'utf-8');
      
      // Match various include patterns
      const patterns = [
        new RegExp(`\\{%\\s*include\\s+"${oldPath}"`, 'g'),
        new RegExp(`\\{%\\s*include\\s+'${oldPath}'`, 'g'),
        new RegExp(`\\{%\\s*include\\s+${oldPath}`, 'g'),
      ];
      
      let modified = content;
      let hasChanges = false;
      
      for (const pattern of patterns) {
        if (pattern.test(modified)) {
          modified = modified.replace(
            pattern,
            (match) => match.replace(oldPath, newPath)
          );
          hasChanges = true;
        }
      }
      
      if (hasChanges) {
        if (!dryRun) {
          await writeFile(file, modified, 'utf-8');
        }
        updated.push(file);
      } else {
        skipped.push(file);
      }
    }
    
    return {
      success: true,
      data: { updated, skipped },
      warnings: dryRun ? ['DRY RUN - No files modified'] : undefined,
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

async function scanDirectory(dir: string, ext?: string, depth = 999): Promise<string[]> {
  const files: string[] = [];
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory() && depth > 0) {
        files.push(...(await scanDirectory(fullPath, ext, depth - 1)));
      } else if (entry.isFile()) {
        if (!ext || entry.name.endsWith(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch {
    // Directory doesn't exist
  }
  
  return files;
}
