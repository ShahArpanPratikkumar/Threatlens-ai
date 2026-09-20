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

// 4. Also copy extension into public/extension for direct file serving
const publicExtensionDir = path.join(rootDir, 'public', 'extension');
copyRecursiveSync(outDir, publicExtensionDir);

// 5. Create downloadable ZIP archive in public/ directory
const publicDir = path.join(rootDir, 'public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
const zipPath = path.join(publicDir, 'threatlens-extension.zip');

try {
  const { execSync } = await import('child_process');
  let packaged = false;

  // Try PowerShell on Windows
  if (process.platform === 'win32') {
    try {
      execSync(`powershell -NoProfile -Command "Compress-Archive -Path 'dist-extension/*' -DestinationPath 'public/threatlens-extension.zip' -Force"`, { stdio: 'ignore' });
      packaged = true;
    } catch {}
  }

  // Try zip command on Unix / Linux / Vercel
  if (!packaged) {
    try {
      execSync(`zip -r -q "public/threatlens-extension.zip" dist-extension/*`, { stdio: 'ignore' });
      packaged = true;
    } catch {}
  }

  // Try python3 / python as fallback
  if (!packaged) {
    try {
      execSync(`python3 -c "import zipfile, os\nwith zipfile.ZipFile('public/threatlens-extension.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:\n    for root, dirs, files in os.walk('dist-extension'):\n        for file in files:\n            p = os.path.join(root, file)\n            zipf.write(p, os.path.relpath(p, 'dist-extension'))"`, { stdio: 'ignore' });
      packaged = true;
    } catch {}
  }

  if (packaged && fs.existsSync(zipPath)) {
    console.log('   📦 Generated public/threatlens-extension.zip for direct browser download');
  } else {
    console.log('   ℹ️ Extension files served directly from public/extension/');
  }
} catch (err) {
  console.log('Notice: zip packaging skipped:', err.message);
}

