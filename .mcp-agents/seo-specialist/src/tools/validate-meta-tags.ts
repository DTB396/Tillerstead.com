import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { JSDOM } from 'jsdom';
import { formatTimestamp, TILLERSTEAD_CONSTANTS } from '@tillerstead/shared';
import type { SEOMetaTags, AgentResult } from '@tillerstead/shared';

interface PageValidation {
  page: string;
  valid: boolean;
  tags: SEOMetaTags;
  issues: string[];
}

export async function validateMetaTags(
  rootPath: string,
  page?: string
): Promise<AgentResult<PageValidation[]>> {
  try {
    const results: PageValidation[] = [];
    const pages = page ? [page] : await findHTMLPages(rootPath);
    
    for (const pagePath of pages) {
      const fullPath = page ? join(rootPath, pagePath) : pagePath;
      const content = await readFile(fullPath, 'utf-8');
      const dom = new JSDOM(content);
      const document = dom.window.document;
      
      const tags: SEOMetaTags = {
        title: document.querySelector('title')?.textContent || undefined,
        description: document.querySelector('meta[name="description"]')?.getAttribute('content') || undefined,
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || undefined,
        ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || undefined,
        ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content') || undefined,
        ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content') || undefined,
        ogUrl: document.querySelector('meta[property="og:url"]')?.getAttribute('content') || undefined,
        twitterCard: document.querySelector('meta[name="twitter:card"]')?.getAttribute('content') || undefined,
        twitterTitle: document.querySelector('meta[name="twitter:title"]')?.getAttribute('content') || undefined,
        twitterDescription: document.querySelector('meta[name="twitter:description"]')?.getAttribute('content') || undefined,
        twitterImage: document.querySelector('meta[name="twitter:image"]')?.getAttribute('content') || undefined,
      };
      
      const issues: string[] = [];
      
      // Validate title
      if (!tags.title) {
        issues.push('Missing <title> tag');
      } else {
        const titleLength = tags.title.length;
        if (titleLength < TILLERSTEAD_CONSTANTS.SEO.TITLE_LENGTH.min) {
          issues.push(`Title too short (${titleLength} < ${TILLERSTEAD_CONSTANTS.SEO.TITLE_LENGTH.min})`);
        }
        if (titleLength > TILLERSTEAD_CONSTANTS.SEO.TITLE_LENGTH.max) {
          issues.push(`Title too long (${titleLength} > ${TILLERSTEAD_CONSTANTS.SEO.TITLE_LENGTH.max})`);
        }
      }
      
      // Validate description
      if (!tags.description) {
        issues.push('Missing meta description');
      } else {
        const descLength = tags.description.length;
        if (descLength < TILLERSTEAD_CONSTANTS.SEO.DESCRIPTION_LENGTH.min) {
          issues.push(`Description too short (${descLength} < ${TILLERSTEAD_CONSTANTS.SEO.DESCRIPTION_LENGTH.min})`);
        }
        if (descLength > TILLERSTEAD_CONSTANTS.SEO.DESCRIPTION_LENGTH.max) {
          issues.push(`Description too long (${descLength} > ${TILLERSTEAD_CONSTANTS.SEO.DESCRIPTION_LENGTH.max})`);
        }
      }
      
      // Validate Open Graph
      if (!tags.ogTitle) issues.push('Missing og:title');
      if (!tags.ogDescription) issues.push('Missing og:description');
      if (!tags.ogImage) issues.push('Missing og:image');
      if (!tags.ogUrl) issues.push('Missing og:url');
      
      // Validate Twitter Card
      if (!tags.twitterCard) issues.push('Missing twitter:card');
      if (!tags.twitterTitle) issues.push('Missing twitter:title');
      if (!tags.twitterDescription) issues.push('Missing twitter:description');
      if (!tags.twitterImage) issues.push('Missing twitter:image');
      
      // Validate canonical
      if (!tags.canonical) issues.push('Missing canonical URL');
      
      results.push({
        page: pagePath,
        valid: issues.length === 0,
        tags,
        issues,
      });
    }
    
    return {
      success: true,
      data: results,
      warnings: results.filter(r => !r.valid).length > 0
        ? [`${results.filter(r => !r.valid).length} pages have SEO issues`]
        : undefined,
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

async function findHTMLPages(rootPath: string): Promise<string[]> {
  const pages: string[] = [];
  
  try {
    const entries = await readdir(rootPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.html')) {
        pages.push(join(rootPath, entry.name));
      }
    }
  } catch {
    // Directory not accessible
  }
  
  return pages;
}
