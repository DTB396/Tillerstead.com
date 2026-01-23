import { formatTimestamp } from '@tillerstead/shared';
import type { AgentResult } from '@tillerstead/shared';

export async function exportCalculation(
  calculation: any,
  format: 'json' | 'pdf' | 'csv' = 'json'
): Promise<AgentResult<string>> {
  try {
    let exported: string;
    
    switch (format) {
      case 'json':
        exported = JSON.stringify(calculation, null, 2);
        break;
      
      case 'csv':
        const keys = Object.keys(calculation);
        const values = Object.values(calculation);
        exported = `${keys.join(',')}\n${values.join(',')}`;
        break;
      
      case 'pdf':
        exported = 'PDF generation requires additional library';
        break;
      
      default:
        throw new Error(`Unknown format: ${format}`);
    }
    
    return {
      success: true,
      data: exported,
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
