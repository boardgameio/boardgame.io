/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { AI } from './ai';

describe('AI', () => {
  test('defaults', () => {
    const ai = AI({});
    expect(ai.bot).toBeDefined();
    expect(ai.renderAI).toBeDefined();

    const t = ai.renderAI({});
    expect(t).toBeDefined();
  });

  test('basic', () => {
    const bot = { bot: true };
    const renderAI = jest.fn();
    const enumerate = jest.fn();

    const ai = AI({ bot, renderAI, enumerate });

    expect(ai.bot).toEqual(bot);
    expect(ai.renderAI).toEqual(renderAI);
    expect(ai.enumerate).toEqual(enumerate);
  });
});
