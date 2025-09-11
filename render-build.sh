#!/usr/bin/env bash

# Exit on error
set -o errexit

# Install dependencies
npm install

# Create the Puppeteer cache directory
PUPPETEER_CACHE_DIR=/opt/render/project/src/.cache/puppeteer/
mkdir -p $PUPPETEER_CACHE_DIR

# Install Puppeteer and download Chrome
npx puppeteer browsers install chrome

# Store/pull Puppeteer cache with build cache
if [[ ! -e "/opt/render/.cache/puppeteer/chrome" ]]; then
    cp -R $PUPPETEER_CACHE_DIR /opt/render/.cache/puppeteer/
fi

echo "Puppeteer installation completed."