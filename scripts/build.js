const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const srcDir = path.join(rootDir, 'src');

function cleanAndPrepare() {
  console.log('Cleaning previous builds...');
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(distDir, { recursive: true });
}

function copyDirectory(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function zipFolder(srcDirName, zipName) {
  const targetDir = path.join(distDir, srcDirName);
  const zipPath = path.join(distDir, zipName);
  const isWindows = process.platform === 'win32';

  console.log(`Creating archive: ${zipName}...`);
  try {
    if (isWindows) {
      // Use native tar tool on Windows
      execSync(`tar -a -c -f "${zipPath}" *`, { cwd: targetDir, stdio: 'inherit' });
    } else {
      // Use standard zip command on Linux/macOS
      execSync(`zip -r "${zipPath}" . -x "*.DS_Store"`, { cwd: targetDir, stdio: 'inherit' });
    }
  } catch (error) {
    console.error(`Failed to create archive ${zipName}:`, error.message);
    throw error;
  }
}

function build() {
  try {
    cleanAndPrepare();

    const targets = [
      { name: 'firefox', manifest: 'manifest.firefox.json', zip: 'ytm-mini-firefox.zip' },
      { name: 'chrome', manifest: 'manifest.chrome.json', zip: 'ytm-mini-chrome.zip' },
      { name: 'edge', manifest: 'manifest.chrome.json', zip: 'ytm-mini-edge.zip' },
      { name: 'opera', manifest: 'manifest.chrome.json', zip: 'ytm-mini-opera.zip' }
    ];

    for (const target of targets) {
      console.log(`\n--- BUILDING ${target.name.toUpperCase()} ---`);
      const targetDist = path.join(distDir, target.name);
      
      // Copy source files
      copyDirectory(srcDir, targetDist);

      // Copy manifest
      const manifestSrc = path.join(rootDir, target.manifest);
      const manifestDest = path.join(targetDist, 'manifest.json');
      if (fs.existsSync(manifestSrc)) {
        fs.copyFileSync(manifestSrc, manifestDest);
      } else {
        throw new Error(`Manifest file not found: ${target.manifest}`);
      }

      // Archive
      zipFolder(target.name, target.zip);
    }

    console.log('\nBuild Complete! Check the /dist folder.');
  } catch (error) {
    console.error('\nBuild failed:', error.message);
    process.exit(1);
  }
}

build();
