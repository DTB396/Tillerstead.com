#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { updatePresets } from './tools/update-presets.js';
import { calculateTile } from './tools/calculate-tile.js';
import { exportCalculation } from './tools/export-calculation.js';

const server = new Server(
  {
    name: 'tillerstead-calculator-specialist',
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
      name: 'update_presets',
      description: 'Update TILE_PRESETS data in tools.js',
      inputSchema: {
        type: 'object',
        properties: {
          rootPath: {
            type: 'string',
            description: 'Root path of Tillerstead.com repository',
          },
          presets: {
            type: 'array',
            description: 'Array of tile presets to add/update',
          },
        },
        required: ['rootPath', 'presets'],
      },
    },
    {
      name: 'calculate_tile',
      description: 'Calculate tile requirements for a project',
      inputSchema: {
        type: 'object',
        properties: {
          length: {
            type: 'number',
            description: 'Length in feet',
          },
          width: {
            type: 'number',
            description: 'Width in feet',
          },
          tileSize: {
            type: 'number',
            description: 'Tile size in inches',
          },
          wasteFactor: {
            type: 'number',
            description: 'Waste factor percentage',
            default: 10,
          },
        },
        required: ['length', 'width', 'tileSize'],
      },
    },
    {
      name: 'export_calculation',
      description: 'Export calculation results as JSON/PDF',
      inputSchema: {
        type: 'object',
        properties: {
          calculation: {
            type: 'object',
            description: 'Calculation result object',
          },
          format: {
            type: 'string',
            enum: ['json', 'pdf', 'csv'],
            description: 'Export format',
            default: 'json',
          },
        },
        required: ['calculation'],
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
      case 'update_presets':
        result = await updatePresets(args.rootPath as string, args.presets as any[]);
        break;
      
      case 'calculate_tile':
        result = await calculateTile(args.length as number, args.width as number, args.tileSize as number, args.wasteFactor as number);
        break;
      
      case 'export_calculation':
        result = await exportCalculation(args.calculation as any, args.format as 'json' | 'pdf' | 'csv');
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
  console.error('Tillerstead Calculator Specialist MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
