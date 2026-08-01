/*
 * Copyright 2026 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { isDeepStrictEqual } from 'node:util';
import { Invalid } from '../core/constants';
import { ActivePlayers } from '../core/turn-order';
import { getFilterPlayerView } from '../master/filter-player-view';
import {
  Master,
  type TransportActionResult,
  type TransportData,
} from '../master/master';
import { InMemory } from '../server/db';
import type { ActionError, CredentialedActionShape, Game } from '../types';
import { Client } from './client';
import type { Transport } from './transport/transport';

jest.mock('../core/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

type StressG = {
  cells: Array<string | null>;
  counter: number;
};

const game: Game<StressG> = {
  name: 'stress',
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

const MATCH_ID = 'stress-match';

type ScriptedAction =
  | { type: 'take'; cell: number }
  | { type: 'gift' }
  | { type: 'reject' }
  | { type: 'endTurn' };

type ClientToMasterMessage =
  | { type: 'sync' }
  | {
      type: 'update';
      action: CredentialedActionShape.Any;
      stateID: number;
      actionID: number;
    };

type SentAction = {
  actionID: number;
  stateID: number;
  actionType: string;
  name: string;
  args: any[];
};

type ActionOrigin = {
  playerID: string;
  actionID: number;
};

type MasterToClientMessage = {
  data: TransportData;
  origin?: ActionOrigin;
  broadcast: boolean;
};

type DeliveredActionResult = ActionOrigin & {
  targetPlayerID: string;
  result: TransportActionResult;
  seq: number;
};

type Notification = {
  state: ReturnType<ReturnType<typeof Client>['getState']>;
  error?: ActionError;
  latestSentActionID?: number;
  actionResultID?: number;
};

type VirtualClient = {
  playerID: string;
  client: ReturnType<typeof Client>;
  deliver: (data: TransportData) => void;
  transport: Transport;
  clientToMaster: ClientToMasterMessage[];
  masterToClient: MasterToClientMessage[];
  sentActions: SentAction[];
  results: DeliveredActionResult[];
  notifications: Notification[];
  deliveredStateMessages: TransportData[];
  deliveryCounter: number;
  lastSyncSeq: number;
  latestSentActionID?: number;
  deliveringActionResultID?: number;
  script: ScriptedAction[];
  scriptIndex: number;
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

const randomIndex = (random: () => number, length: number) =>
  Math.floor(random() * length);

const drainMicrotasks = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

const hasTransientsKey = (value: unknown): boolean => {
  if (value === null || typeof value !== 'object') return false;
  if (Object.prototype.hasOwnProperty.call(value, 'transients')) return true;
  return Object.values(value).some((entry) => hasTransientsKey(entry));
};

class VirtualNetwork {
  readonly db = new InMemory();
  readonly master: Master;
  readonly clients: VirtualClient[] = [];
  readonly trace: string[] = [];
  private readonly filterPlayerView: ReturnType<typeof getFilterPlayerView>;
  private processingUpdate?: ActionOrigin;

  constructor(numPlayers = 3) {
    this.master = new Master(game, this.db, {
      send: ({ playerID, ...payload }) => {
        const target = this.getClient(playerID);
        const origin =
          payload.type === 'actionResult'
            ? this.processingUpdate && { ...this.processingUpdate }
            : undefined;
        if (payload.type === 'actionResult' && origin === undefined) {
          throw new Error('actionResult emitted outside an update');
        }
        target.masterToClient.push({
          data: this.filterPlayerView(target.playerID, payload),
          origin,
          broadcast: false,
        });
      },
      sendAll: (payload) => {
        for (const target of this.clients) {
          target.masterToClient.push({
            data: this.filterPlayerView(target.playerID, payload),
            broadcast: true,
          });
        }
      },
    });
    this.filterPlayerView = getFilterPlayerView(this.master.game);

    for (let index = 0; index < numPlayers; index++) {
      this.addClient(String(index), numPlayers);
    }
  }

  private addClient(playerID: string, numPlayers: number) {
    const record = {
      playerID,
      client: undefined,
      deliver: undefined,
      transport: undefined,
      clientToMaster: [],
      masterToClient: [],
      sentActions: [],
      results: [],
      notifications: [],
      deliveredStateMessages: [],
      deliveryCounter: 0,
      lastSyncSeq: -1,
      script: [],
      scriptIndex: 0,
    } as unknown as VirtualClient;

    const client = Client<StressG>({
      game,
      matchID: MATCH_ID,
      playerID,
      numPlayers,
      debug: false,
      multiplayer: ({ transportDataCallback }) => {
        record.deliver = transportDataCallback;
        record.transport = {
          isConnected: true,
          connect: () => record.clientToMaster.push({ type: 'sync' }),
          disconnect() {},
          subscribeToConnectionStatus() {},
          requestSync: () => record.clientToMaster.push({ type: 'sync' }),
          sendAction: (state, action, actionID) => {
            if (actionID === undefined) {
              throw new Error(`missing actionID for player ${playerID}`);
            }
            const args = Array.isArray(action.payload.args)
              ? action.payload.args
              : [];
            record.latestSentActionID = actionID;
            record.sentActions.push({
              actionID,
              stateID: state._stateID,
              actionType: action.type,
              name: action.payload.type,
              args,
            });
            record.clientToMaster.push({
              type: 'update',
              action,
              stateID: state._stateID,
              actionID,
            });
            this.trace.push(
              `p${playerID} send #${actionID} ${action.payload.type}${JSON.stringify(
                args,
              )} base=${state._stateID} local=${
                record.client.store.getState()._stateID
              }`,
            );
          },
          sendChatMessage() {},
          updateMatchID() {},
          updatePlayerID() {},
          updateCredentials() {},
        } as unknown as Transport;
        return record.transport;
      },
    });

    record.client = client;
    client.subscribe((state, error) => {
      record.notifications.push({
        state,
        error,
        latestSentActionID: record.latestSentActionID,
        actionResultID: record.deliveringActionResultID,
      });
    });
    this.clients.push(record);
    client.start();
  }

  private getClient(playerID: string) {
    const client = this.clients.find((entry) => entry.playerID === playerID);
    if (!client) throw new Error(`unknown player ${playerID}`);
    return client;
  }

  setScripts(scripts: ScriptedAction[][]) {
    scripts.forEach((script, index) => {
      this.clients[index].script = script;
      this.clients[index].scriptIndex = 0;
    });
  }

  requestSync(playerID: string) {
    this.getClient(playerID).transport.requestSync();
  }

  dispatch(playerID: string, action: ScriptedAction) {
    const client = this.getClient(playerID).client;
    switch (action.type) {
      case 'take': {
        client.moves.take(action.cell);
        break;
      }
      case 'gift': {
        client.moves.gift();
        break;
      }
      case 'reject': {
        client.moves.reject();
        break;
      }
      case 'endTurn': {
        if (!client.events.endTurn) throw new Error('endTurn is not enabled');
        client.events.endTurn();
        break;
      }
    }
  }

  dispatchNext(playerID: string) {
    const client = this.getClient(playerID);
    const action = client.script[client.scriptIndex++];
    if (!action) throw new Error(`player ${playerID} has no scripted action`);
    this.dispatch(playerID, action);
  }

  async deliverToMaster(playerID: string) {
    const client = this.getClient(playerID);
    const message = client.clientToMaster.shift();
    if (!message) throw new Error(`no client→master message for ${playerID}`);

    if (message.type === 'sync') {
      await this.master.onSync(
        MATCH_ID,
        playerID,
        undefined,
        this.clients.length,
      );
      this.trace.push(`master sync p${playerID}`);
    } else {
      const masterBefore = this.db.fetch(MATCH_ID, { state: true }).state
        ._stateID;
      this.processingUpdate = { playerID, actionID: message.actionID };
      try {
        await this.master.onUpdate(
          message.action,
          message.stateID,
          MATCH_ID,
          playerID,
          message.actionID,
        );
      } finally {
        this.processingUpdate = undefined;
      }
      const masterAfter = this.db.fetch(MATCH_ID, { state: true }).state
        ._stateID;
      const resultMessage = client.masterToClient.findLast(
        ({ data, origin }) =>
          data.type === 'actionResult' && origin?.actionID === message.actionID,
      );
      const outcome =
        resultMessage?.data.type === 'actionResult'
          ? resultMessage.data.args[2].error?.type || 'success'
          : 'missing-result';
      this.trace.push(
        `master recv p${playerID} #${message.actionID} base=${
          message.stateID
        } state=${masterBefore}->${masterAfter} ${outcome}`,
      );
    }
    await drainMicrotasks();
  }

  async deliverToClient(playerID: string, index = 0) {
    const client = this.getClient(playerID);
    const [message] = client.masterToClient.splice(index, 1);
    if (!message) throw new Error(`no master→client message for ${playerID}`);

    const seq = ++client.deliveryCounter;
    if (message.data.type === 'actionResult') {
      const [, actionID, result] = message.data.args;
      client.results.push({
        targetPlayerID: playerID,
        playerID: message.origin?.playerID,
        actionID,
        result,
        seq,
      });
      client.deliveringActionResultID = actionID;
    }
    if (
      message.data.type === 'sync' ||
      message.data.type === 'update' ||
      message.data.type === 'patch'
    ) {
      client.deliveredStateMessages.push(message.data);
      if (message.data.type === 'sync') client.lastSyncSeq = seq;
    }

    const stateBefore = client.client.getState()?._stateID;
    try {
      client.deliver(message.data);
    } finally {
      client.deliveringActionResultID = undefined;
    }
    const stateAfter = client.client.getState()?._stateID;
    const description = (() => {
      switch (message.data.type) {
        case 'sync': {
          return `sync state=${message.data.args[1].state._stateID}`;
        }
        case 'update': {
          return `update state=${message.data.args[1]._stateID}`;
        }
        case 'patch': {
          return `patch state=${message.data.args[2]}`;
        }
        case 'actionResult': {
          const [, actionID, result] = message.data.args;
          return `result #${actionID} ${result.error?.type || 'success'}`;
        }
        default: {
          return message.data.type;
        }
      }
    })();
    this.trace.push(
      `p${playerID} recv ${description} local=${stateBefore}->${stateAfter}`,
    );
    await drainMicrotasks();
  }

  async deliverToClientByType(playerID: string, type: TransportData['type']) {
    const client = this.getClient(playerID);
    const index = client.masterToClient.findIndex(
      (message) => message.data.type === type,
    );
    if (index === -1) {
      throw new Error(`no ${type} message for player ${playerID}`);
    }
    await this.deliverToClient(playerID, index);
  }

  async syncAll() {
    for (const client of this.clients)
      await this.deliverToMaster(client.playerID);
    while (this.clients.some((client) => client.masterToClient.length > 0)) {
      const client = this.clients.find(
        (entry) => entry.masterToClient.length > 0,
      );
      await this.deliverToClient(client.playerID);
    }
  }

  async drain() {
    while (this.hasQueuedMessages()) {
      const toMaster = this.clients.find(
        (client) => client.clientToMaster.length > 0,
      );
      if (toMaster) {
        await this.deliverToMaster(toMaster.playerID);
        continue;
      }
      const toClient = this.clients.find(
        (client) => client.masterToClient.length > 0,
      );
      await this.deliverToClient(toClient.playerID);
    }
  }

  hasQueuedMessages() {
    return this.clients.some(
      (client) =>
        client.clientToMaster.length > 0 || client.masterToClient.length > 0,
    );
  }

  hasRemainingScripts() {
    return this.clients.some(
      (client) => client.scriptIndex < client.script.length,
    );
  }

  stop() {
    for (const client of this.clients) client.client.stop();
  }
}

function createScripts(seed: number): ScriptedAction[][] {
  const random = mulberry32(seed ^ 0xa5_a5_a5_a5);
  return Array.from({ length: 3 }, () =>
    Array.from({ length: 20 }, (): ScriptedAction => {
      const choice = random();
      if (choice < 0.1) return { type: 'endTurn' };
      if (choice < 0.55) {
        return { type: 'take', cell: randomIndex(random, 10) };
      }
      if (choice < 0.78) return { type: 'gift' };
      return { type: 'reject' };
    }),
  );
}

async function runSeed(seed: number) {
  const network = new VirtualNetwork();
  const random = mulberry32(seed);
  network.setScripts(createScripts(seed));

  let steps = 0;
  while (network.clients.some(({ client }) => client.getState() === null)) {
    const queues = network.clients.flatMap((client) => [
      ...(client.clientToMaster.length > 0
        ? [{ direction: 'toMaster' as const, playerID: client.playerID }]
        : []),
      ...(client.masterToClient.length > 0
        ? [{ direction: 'toClient' as const, playerID: client.playerID }]
        : []),
    ]);
    if (queues.length === 0) {
      throw new Error(`[seed ${seed}] initial sync reached a dead end`);
    }
    const queue = queues[randomIndex(random, queues.length)];
    await (queue.direction === 'toMaster'
      ? network.deliverToMaster(queue.playerID)
      : network.deliverToClient(queue.playerID));
    if (++steps > 1000) {
      throw new Error(`[seed ${seed}] initial sync exceeded 1000 steps`);
    }
  }

  while (network.hasQueuedMessages() || network.hasRemainingScripts()) {
    const dispatchable = network.clients.filter(
      (client) => client.scriptIndex < client.script.length,
    );
    const queues = network.clients.flatMap((client) => [
      ...(client.clientToMaster.length > 0
        ? [{ direction: 'toMaster' as const, playerID: client.playerID }]
        : []),
      ...(client.masterToClient.length > 0
        ? [{ direction: 'toClient' as const, playerID: client.playerID }]
        : []),
    ]);

    const shouldDispatch =
      dispatchable.length > 0 && (queues.length === 0 || random() < 0.5);
    if (shouldDispatch) {
      const client = dispatchable[randomIndex(random, dispatchable.length)];
      network.dispatchNext(client.playerID);
    } else {
      const queue = queues[randomIndex(random, queues.length)];
      await (queue.direction === 'toMaster'
        ? network.deliverToMaster(queue.playerID)
        : network.deliverToClient(queue.playerID));
    }

    await drainMicrotasks();
    if (++steps > 10_000) {
      throw new Error(`[seed ${seed}] scheduler exceeded 10000 steps`);
    }
  }

  return network;
}

function collectInvariantViolations(seed: number, network: VirtualNetwork) {
  const violations: string[] = [];
  const masterState = network.db.fetch(MATCH_ID, { state: true }).state;
  const sentByPlayerAndID = new Map<string, SentAction>();
  let convergenceFailed = false;

  for (const client of network.clients) {
    for (const sent of client.sentActions) {
      sentByPlayerAndID.set(`${client.playerID}:${sent.actionID}`, sent);
    }

    const sentIDs = client.sentActions.map(({ actionID }) => actionID).sort();
    const resultIDs = client.results.map(({ actionID }) => actionID).sort();
    if (!isDeepStrictEqual(resultIDs, sentIDs)) {
      violations.push(
        `player ${client.playerID} result IDs ${JSON.stringify(
          resultIDs,
        )} did not exactly match sent IDs ${JSON.stringify(sentIDs)}`,
      );
    }

    for (const result of client.results) {
      if (result.targetPlayerID !== client.playerID) {
        violations.push(
          `player ${client.playerID} recorded a result targeted at ${result.targetPlayerID}`,
        );
      }
      if (result.playerID !== client.playerID) {
        violations.push(
          `player ${client.playerID} received player ${result.playerID}'s action ${result.actionID}`,
        );
      }
      if (
        !client.sentActions.some((sent) => sent.actionID === result.actionID)
      ) {
        violations.push(
          `player ${client.playerID} received unsent actionID ${result.actionID}`,
        );
      }
    }

    const state = client.client.getState();
    if (state === null) {
      violations.push(`player ${client.playerID} has no final state`);
    } else {
      if (!isDeepStrictEqual(state.G, masterState.G)) {
        convergenceFailed = true;
        violations.push(
          `player ${client.playerID} G diverged: ${JSON.stringify(
            state.G,
          )} vs ${JSON.stringify(masterState.G)}`,
        );
      }
      if (state._stateID !== masterState._stateID) {
        convergenceFailed = true;
        violations.push(
          `player ${client.playerID} stateID ${state._stateID} != ${masterState._stateID}`,
        );
      }
      if (state.ctx.turn !== masterState.ctx.turn) {
        convergenceFailed = true;
        violations.push(
          `player ${client.playerID} turn ${state.ctx.turn} != ${masterState.ctx.turn}`,
        );
      }
      if (state.ctx.currentPlayer !== masterState.ctx.currentPlayer) {
        convergenceFailed = true;
        violations.push(
          `player ${client.playerID} currentPlayer ${state.ctx.currentPlayer} != ${masterState.ctx.currentPlayer}`,
        );
      }
      if (hasTransientsKey(state)) {
        violations.push(
          `player ${client.playerID} final state contains transients`,
        );
      }
    }

    if (
      client.deliveredStateMessages.some((message) => hasTransientsKey(message))
    ) {
      violations.push(
        `player ${client.playerID} received a state payload containing transients`,
      );
    }

    const highestSent = client.sentActions.at(-1);
    const highestResult = client.results.find(
      ({ actionID }) => actionID === highestSent?.actionID,
    );
    // A sync delivered after the result clears lastActionError.
    const expectedError =
      highestResult !== undefined && client.lastSyncSeq > highestResult.seq
        ? undefined
        : highestResult?.result.error;
    if (!isDeepStrictEqual(client.client.lastActionError, expectedError)) {
      violations.push(
        `player ${client.playerID} lastActionError ${JSON.stringify(
          client.client.lastActionError,
        )} != expected ${JSON.stringify(expectedError)}`,
      );
    }

    const errorNotifications = client.notifications.filter(
      ({ error }) => error !== undefined,
    );
    const receivedErrors = client.results.filter(
      ({ result }) => result.error !== undefined,
    );
    if (errorNotifications.length > receivedErrors.length) {
      violations.push(
        `player ${client.playerID} emitted ${errorNotifications.length} error events for ${receivedErrors.length} error results`,
      );
    }
    for (const notification of errorNotifications) {
      if (
        notification.actionResultID === undefined ||
        notification.actionResultID !== notification.latestSentActionID
      ) {
        violations.push(
          `player ${client.playerID} emitted an error for action ${notification.actionResultID} while latest was ${notification.latestSentActionID}`,
        );
      }
      const result = client.results.find(
        ({ actionID }) => actionID === notification.actionResultID,
      );
      if (!isDeepStrictEqual(notification.error, result?.result.error)) {
        violations.push(
          `player ${client.playerID} emitted an error not matching action ${notification.actionResultID}`,
        );
      }
    }
  }

  const allResults = network.clients.flatMap(({ results }) => results);
  const successfulResults = allResults.filter(({ result }) => !result.error);
  if (masterState._stateID !== successfulResults.length) {
    violations.push(
      `master stateID ${masterState._stateID} != ${successfulResults.length} successful results`,
    );
  }

  const successfulActions = successfulResults.map((result) => ({
    result,
    sent: sentByPlayerAndID.get(`${result.playerID}:${result.actionID}`),
  }));
  const successfulGifts = successfulActions.filter(
    ({ sent }) => sent?.actionType === 'MAKE_MOVE' && sent.name === 'gift',
  );
  if (masterState.G.counter !== successfulGifts.length) {
    violations.push(
      `counter ${masterState.G.counter} != ${successfulGifts.length} successful gifts`,
    );
  }

  for (let cell = 0; cell < masterState.G.cells.length; cell++) {
    const successfulTakes = successfulActions.filter(
      ({ sent }) =>
        sent?.actionType === 'MAKE_MOVE' &&
        sent.name === 'take' &&
        sent.args[0] === cell,
    );
    const owner = masterState.G.cells[cell];
    if (owner === null && successfulTakes.length > 0) {
      violations.push(
        `empty cell ${cell} had ${successfulTakes.length} successful takes`,
      );
    }
    if (
      owner !== null &&
      (successfulTakes.length !== 1 ||
        successfulTakes[0].result.playerID !== owner)
    ) {
      violations.push(
        `cell ${cell} owner ${owner} did not match successful takes ${JSON.stringify(
          successfulTakes.map(({ result }) => result.playerID),
        )}`,
      );
    }
  }

  for (const client of network.clients) {
    for (const sent of client.sentActions.filter(
      ({ actionType, name }) => actionType === 'MAKE_MOVE' && name === 'take',
    )) {
      const delivered = client.results.find(
        ({ actionID }) => actionID === sent.actionID,
      );
      if (!delivered?.result.error) continue;
      const { error } = delivered.result;
      const isStale = error.type === 'action/stale_state_id';
      const isTaken =
        error.type === 'action/invalid_move' &&
        isDeepStrictEqual(error.payload, {
          code: 'TAKEN',
          cell: sent.args[0],
        });
      if (!isStale && !isTaken) {
        violations.push(
          `player ${client.playerID} take(${sent.args[0]}) failed with ${JSON.stringify(
            error,
          )}`,
        );
      }
    }
  }

  if (convergenceFailed) {
    violations.push(
      `final interleaving: ${network.trace.slice(-30).join(' | ')}`,
    );
  }

  return { seed, violations };
}

const DEFAULT_SEEDS = [
  0x00_00_00_01, 0x00_00_00_02, 0x00_00_00_03, 0x00_00_00_05, 0x00_00_00_08,
  0x00_00_00_0d, 0x00_00_00_15, 0x00_00_00_22, 0x00_00_00_37, 0x00_00_00_59,
  0x00_00_00_90, 0x00_00_00_e9, 0x00_00_01_79, 0x00_00_02_62, 0x00_00_03_db,
  0x00_00_06_3d, 0x00_00_0a_18, 0x00_00_10_55, 0x00_00_1a_6d, 0x00_00_2a_c2,
  0x00_00_45_2f, 0x00_00_6f_f1, 0x00_00_b5_20, 0x00_01_25_11, 0x00_01_da_31,
];

const requestedSeedCount = Number.parseInt(process.env.STRESS_SEEDS || '', 10);
const seedCount =
  Number.isFinite(requestedSeedCount) && requestedSeedCount > 0
    ? requestedSeedCount
    : DEFAULT_SEEDS.length;
const soakSeedGenerator = mulberry32(0x12_74_c0_de);
const seeds = Array.from({ length: seedCount }, (_, index) =>
  index < DEFAULT_SEEDS.length
    ? DEFAULT_SEEDS[index]
    : Math.floor(soakSeedGenerator() * 0x1_00_00_00_00),
);

describe('multiplayer action-result interleaving fuzz', () => {
  test.each(seeds)('preserves all invariants for seed %i', async (seed) => {
    const network = await runSeed(seed);
    const report = collectInvariantViolations(seed, network);
    network.stop();
    expect(report).toEqual({ seed, violations: [] });
  });
});

const expectConverged = (network: VirtualNetwork, playerIDs = ['0', '1']) => {
  const masterState = network.db.fetch(MATCH_ID, { state: true }).state;
  for (const playerID of playerIDs) {
    const state = network.clients[Number(playerID)].client.getState();
    expect(state).not.toBeNull();
    expect(state.G).toEqual(masterState.G);
    expect(state._stateID).toBe(masterState._stateID);
  }
};

describe('directed action-result interleavings', () => {
  test('two clients racing the same cell converge with one loser error', async () => {
    const network = new VirtualNetwork();
    await network.syncAll();

    network.dispatch('0', { type: 'take', cell: 4 });
    network.dispatch('1', { type: 'take', cell: 4 });
    await network.deliverToMaster('0');
    await network.deliverToClient('1');
    await network.deliverToMaster('1');
    await network.drain();

    const masterState = network.db.fetch(MATCH_ID, { state: true }).state;
    const loserError = network.clients[1].results[0].result.error;
    const result = {
      owner: masterState.G.cells[4],
      loserError,
      winnerResults: network.clients[0].results.length,
      loserResults: network.clients[1].results.length,
    };
    expectConverged(network);
    network.stop();

    expect(result.owner).toBe('0');
    expect(result.winnerResults).toBe(1);
    expect(result.loserResults).toBe(1);
    expect([
      {
        type: 'action/invalid_move',
        payload: { code: 'TAKEN', cell: 4 },
      },
      { type: 'action/stale_state_id' },
    ]).toContainEqual(result.loserError);
  });

  test('pipelined rejection is stale and the newer result owns lastActionError', async () => {
    const network = new VirtualNetwork();
    await network.syncAll();

    network.dispatch('0', { type: 'reject' });
    network.dispatch('0', { type: 'gift' });
    network.clients[0].notifications = [];
    await network.deliverToMaster('0');
    await network.deliverToMaster('0');
    await network.drain();

    const actor = network.clients[0];
    const result = {
      sentIDs: actor.sentActions.map(({ actionID }) => actionID),
      resultErrors: actor.results.map(({ result }) => result.error),
      errorEvents: actor.notifications.filter(({ error }) => error).length,
      lastActionError: actor.client.lastActionError,
    };
    expectConverged(network, ['0']);
    const masterState = network.db.fetch(MATCH_ID, { state: true }).state;
    network.stop();

    expect(result.sentIDs).toEqual([1, 2]);
    expect(result.resultErrors[0]).toEqual({
      type: 'action/invalid_move',
      payload: { code: 'NO' },
    });
    expect(result.resultErrors[1]).toBeUndefined();
    expect(result.errorEvents).toBe(0);
    expect(result.lastActionError).toBeUndefined();
    expect(masterState.G.counter).toBe(1);
  });

  test('result-before-broadcast reports the error and preserves it', async () => {
    const network = new VirtualNetwork();
    await network.syncAll();

    network.dispatch('0', { type: 'reject' });
    await network.deliverToMaster('0');
    network.clients[0].notifications = [];
    await network.deliverToClientByType('0', 'actionResult');
    const errorAfterResult = network.clients[0].client.lastActionError;
    await network.deliverToClientByType('0', 'update');

    const actor = network.clients[0];
    const notificationErrors = actor.notifications.map(({ error }) => error);
    const finalError = actor.client.lastActionError;
    await network.drain();
    network.stop();

    expect(errorAfterResult).toEqual({
      type: 'action/invalid_move',
      payload: { code: 'NO' },
    });
    expect(notificationErrors).toEqual([errorAfterResult, undefined]);
    expect(finalError).toEqual(errorAfterResult);
  });

  test('a fresh sync invalidates a queued in-flight result', async () => {
    const network = new VirtualNetwork();
    await network.syncAll();

    network.dispatch('0', { type: 'reject' });
    await network.deliverToMaster('0');
    network.requestSync('0');
    await network.deliverToMaster('0');
    network.clients[0].notifications = [];

    await network.deliverToClientByType('0', 'sync');
    await network.deliverToClientByType('0', 'actionResult');
    await network.drain();

    const actor = network.clients[0];
    const result = {
      lastActionError: actor.client.lastActionError,
      errorEvents: actor.notifications.filter(({ error }) => error).length,
    };
    network.stop();

    expect(result).toEqual({ lastActionError: undefined, errorEvents: 0 });
  });

  test('a rejection while optimistically ahead self-heals via sync', async () => {
    const network = new VirtualNetwork();
    await network.syncAll();
    const actor = network.clients[0];
    actor.notifications = [];
    actor.deliveredStateMessages = [];

    // p0 pipelines three locally-valid moves; the master accepts two of p1's
    // moves first, so all of p0's are rejected and every broadcast stays
    // below p0's optimistic stateID.
    network.dispatch('1', { type: 'take', cell: 3 });
    network.dispatch('1', { type: 'take', cell: 4 });
    network.dispatch('0', { type: 'take', cell: 2 });
    network.dispatch('0', { type: 'take', cell: 4 });
    network.dispatch('0', { type: 'take', cell: 3 });
    await network.deliverToMaster('1');
    await network.deliverToMaster('1');
    await network.deliverToMaster('0');
    await network.deliverToMaster('0');
    await network.deliverToMaster('0');
    await network.drain();

    const observed = {
      resultErrors: actor.results.map(({ result }) => result.error?.type),
      errorEvents: actor.notifications.filter(({ error }) => error).length,
      lastActionError: actor.client.lastActionError,
      healSyncs: actor.deliveredStateMessages.filter(
        ({ type }) => type === 'sync',
      ).length,
    };
    expectConverged(network, ['0', '1', '2']);
    network.stop();

    expect(observed.resultErrors).toEqual([
      'action/stale_state_id',
      'action/stale_state_id',
      'action/invalid_move',
    ]);
    expect(observed.errorEvents).toBe(1);
    expect(observed.lastActionError).toBeUndefined();
    expect(observed.healSyncs).toBe(1);
  });

  test('an error subscriber can synchronously dispatch the next action', async () => {
    const network = new VirtualNetwork();
    await network.syncAll();
    const actor = network.clients[0];
    actor.notifications = [];
    let reentered = false;
    const unsubscribe = actor.client.subscribe((_state, error) => {
      if (error && !reentered) {
        reentered = true;
        actor.client.moves.gift();
      }
    });

    network.dispatch('0', { type: 'reject' });
    await network.deliverToMaster('0');
    await network.deliverToClient('0');
    await network.deliverToClient('0');
    await network.drain();

    const masterState = network.db.fetch(MATCH_ID, { state: true }).state;
    const result = {
      reentered,
      sentIDs: actor.sentActions.map(({ actionID }) => actionID),
      resultIDs: actor.results.map(({ actionID }) => actionID),
      errorEvents: actor.notifications.filter(({ error }) => error).length,
      lastActionError: actor.client.lastActionError,
      counter: masterState.G.counter,
    };
    expectConverged(network, ['0']);
    unsubscribe();
    network.stop();

    expect(result).toEqual({
      reentered: true,
      sentIDs: [1, 2],
      resultIDs: [1, 2],
      errorEvents: 1,
      lastActionError: undefined,
      counter: 1,
    });
  });
});
