#!/bin/bash

# Setup
rm -rf dist
npm pack
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
