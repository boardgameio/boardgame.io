/*
 * Copyright 2019 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import '@testing-library/jest-dom/extend-expect';
import { render, fireEvent } from '@testing-library/svelte';
import { Client } from '../../client';
import Debug from '../Debug.svelte';

test('sanity', () => {
  const game = {};
  const client = Client({ game });
  const { getByText } = render(Debug, { props: { client } });
  expect(getByText('Controls')).toBeInTheDocument();
  expect(getByText('Players')).toBeInTheDocument();
  expect(getByText('G')).toBeInTheDocument();
  expect(getByText('ctx')).toBeInTheDocument();
});

test('switching panels', async () => {
  const game = {};
  const client = Client({ game });
  const { getByText } = render(Debug, { props: { client } });

  // switch to info tab
  const InfoTab = getByText('Info');
  await fireEvent.click(InfoTab);
  expect(getByText('gameID')).toBeInTheDocument();
  expect(getByText('playerID')).toBeInTheDocument();
  expect(getByText('isActive')).toBeInTheDocument();

  // switch to AI tab
  const AITab = getByText('AI');
  await fireEvent.click(AITab);
  expect(getByText('No bots available.')).toBeInTheDocument();
});
