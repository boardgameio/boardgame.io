#!/bin/bash

# Setup
npm run prepublishOnly
npm pack
npm run postpublish
mv ./boardgame.io-*.tgz integration
cd integration
rm -rf node_modules
npm install
npm install ./boardgame.io-*.tgz
rm ./boardgame.io-*.tgz

set -e

# Test
npm test
npm run build
