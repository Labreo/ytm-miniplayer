#!/bin/bash

# Clean previous builds
rm -rf dist
mkdir -p dist/firefox dist/chrome dist/edge

# --- BUILD FIREFOX ---
cp -r src/* dist/firefox/
cp manifest.firefox.json dist/firefox/manifest.json
cd dist/firefox && zip -r ../ytm-mini-firefox.zip * -x "*.DS_Store" && cd ../..

# --- BUILD CHROME ---
cp -r src/* dist/chrome/
cp manifest.chrome.json dist/chrome/manifest.json
cd dist/chrome && zip -r ../ytm-mini-chrome.zip * -x "*.DS_Store" && cd ../..

# --- BUILD EDGE ---
# Edge uses the same manifest as Chrome (MV3), but we keep it separate for clarity/store submission
cp -r src/* dist/edge/
cp manifest.chrome.json dist/edge/manifest.json
cd dist/edge && zip -r ../ytm-mini-edge.zip * -x "*.DS_Store" && cd ../..

echo "Build Complete! Check the /dist folder."