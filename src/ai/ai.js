/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { MCTSDebug } from './mcts-debug';
import { MCTSBot } from './bot';

export function AI({ bot, enumerate, renderAI, renderGameTreeCell }) {
  if (!bot) {
    bot = MCTSBot;
  }

  if (!renderAI) {
    // eslint-disable-next-line react/display-name
    renderAI = metadata => (
      <MCTSDebug root={metadata} renderState={renderGameTreeCell} />
    );
  }

  return { bot, enumerate, renderAI };
}
