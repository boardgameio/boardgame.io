/**
 * @jest-environment node
 *
 * Tests with jsdom disabled to check that there
 * are no errors while rendering some code using SSR.
 */

/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import Client from './client';
import Game from '../core/game';
import { GameLog } from './log/log';
import { Card } from '../ui/card';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

test('Client', () => {
  const App = Client({ game: Game({}) });
  Enzyme.shallow(<App />);
});

test('GameLog', () => {
  Enzyme.shallow(<GameLog log={[]} initialState={{}} />);
});

test('Card', () => {
  Enzyme.shallow(<Card />);
});
