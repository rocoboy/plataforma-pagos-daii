#!/usr/bin/env node
/**
 * Script to prepare @plataforma/types for deployment
 * Copies types from the workspace into the bridge directory
 */

const fs = require('fs');
const path = require('path');

const TYPES_SOURCE = path.resolve(__dirname, '../../types');
const TYPES_DEST = path.resolve(__dirname, '../.types');

console.log('Preparing types for deployment...');

// Create destination directory
if (!fs.existsSync(TYPES_DEST)) {
  fs.mkdirSync(TYPES_DEST, { recursive: true });
  console.log(`✓ Created directory: ${TYPES_DEST}`);
}

// Check if types source exists
if (!fs.existsSync(TYPES_SOURCE)) {
  console.error(`✗ Types source not found at: ${TYPES_SOURCE}`);
  console.log('  This is expected in deployment environments.');
  console.log('  Assuming types are already in place or will be handled by the build process.');
  process.exit(0);
}

// Copy all TypeScript files from types directory
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules
      if (entry.name === 'node_modules') continue;
      copyDirectory(srcPath, destPath);
    } else {
      // Copy .ts, .d.ts, and package.json files
      if (
        entry.name.endsWith('.ts') ||
        entry.name.endsWith('.d.ts') ||
        entry.name === 'package.json'
      ) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`  Copied: ${entry.name}`);
      }
    }
  }
}

try {
  copyDirectory(TYPES_SOURCE, TYPES_DEST);
  console.log('✓ Types prepared successfully!');
} catch (error) {
  console.error('✗ Error preparing types:', error);
  process.exit(1);
}

