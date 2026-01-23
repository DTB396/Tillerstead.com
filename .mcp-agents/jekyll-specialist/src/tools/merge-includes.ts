import { rename, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { formatTimestamp } from '@tillerstead/shared';
import type { AgentResult } from '@tillerstead/shared';
import { findDuplicates } from './find-duplicates.js';
import { updateReferences } from './update-references.js';

interface MergeResult {
  canonical: string;
  merged: string[];
  updated: string[];
}

export async function mergeIncludes(
  rootPath: string,
  hash: string,
  dryRun = true
): Promise<AgentResult<MergeResult>> {
  try {
    const duplicatesResult = await findDuplicates(rootPath);
    
    if (!duplicatesResult.success || !duplicatesResult.data) {
      return {
        success: false,
        errors: ['Failed to find duplicates'],
        timestamp: formatTimestamp(),
      };
    }
    
    const duplicateGroup = duplicatesResult.data.find(d => d.hash === hash);
    
    if (!duplicateGroup) {
      return {
        success: false,
        errors: [`No duplicate group found with hash: ${hash}`],
        timestamp: formatTimestamp(),
      };
    }
    
    const canonical = duplicateGroup.canonical;
    const redundant = duplicateGroup.redundant;
    const merged: string[] = [];
    const updated: string[] = [];
    
    if (dryRun) {
      return {
        success: true,
        data: {
          canonical: canonical.relativePath,
          merged: redundant.map(r => r.relativePath),
          updated: [],
        },
        warnings: ['DRY RUN - No changes made'],
        timestamp: formatTimestamp(),
      };
    }
    
    // Update all references to point to canonical
    for (const file of redundant) {
      const updateResult = await updateReferences(
        rootPath,
        file.relativePath,
        canonical.relativePath,
        false
      );
      
      if (updateResult.success && updateResult.data) {
        updated.push(...updateResult.data.updated);
      }
      
      // Archive the redundant file
      const archivePath = join(
        rootPath,
        'archive',
        'includes-merged',
        new Date().toISOString().split('T')[0],
        file.relativePath
      );
      
      await mkdir(dirname(archivePath), { recursive: true });
      await rename(file.path, archivePath);
      merged.push(file.relativePath);
    }
    
    return {
      success: true,
      data: {
        canonical: canonical.relativePath,
        merged,
        updated,
      },
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
