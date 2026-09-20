/**
 * ThreatLens AI — Chrome Extension Build & Packaging Script
 * Prepares the production-ready unpacked Chrome Extension in `dist-extension/`.
 */

import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'extension');
const outDir = path.join(rootDir, 'dist-extension');

console.log('🛡️ [ThreatLens Extension Builder] Packaging Manifest V3 Extension...');

// 1. Ensure output directory
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

// Helper to recursively copy directories
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 2. Copy extension files
copyRecursiveSync(srcDir, outDir);

// 3. Validate Manifest
const manifestPath = path.join(outDir, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('❌ Error: manifest.json missing!');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Verify icons
['16', '32', '48', '128'].forEach((size) => {
  const iconRel = manifest.icons && manifest.icons[size];
  if (!iconRel || !fs.existsSync(path.join(outDir, iconRel))) {
    console.error(`❌ Error: Icon ${size} missing at ${iconRel}`);
    process.exit(1);
  }
});

// Verify service worker
if (!manifest.background || !manifest.background.service_worker || !fs.existsSync(path.join(outDir, manifest.background.service_worker))) {
  console.error('❌ Error: background service_worker missing!');
  process.exit(1);
}

// Verify side panel
if (!manifest.side_panel || !manifest.side_panel.default_path || !fs.existsSync(path.join(outDir, manifest.side_panel.default_path))) {
  console.error('❌ Error: side_panel default_path missing!');
  process.exit(1);
}

console.log('✅ Extension build verified successfully in:');
console.log(`   📂 ${outDir}`);
console.log('   Ready to be loaded unpacked in Google Chrome (chrome://extensions).');

// 4. Create downloadable ZIP archive in public/ directory
try {
  const { execSync } = await import('child_process');
  const publicDir = path.join(rootDir, 'public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  execSync(`python3 -c "import zipfile, os
with zipfile.ZipFile('public/threatlens-extension.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk('dist-extension'):
        for file in files:
            p = os.path.join(root, file)
            zipf.write(p, os.path.relpath(p, 'dist-extension'))
print('   📦 Generated public/threatlens-extension.zip for direct browser download')
"`);
} catch (err) {
  console.log('Notice: zip packaging skipped:', err.message);
}

