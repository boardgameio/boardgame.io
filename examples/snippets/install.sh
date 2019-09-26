#!/bin/bash

# Builds the snippets and installs them at the
# appropriate places in the docs.

rm -rf dist
npm run build
rm -rf ../../docs/documentation/snippets
cp -r dist ../../docs/documentation/snippets
