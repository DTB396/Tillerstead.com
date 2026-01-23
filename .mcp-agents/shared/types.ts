/**
 * Shared types for all Tillerstead MCP agents
 */

export interface TillersteadConfig {
  rootPath: string;
  includesPath: string;
  dataPath: string;
  layoutsPath: string;
  assetsPath: string;
  sassPath: string;
}

export interface IncludeFile {
  path: string;
  relativePath: string;
  category: 'layout' | 'navigation' | 'sections' | 'components' | 'schema' | 'forms' | 'content' | 'other';
  hash: string;
  size: number;
  references: string[];
}

export interface IncludeDuplicate {
  hash: string;
  files: IncludeFile[];
  canonical: IncludeFile;
  redundant: IncludeFile[];
}

export interface AuditResult {
  totalIncludes: number;
  duplicates: IncludeDuplicate[];
  unused: IncludeFile[];
  orphaned: IncludeFile[];
  warnings: string[];
}

export interface SEOMetaTags {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

export interface PerformanceMetrics {
  lcp: number;
  fcp: number;
  cls: number;
  tti: number;
  speedIndex: number;
}

export interface AccessibilityIssue {
  type: 'error' | 'warning' | 'notice';
  wcagLevel: 'A' | 'AA' | 'AAA';
  criterion: string;
  element?: string;
  message: string;
  fix?: string;
}

export interface DesignToken {
  name: string;
  value: string;
  category: 'color' | 'spacing' | 'typography' | 'shadow' | 'radius' | 'other';
  usage: string[];
}

export interface AgentResult<T = any> {
  success: boolean;
  data?: T;
  errors?: string[];
  warnings?: string[];
  timestamp: string;
}
