import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { getDefaultConfig, hashFile, categorizeInclude, extractIncludeReferences, formatTimestamp } from '@tillerstead/shared';
import type { IncludeFile, AuditResult, AgentResult } from '@tillerstead/shared';

export async function auditIncludes(rootPath: string, _detailed = false): Promise<AgentResult<AuditResult>> {
  const config = getDefaultConfig(rootPath);
  const includes: IncludeFile[] = [];
  const hashMap = new Map<string, IncludeFile[]>();
  
  try {
    // Scan all include files
    const files = await scanDirectory(config.includesPath);
    
    for (const file of files) {
      const relativePath = file.replace(config.includesPath + '\\', '');
      const hash = await hashFile(file);
      const category = categorizeInclude(relativePath);
      
      const includeFile: IncludeFile = {
        path: file,
        relativePath,
        category: category as any,
        hash,
        size: (await readFile(file)).length,
        references: [],
      };
      
      includes.push(includeFile);
      
      if (!hashMap.has(hash)) {
        hashMap.set(hash, []);
      }
      hashMap.get(hash)!.push(includeFile);
    }
    
    // Find references
    const allFiles = [
      ...(await scanDirectory(config.layoutsPath, '.html')),
      ...(await scanDirectory(config.includesPath, '.html')),
      ...(await scanDirectory(rootPath, '.html', 1)),
      ...(await scanDirectory(rootPath, '.md', 1)),
    ];
    
    for (const file of allFiles) {
      const content = await readFile(file, 'utf-8');
      const refs = extractIncludeReferences(content);
      
      for (const ref of refs) {
        const include = includes.find(i => 
          i.relativePath === ref || i.relativePath.endsWith('/' + ref)
        );
        if (include) {
          include.references.push(file);
        }
      }
    }
    
    // Find duplicates
    const duplicates = Array.from(hashMap.values())
      .filter(group => group.length > 1)
      .map(group => {
        const sorted = group.sort((a, b) => {
          const scoreA = calculateScore(a.relativePath);
          const scoreB = calculateScore(b.relativePath);
          return scoreB - scoreA;
        });
        
        return {
          hash: group[0].hash,
          files: group,
          canonical: sorted[0],
          redundant: sorted.slice(1),
        };
      });
    
    // Find unused
    const unused = includes.filter(i => i.references.length === 0);
    
    const result: AuditResult = {
      totalIncludes: includes.length,
      duplicates,
      unused,
      orphaned: [],
      warnings: [],
    };
    
    return {
      success: true,
      data: result,
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
    // Directory doesn't exist or not accessible
  }
  
  return files;
}

function calculateScore(path: string): number {
  let score = 0;
  const lower = path.toLowerCase();
  
  if (lower.includes('components')) score += 50;
  if (lower.includes('sections')) score += 40;
  if (lower.includes('navigation')) score += 35;
  if (lower.includes('backup')) score -= 100;
  if (lower.includes('old')) score -= 80;
  
  return score;
}
