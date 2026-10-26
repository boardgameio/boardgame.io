/**
 * @jest-environment node
 */

/*
 * Copyright 2026 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { isDeepStrictEqual } from 'node:util';
import { io as ioClient, type Socket } from 'socket.io-client';
import { Client } from '../../client/client';
import {
  SocketIO as ClientSocketIO,
  type SocketIOTransport,
} from '../../client/transport/socketio';
import * as ActionCreators from '../../core/action-creators';
import { Invalid } from '../../core/constants';
import { ActivePlayers } from '../../core/turn-order';
import type {
  ActionError,
  CredentialedActionShape,
  Game,
  State,
} from '../../types';
import { Server } from '../index';

jest.mock('../../core/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

jest.setTimeout(30_000);

type StressG = {
  cells: Array<string | null>;
  counter: number;
};

const game: Game<StressG> = {
  name: 'socketio-stress',
  setup: () => ({
    cells: Array.from({ length: 10 }, (): string | null => null),
    counter: 0,
  }),
  turn: { activePlayers: ActivePlayers.ALL },
  moves: {
    take: ({ G, playerID }, cell: number) => {
      if (G.cells[cell] !== null) return Invalid({ code: 'TAKEN', cell });
      G.cells[cell] = playerID;
    },
    gift: ({ G }) => {
      G.counter += 1;
    },
    reject: () => Invalid({ code: 'NO' }),
  },
};

type BurstAction =
  { type: 'take'; cell: number } | { type: 'gift' } | { type: 'reject' };

type WireMessage = {
  type: 'sync' | 'update' | 'patch' | 'matchData' | 'actionResult';
  matchID: string;
};

type SentAction = {
  actionID?: number;
  stateID: number;
  action: CredentialedActionShape.Any;
};

type TrackedClient = {
  matchID: string;
  playerID: string;
  client: ReturnType<typeof Client>;
  transport: SocketIOTransport;
  sent: SentAction[];
  notifications: Array<{ state: State<StressG> | null; error?: ActionError }>;
  wireMessages: WireMessage[];
  actionResults: Array<{
    matchID: string;
    actionID: number;
    result: { error?: ActionError };
  }>;
  updates: Array<{ matchID: string; state: State<StressG> }>;
  stopped: boolean;
};

function mulberry32(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d_2b_79_f5) >>> 0;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4_294_967_296;
  };
}

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => void setTimeout(resolve, milliseconds));

async function pollUntil(
  predicate: () => boolean | Promise<boolean>,
  label: string,
  attempts = 400,
  interval = 10,
) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    if (await predicate()) return;
    await wait(interval);
  }
  throw new Error(`timed out waiting for ${label}`);
}

const dispatch = (tracked: TrackedClient, action: BurstAction) => {
  switch (action.type) {
    case 'take': {
      tracked.client.moves.take(action.cell);
      break;
    }
    case 'gift': {
      tracked.client.moves.gift();
      break;
    }
    case 'reject': {
      tracked.client.moves.reject();
      break;
    }
  }
};

const createMixedBurst = (seed: number, length: number): BurstAction[] => {
  const random = mulberry32(seed);
  const actions = Array.from({ length }, (_, index): BurstAction => {
    if (index === length - 1) return { type: 'reject' };
    const choice = random();
    if (choice < 0.58) {
      return { type: 'take', cell: Math.floor(random() * 6) };
    }
    if (choice < 0.8) return { type: 'gift' };
    return { type: 'reject' };
  });
  actions[0] = { type: 'take', cell: 0 };
  actions[1] = { type: 'take', cell: 1 };
  return actions;
};

const dispatchBurst = async (
  tracked: TrackedClient,
  actions: BurstAction[],
  seed: number,
  maxJitter: number,
) => {
  const random = mulberry32(seed);
  for (const action of actions) {
    dispatch(tracked, action);
    if (maxJitter > 0) {
      await wait(Math.floor(random() * maxJitter));
    }
  }
};

describe('real Socket.IO action-result stress', () => {
  let server: ReturnType<typeof Server>;
  let running: Awaited<ReturnType<ReturnType<typeof Server>['run']>>;
  let serverURL: string;
  const trackedClients: TrackedClient[] = [];
  const rawSockets: Socket[] = [];

  const fetchMatch = async (matchID: string, opts: any) =>
    await server.db.fetch(matchID, opts);

  const waitForQueueIdle = async (matchID: string) => {
    await server.transport.getMatchQueue(matchID).onIdle();
  };

  const createClient = (
    matchID: string,
    playerID: string,
    credentials?: string,
  ) => {
    const sent: SentAction[] = [];
    const notifications: TrackedClient['notifications'] = [];
    const wireMessages: WireMessage[] = [];
    const actionResults: TrackedClient['actionResults'] = [];
    const updates: TrackedClient['updates'] = [];
    let transport: SocketIOTransport;
    const socketFactory = ClientSocketIO({
      server: serverURL,
      socketOpts: {
        transports: ['websocket'],
        forceNew: true,
        reconnection: false,
      },
    });

    const client = Client<StressG>({
      game,
      matchID,
      playerID,
      credentials,
      numPlayers: 3,
      debug: false,
      multiplayer: (opts) => {
        transport = socketFactory(opts);
        const sendAction = transport.sendAction.bind(transport);
        transport.sendAction = (state, action, actionID) => {
          sent.push({ actionID, stateID: state._stateID, action });
          sendAction(state, action, actionID);
        };
        return transport;
      },
    });

    client.subscribe((state, error) => {
      notifications.push({ state: state as State<StressG> | null, error });
    });
    client.start();

    const socket = transport.socket;
    socket.on('sync', (receivedMatchID: string) => {
      wireMessages.push({ type: 'sync', matchID: receivedMatchID });
    });
    socket.on('update', (receivedMatchID: string, state: State<StressG>) => {
      wireMessages.push({ type: 'update', matchID: receivedMatchID });
      updates.push({ matchID: receivedMatchID, state });
    });
    socket.on('patch', (receivedMatchID: string) => {
      wireMessages.push({ type: 'patch', matchID: receivedMatchID });
    });
    socket.on('matchData', (receivedMatchID: string) => {
      wireMessages.push({ type: 'matchData', matchID: receivedMatchID });
    });
    socket.on(
      'actionResult',
      (
        receivedMatchID: string,
        actionID: number,
        result: { error?: ActionError },
      ) => {
        wireMessages.push({
          type: 'actionResult',
          matchID: receivedMatchID,
        });
        actionResults.push({ matchID: receivedMatchID, actionID, result });
      },
    );

    const tracked: TrackedClient = {
      matchID,
      playerID,
      client,
      transport,
      sent,
      notifications,
      wireMessages,
      actionResults,
      updates,
      stopped: false,
    };
    trackedClients.push(tracked);
    return tracked;
  };

  const stopClient = (tracked: TrackedClient) => {
    if (tracked.stopped) return;
    tracked.client.stop();
    tracked.stopped = true;
  };

  const waitForSynced = async (clients: TrackedClient[]) => {
    await pollUntil(
      () =>
        clients.every(
          ({ client }) =>
            client.getState() !== null && client.getState()?.isConnected,
        ),
      `clients to sync for ${clients.map(({ matchID }) => matchID).join(', ')}`,
    );
    await Promise.all(
      [...new Set(clients.map(({ matchID }) => matchID))].map((matchID) =>
        waitForQueueIdle(matchID),
      ),
    );
    await wait(20);
  };

  const clearActivity = (clients: TrackedClient[]) => {
    for (const client of clients) {
      client.notifications.length = 0;
      client.wireMessages.length = 0;
      client.actionResults.length = 0;
      client.updates.length = 0;
    }
  };

  const waitForConvergence = async (
    matchID: string,
    clients: TrackedClient[],
  ): Promise<State<StressG>> => {
    await waitForQueueIdle(matchID);
    let stableChecks = 0;
    let previousStateID: number | undefined;
    let latestServerState: State<StressG>;

    for (let attempt = 0; attempt < 500; attempt++) {
      const fetchResult = await fetchMatch(matchID, { state: true });
      latestServerState = fetchResult.state;
      const converged = clients.every(({ client }) => {
        const state = client.getState();
        return (
          state !== null &&
          state._stateID === latestServerState._stateID &&
          isDeepStrictEqual(state.G, latestServerState.G) &&
          state.ctx.turn === latestServerState.ctx.turn &&
          state.ctx.currentPlayer === latestServerState.ctx.currentPlayer
        );
      });
      if (converged && previousStateID === latestServerState._stateID) {
        stableChecks++;
        if (stableChecks >= 5) return latestServerState;
      } else {
        stableChecks = 0;
      }
      previousStateID = latestServerState._stateID;
      await wait(10);
    }

    const clientStates = clients.map(({ playerID, client }) => ({
      playerID,
      state: client.getState(),
    }));
    throw new Error(
      `clients did not converge for ${matchID}: server=${JSON.stringify(
        latestServerState,
      )} clients=${JSON.stringify(clientStates)}`,
    );
  };

  const expectWireIsolation = (clients: TrackedClient[]) => {
    for (const client of clients) {
      expect(client.wireMessages.length).toBeGreaterThan(0);
      expect(
        new Set(client.wireMessages.map(({ matchID }) => matchID)),
      ).toEqual(new Set([client.matchID]));
    }
  };

  const ensureContestedCell = async (
    matchID: string,
    clients: TrackedClient[],
    cell: number,
  ) => {
    let state = await waitForConvergence(matchID, clients);
    if (state.G.cells[cell] === null) {
      clients[1].client.moves.take(cell);
      clients[2].client.moves.take(cell);
      state = await waitForConvergence(matchID, clients);
    }
    return state;
  };

  beforeAll(async () => {
    server = Server({
      games: [game],
      origins: ['http://localhost:3000'],
    });
    running = await server.run(0);
    const address = running.appServer.address();
    if (address === null || typeof address === 'string') {
      throw new Error('server did not expose a TCP port');
    }
    serverURL = `http://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    for (const client of trackedClients.splice(0)) stopClient(client);
    for (const socket of rawSockets.splice(0)) socket.disconnect();
    await wait(20);
  });

  afterAll(() => {
    server.kill(running);
  });

  test('contention burst converges and keeps action errors targeted', async () => {
    const matchID = 'contention';
    const clients = ['0', '1', '2'].map((playerID) =>
      createClient(matchID, playerID),
    );
    await waitForSynced(clients);
    clearActivity(clients);

    const scripts: BurstAction[][] = [
      Array.from({ length: 30 }, () => ({ type: 'gift' as const })),
      createMixedBurst(0x12_74_01, 30),
      createMixedBurst(0x12_74_02, 30),
    ];
    await Promise.all([
      dispatchBurst(clients[0], scripts[0], 0x12_74_10, 0),
      dispatchBurst(clients[1], scripts[1], 0x12_74_11, 3),
      dispatchBurst(clients[2], scripts[2], 0x12_74_12, 3),
    ]);

    const finalState = await ensureContestedCell(matchID, clients, 0);
    const { log } = await fetchMatch(matchID, { log: true });
    const acceptedGifts = log.filter(
      ({ action }) =>
        action.type === 'MAKE_MOVE' && action.payload.type === 'gift',
    );
    const acceptedTakes = log.filter(
      ({ action }) =>
        action.type === 'MAKE_MOVE' && action.payload.type === 'take',
    );
    const takeZero = acceptedTakes.filter(
      ({ action }) => (action.payload as any).args[0] === 0,
    );

    expect(finalState.G.counter).toBe(acceptedGifts.length);
    expect(finalState.G.cells[0]).not.toBeNull();
    expect(takeZero).toHaveLength(1);
    expect(takeZero[0].action.payload.playerID).toBe(finalState.G.cells[0]);
    const cellLedger = finalState.G.cells.map((owner, cell) => ({
      owner,
      successfulPlayers: acceptedTakes
        .filter(({ action }) => (action.payload as any).args[0] === cell)
        .map(({ action }) => action.payload.playerID),
    }));
    expect(cellLedger).toEqual(
      finalState.G.cells.map((owner) => ({
        owner,
        successfulPlayers: owner === null ? [] : [owner],
      })),
    );
    expect(
      clients[0].notifications.filter(({ error }) => error !== undefined),
    ).toHaveLength(0);
    expect(
      clients[1].notifications.filter(({ error }) => error !== undefined)
        .length,
    ).toBeGreaterThan(0);
    expect(
      clients[2].notifications.filter(({ error }) => error !== undefined)
        .length,
    ).toBeGreaterThan(0);
    expectWireIsolation(clients);
  });

  test('concurrent bursts on two matches remain isolated', async () => {
    const matchA = 'isolation-a';
    const matchB = 'isolation-b';
    const clientsA = ['0', '1', '2'].map((playerID) =>
      createClient(matchA, playerID),
    );
    const clientsB = ['0', '1', '2'].map((playerID) =>
      createClient(matchB, playerID),
    );
    await waitForSynced([...clientsA, ...clientsB]);
    clearActivity([...clientsA, ...clientsB]);

    await Promise.all([
      dispatchBurst(
        clientsA[0],
        Array.from({ length: 18 }, () => ({ type: 'gift' as const })),
        0x12_74_20,
        0,
      ),
      dispatchBurst(
        clientsA[1],
        createMixedBurst(0x12_74_21, 18),
        0x12_74_22,
        3,
      ),
      dispatchBurst(
        clientsA[2],
        createMixedBurst(0x12_74_23, 18),
        0x12_74_24,
        3,
      ),
      dispatchBurst(
        clientsB[0],
        Array.from({ length: 22 }, () => ({ type: 'gift' as const })),
        0x12_74_25,
        0,
      ),
      dispatchBurst(
        clientsB[1],
        createMixedBurst(0x12_74_26, 22),
        0x12_74_27,
        3,
      ),
      dispatchBurst(
        clientsB[2],
        createMixedBurst(0x12_74_28, 22),
        0x12_74_29,
        3,
      ),
    ]);

    await waitForConvergence(matchA, clientsA);
    await waitForConvergence(matchB, clientsB);
    clientsA[0].client.moves.gift();
    clientsB[1].client.moves.take(9);
    const finalA = await waitForConvergence(matchA, clientsA);
    const finalB = await waitForConvergence(matchB, clientsB);

    expect(finalA.G.cells[9]).toBeNull();
    expect(finalB.G.cells[9]).toBe('1');
    expectWireIsolation([...clientsA, ...clientsB]);
  });

  test('two tabs for one player target the result only to the sending tab', async () => {
    const matchID = 'same-player-tabs';
    const tabA = createClient(matchID, '0', 'shared');
    const tabB = createClient(matchID, '0', 'shared');
    const observer = createClient(matchID, '1');
    await waitForSynced([tabA, tabB, observer]);
    clearActivity([tabA, tabB, observer]);

    tabA.client.moves.reject();
    await pollUntil(
      () =>
        tabA.notifications.some(({ error }) => error !== undefined) &&
        tabB.updates.length > 0,
      'the invalid result and shared broadcast',
    );
    await waitForQueueIdle(matchID);

    const tabAErrors = tabA.notifications
      .map(({ error }) => error)
      .filter((error): error is ActionError => error !== undefined);
    expect(tabAErrors).toEqual([
      { type: 'action/invalid_move', payload: { code: 'NO' } },
    ]);
    expect(tabA.actionResults).toHaveLength(1);
    expect(tabB.actionResults).toHaveLength(0);
    expect(
      tabB.notifications.filter(({ error }) => error !== undefined),
    ).toHaveLength(0);
    expect(tabB.updates.length).toBeGreaterThan(0);
    expectWireIsolation([tabA, tabB, observer]);
  });

  test('an old client without action IDs receives no actionResult', async () => {
    const matchID = 'old-client';
    const socket = ioClient(`${serverURL}/${game.name}`, {
      transports: ['websocket'],
      forceNew: true,
      reconnection: false,
    });
    rawSockets.push(socket);
    const actionResults: unknown[] = [];
    const syncs: Array<{ matchID: string; state: State<StressG> }> = [];
    const updates: Array<{ matchID: string; state: State<StressG> }> = [];
    socket.on('actionResult', (...args) => actionResults.push(args));
    socket.on(
      'sync',
      (receivedMatchID: string, info: { state: State<StressG> }) =>
        syncs.push({ matchID: receivedMatchID, state: info.state }),
    );
    socket.on('update', (receivedMatchID: string, state: State<StressG>) =>
      updates.push({ matchID: receivedMatchID, state }),
    );

    await pollUntil(() => socket.connected, 'raw socket connection');
    socket.emit('sync', matchID, '0', undefined, 3);
    await pollUntil(() => syncs.length === 1, 'raw client sync');

    socket.emit(
      'update',
      ActionCreators.makeMove('gift', [], '0'),
      syncs[0].state._stateID,
      matchID,
      '0',
    );
    await pollUntil(
      () => updates.some(({ state }) => state.G.counter === 1),
      'first old-client update',
    );
    const stateID = updates.at(-1).state._stateID;
    socket.emit(
      'update',
      ActionCreators.makeMove('gift', [], '0'),
      stateID,
      matchID,
      '0',
    );
    await pollUntil(
      () => updates.some(({ state }) => state.G.counter === 2),
      'follow-up old-client update',
    );
    await wait(300);

    expect(actionResults).toHaveLength(0);
    expect(new Set(updates.map(({ matchID }) => matchID))).toEqual(
      new Set([matchID]),
    );
    const { state } = await fetchMatch(matchID, { state: true });
    expect(state.G.counter).toBe(2);
  });

  test('disconnecting with a queued action does not break the match', async () => {
    const matchID = 'disconnect-mid-flight';
    const departing = createClient(matchID, '0');
    const remaining = createClient(matchID, '1');
    await waitForSynced([departing, remaining]);
    clearActivity([departing, remaining]);

    const queue = server.transport.getMatchQueue(matchID);
    queue.pause();
    departing.client.moves.gift();
    await pollUntil(
      () => queue.size > 0,
      'the departing client action to queue',
    );
    stopClient(departing);
    queue.start();
    await queue.onIdle();
    await pollUntil(
      () =>
        (remaining.client.getState() as State<StressG> | null)?.G.counter === 1,
      'remaining client to receive the queued move',
    );

    remaining.client.moves.gift();
    const finalState = await waitForConvergence(matchID, [remaining]);

    expect(finalState.G.counter).toBe(2);
    expect(remaining.client.getState()?.G).toEqual(finalState.G);
    expectWireIsolation([remaining]);
  });
});
