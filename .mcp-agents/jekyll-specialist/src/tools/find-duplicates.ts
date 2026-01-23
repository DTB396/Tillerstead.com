import { formatTimestamp } from '@tillerstead/shared';
import type { IncludeDuplicate, AgentResult } from '@tillerstead/shared';
import { auditIncludes } from './audit-includes.js';

export async function findDuplicates(
  rootPath: string,
  _threshold = 100
): Promise<AgentResult<IncludeDuplicate[]>> {
  try {
    const auditResult = await auditIncludes(rootPath, false);
    
    if (!auditResult.success || !auditResult.data) {
      return {
        success: false,
        errors: auditResult.errors || ['Failed to audit includes'],
        timestamp: formatTimestamp(),
      };
    }
    
    const duplicates = auditResult.data.duplicates;
    
    return {
      success: true,
      data: duplicates,
      warnings: duplicates.length === 0 ? ['No duplicates found'] : undefined,
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
