#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { validateMetaTags } from './tools/validate-meta-tags.js';
import { generateSchema } from './tools/generate-schema.js';
import { optimizeImages } from './tools/optimize-images.js';
import { checkPerformance } from './tools/check-performance.js';
import { validateSitemap } from './tools/validate-sitemap.js';

const server = new Server(
  {
    name: 'tillerstead-seo-specialist',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'validate_meta_tags',
      description: 'Validate SEO meta tags (title, description, OG, Twitter) for all pages',
      inputSchema: {
        type: 'object',
        properties: {
          rootPath: {
            type: 'string',
            description: 'Root path of Tillerstead.com repository',
          },
          page: {
            type: 'string',
            description: 'Specific page to validate (optional)',
          },
        },
        required: ['rootPath'],
      },
    },
    {
      name: 'generate_schema',
      description: 'Generate JSON-LD structured data (LocalBusiness, Organization, Service, BreadcrumbList)',
      inputSchema: {
        type: 'object',
        properties: {
          rootPath: {
            type: 'string',
            description: 'Root path of Tillerstead.com repository',
          },
          schemaType: {
            type: 'string',
            enum: ['LocalBusiness', 'Organization', 'Service', 'BreadcrumbList', 'FAQPage', 'Product'],
            description: 'Type of schema to generate',
          },
          page: {
            type: 'string',
            description: 'Page to generate schema for',
          },
        },
        required: ['rootPath', 'schemaType', 'page'],
      },
    },
    {
      name: 'optimize_images',
      description: 'Optimize images (WebP conversion, lazy loading, srcset, compression)',
      inputSchema: {
        type: 'object',
        properties: {
          rootPath: {
            type: 'string',
            description: 'Root path of Tillerstead.com repository',
          },
          dryRun: {
            type: 'boolean',
            description: 'Preview optimizations without applying',
            default: true,
          },
        },
        required: ['rootPath'],
      },
    },
    {
      name: 'check_performance',
      description: 'Check Core Web Vitals (LCP, FCP, CLS, TTI) using Lighthouse',
      inputSchema: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'URL to check (local or production)',
          },
          device: {
            type: 'string',
            enum: ['mobile', 'desktop'],
            description: 'Device type for testing',
            default: 'mobile',
          },
        },
        required: ['url'],
      },
    },
    {
      name: 'validate_sitemap',
      description: 'Validate sitemap.xml structure and URLs',
      inputSchema: {
        type: 'object',
        properties: {
          rootPath: {
            type: 'string',
            description: 'Root path of Tillerstead.com repository',
          },
        },
        required: ['rootPath'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (!args) {
      throw new Error('Missing arguments');
    }

    let result;
    switch (name) {
      case 'validate_meta_tags':
        result = await validateMetaTags(args.rootPath as string, args.page as string | undefined);
        break;
      
      case 'generate_schema':
        result = await generateSchema(args.rootPath as string, args.schemaType as string, args.page as string);
        break;
      
      case 'optimize_images':
        result = await optimizeImages(args.rootPath as string, args.dryRun as boolean);
        break;
      
      case 'check_performance':
        result = await checkPerformance(args.url as string, args.device as 'mobile' | 'desktop');
        break;
      
      case 'validate_sitemap':
        result = await validateSitemap(args.rootPath as string);
        break;
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Tillerstead SEO Specialist MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
