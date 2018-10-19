/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { Game } from 'boardgame.io/core';

const Description = () => (
  <div>
    This is the default round-robin turn order. Click on
    <strong> endTurn</strong> and see how the turn passes around.
  </div>
);

export default {
  description: Description,
  game: Game({}),
};
