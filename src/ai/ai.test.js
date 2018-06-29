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
  });

  test('basic', () => {
    const bot = { bot: true };
    const visualize = jest.fn();
    const enumerate = jest.fn();

    const ai = AI({ bot, visualize, enumerate });

    expect(ai.bot).toEqual(bot);
    expect(ai.visualize).toEqual(visualize);
    expect(ai.enumerate).toEqual(enumerate);
  });
});
