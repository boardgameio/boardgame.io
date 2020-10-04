/*
 * Copyright 2019 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import '@testing-library/jest-dom/extend-expect';
import { screen, fireEvent } from '@testing-library/svelte';
import { Client } from '../../client';

test('sanity', () => {
  const client = Client({ game: {} });
  client.start();
  expect(screen.getByText('Controls')).toBeInTheDocument();
  expect(screen.getByText('Players')).toBeInTheDocument();
  expect(screen.getByText('G')).toBeInTheDocument();
  expect(screen.getByText('ctx')).toBeInTheDocument();
  client.stop();
});

test('switching panels', async () => {
  const client = Client({ game: {} });
  client.start();

  // switch to info tab
  const InfoTab = screen.getByText('Info');
  await fireEvent.click(InfoTab);
  expect(screen.getByText('matchID')).toBeInTheDocument();
  expect(screen.getByText('playerID')).toBeInTheDocument();
  expect(screen.getByText('isActive')).toBeInTheDocument();

  // switch to AI tab
  const AITab = screen.getByText('AI');
  await fireEvent.click(AITab);
  expect(screen.getByText('No bots available.')).toBeInTheDocument();
  client.stop();
});
