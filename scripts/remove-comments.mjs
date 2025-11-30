import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import strip from 'strip-comments';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    const cleaned = strip(content, {
      language: 'javascript',
      preserveNewlines: true,
      keepProtected: true
    });
    
    let result = cleaned
      .replace(/\n\s*\n\s*\n+/g, '\n\n')
      .trim() + '\n';
    
    if (content !== result) {
      fs.writeFileSync(filePath, result, 'utf8');
      console.log(`✓ Cleaned: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function walkDir(dir, filePattern) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let count = 0;
  
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      if (!['node_modules', 'dist', '.git', 'coverage', 'build'].includes(file.name)) {
        count += walkDir(filePath, filePattern);
      }
    } else if (file.isFile() && filePattern.test(file.name)) {
      if (!file.name.includes('.test.') && 
          !filePath.includes('__tests__') && 
          !filePath.includes('/test/') &&
          !filePath.includes('/tests/')) {
        if (processFile(filePath)) {
          count++;
        }
      }
    }
  }
  
  return count;
}

const srcDir = path.join(__dirname, '..', 'src');
const pattern = /\.(ts|tsx|js|jsx)$/;

console.log('Removing comments from source files...\n');
const count = walkDir(srcDir, pattern);
console.log(`\n✓ Successfully cleaned ${count} files`);
