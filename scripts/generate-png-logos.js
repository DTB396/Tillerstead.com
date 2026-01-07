#!/usr/bin/env node
/**
 * Generate high-quality PNG versions of SVG logos
 * Uses sharp library for high-quality conversion
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const LOGO_DIR = path.join(__dirname, '../assets/img/logo');
const OUTPUT_DIR = LOGO_DIR;

const LOGOS_TO_CONVERT = [
  {
    input: 'tillerstead-logo-header.svg',
    outputs: [
      { name: 'tillerstead-logo-header.png', width: 496, height: 136 },
      { name: 'tillerstead-logo-header@2x.png', width: 992, height: 272 },
      { name: 'tillerstead-logo-header@3x.png', width: 1488, height: 408 },
    ],
  },
  {
    input: 'tillerstead-logo-header-dark.svg',
    outputs: [
      { name: 'tillerstead-logo-header-dark.png', width: 496, height: 136 },
      { name: 'tillerstead-logo-header-dark@2x.png', width: 992, height: 272 },
    ],
  },
  {
    input: 'tillerstead-logo-full.svg',
    outputs: [
      { name: 'tillerstead-logo-full.png', width: 720, height: 200 },
      { name: 'tillerstead-logo-full@2x.png', width: 1440, height: 400 },
    ],
  },
  {
    input: 'tillerstead-logo-mark.svg',
    outputs: [
      { name: 'tillerstead-logo-mark.png', width: 174, height: 174 },
      { name: 'tillerstead-logo-mark@2x.png', width: 348, height: 348 },
      { name: 'tillerstead-logo-mark-512.png', width: 512, height: 512 },
    ],
  },
  {
    input: 'tillerstead-logo-stacked.svg',
    outputs: [
      { name: 'tillerstead-logo-stacked.png', width: 260, height: 320 },
      { name: 'tillerstead-logo-stacked@2x.png', width: 520, height: 640 },
    ],
  },
];

async function convertSvgToPng(inputPath, outputPath, width, height) {
  await sharp(inputPath, { density: 300 })
    .resize(width, height)
    .png()
    .toFile(outputPath);
}

async function main() {
  const tool = 'sharp';
  console.log(`Using: ${tool}\n`);
  let converted = 0;
  let failed = 0;

  for (const logo of LOGOS_TO_CONVERT) {
    const inputPath = path.join(LOGO_DIR, logo.input);

    if (!fs.existsSync(inputPath)) {
      console.log(`Skipping ${logo.input} (not found)`);
      continue;
    }

    console.log(`Converting: ${logo.input}`);

    for (const output of logo.outputs) {
      const outputPath = path.join(OUTPUT_DIR, output.name);

      try {
        await convertSvgToPng(
          inputPath,
          outputPath,
          output.width,
          output.height,
        );
        console.log(`  OK ${output.name} (${output.width}x${output.height})`);
        converted++;
      } catch (error) {
        console.error(`  Failed: ${output.name}`);
        console.error(`    ${error.message}`);
        failed++;
      }
    }

    console.log('');
  }

  console.log(`\nComplete! Generated ${converted} PNG files.`);
  if (failed > 0) {
    console.log(`${failed} conversions failed.`);
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
