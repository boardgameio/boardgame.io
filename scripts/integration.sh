#!/bin/bash

npm run prepublishOnly
npm pack
npm run postpublish
mv ./boardgame.io-*.tgz integration
cd integration
npm install
npm install ./boardgame.io-*.tgz
rm ./boardgame.io-*.tgz
npm test
npm run build
