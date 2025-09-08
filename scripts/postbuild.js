const fs = require('fs');
const path = require('path');


const outDir = path.join(__dirname, '..', 'web');
const indexFile = path.join(outDir, 'index.html');
const fallbackFile = path.join(outDir, '200.html');

if (!fs.existsSync(outDir)) {
  console.warn('Web output directory not found:', outDir);
  process.exit(0);
}

if (!fs.existsSync(indexFile)) {
  console.warn('index.html not found in web output. Did expo export:web run successfully?');
  process.exit(0);
}

try {
  fs.copyFileSync(indexFile, fallbackFile);
  console.log('Created 200.html for SPA fallback.');
} catch (err) {
  console.error('Failed to create 200.html:', err);
  process.exit(1);
}
