import { createHash } from 'crypto';
import { readFile, stat } from 'fs/promises';
import { join, sep } from 'path';
import type { TillersteadConfig } from './types.js';

/**
 * Get default Tillerstead project configuration
 */
export function getDefaultConfig(rootPath: string): TillersteadConfig {
  return {
    rootPath,
    includesPath: join(rootPath, '_includes'),
    dataPath: join(rootPath, '_data'),
    layoutsPath: join(rootPath, '_layouts'),
    assetsPath: join(rootPath, 'assets'),
    sassPath: join(rootPath, '_sass'),
  };
}

/**
 * Calculate SHA-256 hash of file contents
 */
export async function hashFile(filePath: string): Promise<string> {
  const content = await readFile(filePath, 'utf-8');
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Get file size in bytes
 */
export async function getFileSize(filePath: string): Promise<number> {
  const stats = await stat(filePath);
  return stats.size;
}

/**
 * Categorize include file based on path
 */
export function categorizeInclude(relativePath: string): string {
  const parts = relativePath.split(sep);
  
  if (parts.includes('layout')) return 'layout';
  if (parts.includes('navigation')) return 'navigation';
  if (parts.includes('sections')) return 'sections';
  if (parts.includes('components')) return 'components';
  if (parts.includes('schema')) return 'schema';
  if (parts.includes('forms')) return 'forms';
  if (parts.includes('content')) return 'content';
  
  return 'other';
}

/**
 * Calculate canonical score for include file
 * Higher score = better candidate for canonical version
 */
export function calculateCanonicalScore(relativePath: string): number {
  let score = 0;
  const pathLower = relativePath.toLowerCase();
  const parts = relativePath.split(sep);
  
  // Preferred folders
  if (pathLower.includes('components')) score += 50;
  if (pathLower.includes('sections') || pathLower.includes('layout')) score += 40;
  if (pathLower.includes('navigation')) score += 35;
  if (pathLower.includes('forms') || pathLower.includes('schema')) score += 30;
  
  // Shorter path depth is better
  score += (5 - parts.length) * 10;
  
  // Penalized patterns
  if (pathLower.includes('backup') || pathLower.includes('old') || 
      pathLower.includes('temp') || pathLower.includes('archive')) score -= 100;
  if (pathLower.includes('deprecated')) score -= 90;
  if (pathLower.includes('legacy')) score -= 85;
  if (pathLower.includes('copy')) score -= 80;
  if (/\d{4}-\d{2}/.test(pathLower)) score -= 70; // Date patterns
  if (/v\d+/.test(pathLower)) score -= 60; // Version numbers
  if (pathLower.startsWith('_')) score -= 20;
  
  return score;
}

/**
 * Extract include references from file content
 */
export function extractIncludeReferences(content: string): string[] {
  const references: string[] = [];
  
  // Match {% include "file.html" %}, {% include 'file.html' %}, {% include file.html %}
  const includePattern = /\{%\s*include\s+["']?([^"'\s%]+)["']?\s*%\}/g;
  let match;
  
  while ((match = includePattern.exec(content)) !== null) {
    references.push(match[1]);
  }
  
  // Match {% include_relative file.html %}
  const relativePattern = /\{%\s*include_relative\s+["']?([^"'\s%]+)["']?\s*%\}/g;
  while ((match = relativePattern.exec(content)) !== null) {
    references.push(match[1]);
  }
  
  return [...new Set(references)];
}

/**
 * Validate include naming convention
 */
export function validateIncludeName(relativePath: string): { valid: boolean; message?: string } {
  const fileName = relativePath.split(sep).pop() || '';
  const category = categorizeInclude(relativePath);
  
  // Check naming conventions
  if (category === 'sections' && !fileName.startsWith('section-')) {
    return { valid: false, message: `Section files should start with 'section-': ${fileName}` };
  }
  
  if (category === 'components' && !fileName.startsWith('c-')) {
    return { valid: false, message: `Component files should start with 'c-': ${fileName}` };
  }
  
  if (category === 'schema' && !fileName.startsWith('schema-')) {
    return { valid: false, message: `Schema files should start with 'schema-': ${fileName}` };
  }
  
  if (category === 'layout' && !fileName.startsWith('page-') && !fileName.includes('header') && 
      !fileName.includes('footer') && !fileName.includes('sidebar')) {
    return { valid: false, message: `Layout files should start with 'page-' or be header/footer/sidebar: ${fileName}` };
  }
  
  return { valid: true };
}

/**
 * Format timestamp for logging
 */
export function formatTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Create backup path with timestamp
 */
export function createBackupPath(originalPath: string, timestamp?: string): string {
  const ts = timestamp || new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const parts = originalPath.split(sep);
  const fileName = parts.pop();
  return join(...parts, `${fileName}.backup-${ts}`);
}
