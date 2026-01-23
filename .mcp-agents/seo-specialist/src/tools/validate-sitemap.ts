import { readFile } from 'fs/promises';
import { join } from 'path';
import { JSDOM } from 'jsdom';
import { formatTimestamp } from '@tillerstead/shared';
import type { AgentResult } from '@tillerstead/shared';

interface SitemapValidation {
  valid: boolean;
  urls: string[];
  issues: string[];
}

export async function validateSitemap(rootPath: string): Promise<AgentResult<SitemapValidation>> {
  try {
    const sitemapPath = join(rootPath, 'sitemap.xml');
    const content = await readFile(sitemapPath, 'utf-8');
    const dom = new JSDOM(content, { contentType: 'text/xml' });
    const document = dom.window.document;
    
    const urls: string[] = [];
    const issues: string[] = [];
    
    const urlElements = document.querySelectorAll('url loc');
    
    for (const loc of Array.from(urlElements)) {
      const url = loc.textContent?.trim();
      if (url) {
        urls.push(url);
        
        // Validate URL format
        if (!url.startsWith('https://')) {
          issues.push(`URL not HTTPS: ${url}`);
        }
        
        if (!url.includes('tillerstead.com')) {
          issues.push(`URL not from tillerstead.com domain: ${url}`);
        }
      }
    }
    
    if (urls.length === 0) {
      issues.push('No URLs found in sitemap');
    }
    
    return {
      success: true,
      data: {
        valid: issues.length === 0,
        urls,
        issues,
      },
      warnings: issues.length > 0 ? [`${issues.length} sitemap issues found`] : undefined,
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
