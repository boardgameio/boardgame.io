/*
 * Copyright 2019 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import '@testing-library/jest-dom/extend-expect';
import { screen, fireEvent, waitFor } from '@testing-library/svelte';
import { Client } from '../../client';
import { Local } from '../../transport/local';

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

test('visibility toggle', async () => {
  const client = Client({ game: {} });
  client.start();

  // Visibility toggle button & debug panel are rendered
  const hideButton = screen.getByTitle('Hide Debug Panel');
  expect(hideButton).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Controls' })).toBeInTheDocument();

  // Hide debug panel
  await fireEvent.click(hideButton);
  await waitFor(() => expect(hideButton).not.toBeInTheDocument());

  // Show button is rendered & debug panel is not.
  const showButton = screen.getByTitle('Show Debug Panel');
  expect(showButton).toBeInTheDocument();
  expect(
    screen.queryByRole('heading', { name: 'Controls' })
  ).not.toBeInTheDocument();

  // Show debug panel
  await fireEvent.click(showButton);
  await waitFor(() => expect(showButton).not.toBeInTheDocument());

  // Hide button & debug panel are rendered.
  expect(screen.getByTitle('Hide Debug Panel')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Controls' })).toBeInTheDocument();

  client.stop();
});

test('panel options', async () => {
  const client = Client({
    game: {},
    debug: { hideToggleButton: true, collapseOnLoad: true },
  });
  client.start();

  const hideButton = screen.queryByTitle('Hide Debug Panel');
  expect(hideButton).not.toBeInTheDocument();

  expect(
    screen.queryByRole('heading', { name: 'Controls' })
  ).not.toBeInTheDocument();

  client.stop();
});

describe('multiple clients', () => {
  const client0 = Client({
    game: { name: 'game1' },
    playerID: '0',
    matchID: 'A',
  });
  const multiplayer = Local();
  const client1 = Client({
    game: { name: 'game2' },
    playerID: '0',
    matchID: 'B',
    multiplayer,
  });
  const client2 = Client({
    game: { name: 'game2' },
    playerID: '1',
    matchID: 'B',
    multiplayer,
  });

  beforeEach(() => {
    client0.start();
    client1.start();
    client2.start();
  });

  afterEach(() => {
    client0.stop();
    client1.stop();
    client2.stop();
  });

  test('switching clients', async () => {
    // Check if the client switcher is displayed.
    await waitFor(() => screen.getByText('Client'));
    // Get the client switcher select element.
    const select = screen.getByLabelText('Client');
    // Check it is displaying details for the client that rendered first.
    expect(
      screen.getByDisplayValue('0 — playerID: "0", matchID: "A" (game1)')
    ).toBeInTheDocument();
    // Switch to client1.
    await fireEvent.change(select, { target: { value: 1 } });
    // Check the client switcher now shows details for client1.
    expect(
      screen.getByDisplayValue('1 — playerID: "0", matchID: "B" (game2)')
    ).toBeInTheDocument();

    // Switch to the info tab and check if the matchID for client1 is displayed.
    const InfoTab = screen.getByText('Info');
    await fireEvent.click(InfoTab);
    expect(screen.getByText('"B"')).toBeInTheDocument();
  });

  test('switching playerID for a solo client', async () => {
    expect(client0.playerID).toBe('0');
    // Toggle to playerID 1 by clicking on the “1” button.
    await fireEvent.click(screen.getByRole('button', { name: 'Player 1' }));
    // Check client0’s playerID was updated.
    expect(
      screen.getByDisplayValue('0 — playerID: "1", matchID: "A" (game1)')
    ).toBeInTheDocument();
    expect(client0.playerID).toBe('1');
  });

  test('switching playerID with multiplayer clients', async () => {
    expect(client1.playerID).toBe('0');
    expect(client2.playerID).toBe('1');
    // Switch to client1.
    const select = screen.getByLabelText('Client');
    await fireEvent.change(select, { target: { value: 1 } });
    // Check the client switcher now shows details for client1.
    expect(
      screen.getByDisplayValue('1 — playerID: "0", matchID: "B" (game2)')
    ).toBeInTheDocument();
    // Toggle to playerID 1 by clicking on the “1” button.
    await fireEvent.click(screen.getByRole('button', { name: 'Player 1' }));
    // Check the client switcher now shows details for client2.
    expect(
      screen.getByDisplayValue('2 — playerID: "1", matchID: "B" (game2)')
    ).toBeInTheDocument();
    // Client playerIDs have not changed.
    expect(client1.playerID).toBe('0');
    expect(client2.playerID).toBe('1');
  });

  test('switching to current client', async () => {
    const select = screen.getByLabelText('Client');
    await fireEvent.change(select, { target: { value: 0 } });
    expect(
      screen.getByDisplayValue('0 — playerID: "1", matchID: "A" (game1)')
    ).toBeInTheDocument();
  });
});
