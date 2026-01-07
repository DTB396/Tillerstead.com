import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Analyze CSS structure and identify unused files
const sassDir = path.join(__dirname, '..', '_sass');
const mainScss = path.join(__dirname, '..', 'assets', 'css', 'style.scss');

console.log('📊 CSS Structure Analysis\n');

// Read style.scss to see what's imported
const mainContent = fs.readFileSync(mainScss, 'utf8');
const importedFiles = [];
const importRegex = /@import\s+["']([^"']+)["'];?/g;
let match;

while ((match = importRegex.exec(mainContent)) !== null) {
  importedFiles.push(match[1]);
}

console.log('✅ Files imported in style.scss:');
importedFiles.forEach((f) => console.log(`   - ${f}`));

// Find all SCSS files
function getAllScssFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllScssFiles(filePath, fileList);
    } else if (file.endsWith('.scss')) {
      const relativePath = path
        .relative(sassDir, filePath)
        .replace(/\\/g, '/')
        .replace('.scss', '');
      fileList.push(relativePath);
    }
  });

  return fileList;
}

const allFiles = getAllScssFiles(sassDir);

console.log('\n🔍 Unused SCSS files:');
const unusedFiles = allFiles.filter((f) => !importedFiles.includes(f));
unusedFiles.forEach((f) => console.log(`   ⚠️  ${f}.scss`));

console.log('\n📁 Current folder structure:');
const folders = {
  settings: '00-settings',
  base: '10-base',
  layout: '20-layout',
  components: '30-components',
  pages: '40-pages',
  utilities: '40-utilities',
};

Object.entries(folders).forEach(([, folder]) => {
  const folderPath = path.join(sassDir, folder);
  if (fs.existsSync(folderPath)) {
    const files = fs.readdirSync(folderPath).filter((f) => f.endsWith('.scss'));
    console.log(`   ${folder}/ (${files.length} files)`);
    files.forEach((f) => console.log(`      - ${f}`));
  }
});

console.log('\n💡 Recommendations:');
console.log('   1. Remove or archive unused files');
console.log('   2. Consolidate theme variations into single files');
console.log('   3. Move unused token files to archive folder');
console.log('   4. Document the purpose of each file in comments');
