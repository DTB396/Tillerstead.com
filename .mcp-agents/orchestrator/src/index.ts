#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { runFullAudit } from './tools/run-full-audit.js';
import { deployFeature } from './tools/deploy-feature.js';
import { generateReport } from './tools/generate-report.js';

const server = new Server(
  {
    name: 'tillerstead-orchestrator',
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
      name: 'run_full_audit',
      description: 'Run comprehensive site audit (includes + SEO + performance + accessibility)',
      inputSchema: {
        type: 'object',
        properties: {
          rootPath: {
            type: 'string',
            description: 'Root path of Tillerstead.com repository',
          },
          url: {
            type: 'string',
            description: 'URL to audit (optional, for performance checks)',
          },
        },
        required: ['rootPath'],
      },
    },
    {
      name: 'deploy_feature',
      description: 'Deploy new feature (code + tests + docs + validation)',
      inputSchema: {
        type: 'object',
        properties: {
          rootPath: {
            type: 'string',
            description: 'Root path of Tillerstead.com repository',
          },
          featureName: {
            type: 'string',
            description: 'Name of feature to deploy',
          },
          components: {
            type: 'array',
            description: 'Component files to create',
          },
        },
        required: ['rootPath', 'featureName'],
      },
    },
    {
      name: 'generate_report',
      description: 'Generate comprehensive markdown report from audit results',
      inputSchema: {
        type: 'object',
        properties: {
          rootPath: {
            type: 'string',
            description: 'Root path of Tillerstead.com repository',
          },
          auditResults: {
            type: 'object',
            description: 'Combined audit results from all agents',
          },
          outputPath: {
            type: 'string',
            description: 'Path to save report',
          },
        },
        required: ['rootPath', 'auditResults'],
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
      case 'run_full_audit':
        result = await runFullAudit(args.rootPath as string, args.url as string | undefined);
        break;
      
      case 'deploy_feature':
        result = await deployFeature(args.rootPath as string, args.featureName as string, args.components as any[] | undefined);
        break;
      
      case 'generate_report':
        result = await generateReport(args.rootPath as string, args.auditResults as any, args.outputPath as string | undefined);
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
  console.error('Tillerstead Orchestrator MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
