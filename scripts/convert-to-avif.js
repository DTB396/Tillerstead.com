/**
 * Convert Images to AVIF Format
 * Batch converts all JPG/PNG to AVIF (next-gen format)
 */

const sharp = require('sharp');
const { glob } = require('glob');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

const IMAGE_DIR = 'assets/img';
const QUALITY = 75;

async function convertToAVIF() {
  console.log(chalk.blue.bold('\n🖼️  AVIF CONVERSION\n'));
  
  const images = await glob(`${IMAGE_DIR}/**/*.{jpg,jpeg,png}`, {
    ignore: ['**/*.avif', '**/node_modules/**']
  });
  
  console.log(`Found ${images.length} images\n`);
  
  let converted = 0;
  let skipped = 0;
  
  for (const imagePath of images) {
    const dir = path.dirname(imagePath);
    const ext = path.extname(imagePath);
    const name = path.basename(imagePath, ext);
    const avifPath = path.join(dir, `${name}.avif`);
    
    if (fs.existsSync(avifPath)) {
      console.log(chalk.gray(`⊘ ${name}.avif (exists)`));
      skipped++;
      continue;
    }
    
    try {
      await sharp(imagePath)
        .avif({ quality: QUALITY })
        .toFile(avifPath);
      
      const originalSize = fs.statSync(imagePath).size;
      const avifSize = fs.statSync(avifPath).size;
      const savings = ((originalSize - avifSize) / originalSize * 100).toFixed(1);
      
      console.log(chalk.green(`✓ ${name}.avif (saved ${savings}%)`));
      converted++;
    } catch (error) {
      console.error(chalk.red(`✗ ${name}${ext}: ${error.message}`));
    }
  }
  
  console.log(chalk.blue.bold('\n📊 CONVERSION COMPLETE\n'));
  console.log(`Converted: ${converted}`);
  console.log(`Skipped: ${skipped}\n`);
}

if (require.main === module) {
  convertToAVIF();
}

module.exports = { convertToAVIF };
