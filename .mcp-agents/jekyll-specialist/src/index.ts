#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { auditIncludes } from './tools/audit-includes.js';
import { findDuplicates } from './tools/find-duplicates.js';
import { mergeIncludes } from './tools/merge-includes.js';
import { updateReferences } from './tools/update-references.js';
import { validateNaming } from './tools/validate-naming.js';

const server = new Server(
  {
    name: 'tillerstead-jekyll-specialist',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'audit_includes',
      description: 'Audit all Jekyll includes for duplicates, unused files, and naming violations',
      inputSchema: {
        type: 'object',
        properties: {
          rootPath: {
            type: 'string',
            description: 'Root path of Tillerstead.com repository',
          },
          detailed: {
            type: 'boolean',
            description: 'Include detailed analysis in results',
            default: false,
          },
        },
        required: ['rootPath'],
      },
    },
    {
      name: 'find_duplicates',
      description: 'Find duplicate include files by content hash',
      inputSchema: {
        type: 'object',
        properties: {
          rootPath: {
            type: 'string',
            description: 'Root path of Tillerstead.com repository',
          },
          threshold: {
            type: 'number',
            description: 'Similarity threshold (0-100)',
            default: 100,
          },
        },
        required: ['rootPath'],
      },
    },
    {
      name: 'merge_includes',
      description: 'Merge duplicate includes into canonical version and update all references',
      inputSchema: {
        type: 'object',
        properties: {
          rootPath: {
            type: 'string',
            description: 'Root path of Tillerstead.com repository',
          },
          hash: {
            type: 'string',
            description: 'Hash of duplicate group to merge',
          },
          dryRun: {
            type: 'boolean',
            description: 'Preview changes without executing',
            default: true,
          },
        },
        required: ['rootPath', 'hash'],
      },
    },
    {
      name: 'update_references',
      description: 'Update all references to an include file',
      inputSchema: {
        type: 'object',
        properties: {
          rootPath: {
            type: 'string',
            description: 'Root path of Tillerstead.com repository',
          },
          oldPath: {
            type: 'string',
            description: 'Old include path (relative to _includes/)',
          },
          newPath: {
            type: 'string',
            description: 'New include path (relative to _includes/)',
          },
          dryRun: {
            type: 'boolean',
            description: 'Preview changes without executing',
            default: true,
          },
        },
        required: ['rootPath', 'oldPath', 'newPath'],
      },
    },
    {
      name: 'validate_naming',
      description: 'Validate include file naming conventions',
      inputSchema: {
        type: 'object',
        properties: {
          rootPath: {
            type: 'string',
            description: 'Root path of Tillerstead.com repository',
          },
          fix: {
            type: 'boolean',
            description: 'Automatically fix naming violations',
            default: false,
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
      case 'audit_includes':
        result = await auditIncludes(args.rootPath as string, args.detailed as boolean);
        break;
      
      case 'find_duplicates':
        result = await findDuplicates(args.rootPath as string, args.threshold as number);
        break;
      
      case 'merge_includes':
        result = await mergeIncludes(args.rootPath as string, args.hash as string, args.dryRun as boolean);
        break;
      
      case 'update_references':
        result = await updateReferences(args.rootPath as string, args.oldPath as string, args.newPath as string, args.dryRun as boolean);
        break;
      
      case 'validate_naming':
        result = await validateNaming(args.rootPath as string, args.fix as boolean);
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
  console.error('Tillerstead Jekyll Specialist MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
