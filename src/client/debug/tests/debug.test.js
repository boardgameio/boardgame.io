/*
 * Copyright 2019 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/svelte';
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
