import { readdir } from 'fs/promises';
import { join } from 'path';
import { getDefaultConfig, validateIncludeName, formatTimestamp } from '@tillerstead/shared';
import type { AgentResult } from '@tillerstead/shared';

interface ValidationResult {
  valid: Array<{ path: string; message: string }>;
  invalid: Array<{ path: string; message: string }>;
}

export async function validateNaming(
  rootPath: string,
  _fix = false
): Promise<AgentResult<ValidationResult>> {
  const config = getDefaultConfig(rootPath);
  const valid: Array<{ path: string; message: string }> = [];
  const invalid: Array<{ path: string; message: string }> = [];
  
  try {
    const files = await scanDirectory(config.includesPath);
    
    for (const file of files) {
      const relativePath = file.replace(config.includesPath + '\\', '');
      const validation = validateIncludeName(relativePath);
      
      if (validation.valid) {
        valid.push({ path: relativePath, message: 'OK' });
      } else {
        invalid.push({ 
          path: relativePath, 
          message: validation.message || 'Invalid naming' 
        });
      }
    }
    
    return {
      success: true,
      data: { valid, invalid },
      warnings: invalid.length > 0 ? [`${invalid.length} naming violations found`] : undefined,
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

async function scanDirectory(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        files.push(...(await scanDirectory(fullPath)));
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        files.push(fullPath);
      }
    }
  } catch {
    // Directory doesn't exist
  }
  
  return files;
}
