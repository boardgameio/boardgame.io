#!/bin/bash

# Copyright 2017 The boardgame.io Authors
# 
# Use of this source code is governed by a MIT-style
# license that can be found in the LICENSE file or at
# https://opensource.org/licenses/MIT.

set -e

if [ ! -d examples/react-web/node_modules ]; then
  (cd examples/react-web; npm install)
fi

npx concurrently npm:dev:server npm:dev:client
