const fs = require('fs');
const path = require('path');

function generatePrecacheManifest() {
  const root = path.resolve(__dirname, '..');
  const staticDir = path.resolve(root, '.next', 'static');
  const publicDir = path.resolve(root, 'public');

  if (!fs.existsSync(staticDir)) {
    console.log('[precache] No .next/static directory found. Skipping.');
    return;
  }

  const files = [];
  const walk = (dir, prefix) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath, prefix + '/' + entry.name);
      } else {
        files.push(prefix + '/' + entry.name);
      }
    }
  };

  walk(staticDir, '/_next/static');

  // Also include public assets
  const publicWalk = (dir, prefix) => {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      // Skip sw.js and precache-manifest.json itself
      if (entry.name === 'sw.js' || entry.name === 'precache-manifest.json') continue;
      if (entry.isDirectory()) {
        publicWalk(fullPath, prefix + '/' + entry.name);
      } else {
        files.push(prefix + '/' + entry.name);
      }
    }
  };
  publicWalk(publicDir, '');

  const manifestPath = path.join(publicDir, 'precache-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(files, null, 2));
  console.log(`[precache] Generated manifest with ${files.length} assets`);
}

generatePrecacheManifest();