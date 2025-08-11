#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to list the main project structure
 * Excludes build artifacts, dependencies, and generated files
 */

// Files and directories to ignore
const IGNORE_PATTERNS = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  'coverage',
  '.nyc_output',
  '.DS_Store',
  'Thumbs.db',
  '*.log',
  '*.tmp',
  '*.temp',
  '.env.local',
  '.env.*.local',
  'pnpm-lock.yaml',
  'package-lock.json',
  'yarn.lock'
];

// File extensions to include (when filtering by extension)
const IMPORTANT_EXTENSIONS = [
  '.ts', '.tsx', '.js', '.jsx',
  '.json', '.md', '.mdc',
  '.css', '.scss', '.sass',
  '.prisma', '.sql',
  '.svg', '.png', '.jpg', '.jpeg',
  '.ico', '.txt', '.yml', '.yaml',
  '.toml', '.xml', '.html'
];

/**
 * Check if a file/directory should be ignored
 */
function shouldIgnore(name, isDirectory) {
  // Check exact matches
  if (IGNORE_PATTERNS.includes(name)) {
    return true;
  }
  
  // Check if it's a hidden file/directory (starts with .)
  if (name.startsWith('.') && !isImportantHiddenFile(name)) {
    return true;
  }
  
  // For files, check if extension is important
  if (!isDirectory) {
    const ext = path.extname(name);
    if (ext && !IMPORTANT_EXTENSIONS.includes(ext)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if a hidden file is important to show
 */
function isImportantHiddenFile(name) {
  const importantHiddenFiles = [
    '.cursor',
    '.gitignore',
    '.env.example',
    '.eslintrc.js',
    '.eslintrc.json',
    '.prettierrc',
    '.editorconfig'
  ];
  
  return importantHiddenFiles.some(important => 
    name === important || name.startsWith(important)
  );
}

/**
 * Generate tree structure recursively
 */
function generateTree(dir, prefix = '', maxDepth = 10, currentDepth = 0) {
  if (currentDepth >= maxDepth) {
    return '';
  }
  
  let result = '';
  
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true })
      .filter(item => !shouldIgnore(item.name, item.isDirectory()))
      .sort((a, b) => {
        // Directories first, then files
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
      });
    
    items.forEach((item, index) => {
      const isLast = index === items.length - 1;
      const itemPrefix = isLast ? '└── ' : '├── ';
      const nextPrefix = prefix + (isLast ? '    ' : '│   ');
      
      result += `${prefix}${itemPrefix}${item.name}`;
      
      if (item.isDirectory()) {
        result += '/\n';
        const subPath = path.join(dir, item.name);
        result += generateTree(subPath, nextPrefix, maxDepth, currentDepth + 1);
      } else {
        result += '\n';
      }
    });
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return result;
}

/**
 * Main function
 */
function main() {
  const projectRoot = process.cwd();
  const projectName = path.basename(projectRoot);
  
  console.log(`\n🏗️  DTP Attendance Project Structure\n`);
  console.log(`${projectName}/`);
  
  const tree = generateTree(projectRoot);
  console.log(tree);
  
  console.log(`\n📋 Structure Summary:`);
  console.log(`   • Excluded: node_modules, .next, build artifacts, logs`);
  console.log(`   • Included: Source files, configs, docs, assets`);
  console.log(`   • Use 'pnpm structure:full' for complete structure\n`);
}

// Handle command line arguments
if (process.argv.includes('--full')) {
  // Modify ignore patterns for full structure
  const fullIgnoreIndex = IGNORE_PATTERNS.indexOf('node_modules');
  if (fullIgnoreIndex > -1) {
    IGNORE_PATTERNS.splice(fullIgnoreIndex, 1);
  }
}

main();
