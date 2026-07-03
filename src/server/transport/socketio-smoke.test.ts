/**
 * @jest-environment node
 */

// Issue #7 smoke test: NO mocks for socket.io. Verifies that after dropping
// koa-socket-2, a real Server end-to-end accepts two real socket.io-client
// connections, syncs both, broadcasts a move from one to the other, and
// handles disconnect.

import { io as ioClient } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { Server } from '../index';
import type { Game } from '../../types';

jest.mock('../../core/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('socket.io v4 transport (no mocks)', () => {
  const game: Game = {
    name: 'smoke',
    setup: () => ({ value: 0 }),
    moves: {
      bump: ({ G }: { G: { value: number } }) => {
        G.value += 1;
      },
    },
  };

  let server: ReturnType<typeof Server>;
  let servers: { appServer: any; apiServer?: any };
  let port: number;

  beforeAll(async () => {
    server = Server({ games: [game], origins: ['http://localhost:3000'] });
    servers = await server.run(0);
    port = servers.appServer.address().port;
  });

  afterAll(() => {
    server.kill(servers);
  });

  test('two clients sync, one moves, both receive the update', async () => {
    const url = `http://localhost:${port}/smoke`;
    const a: Socket = ioClient(url, {
      transports: ['websocket'],
      forceNew: true,
    });
    const b: Socket = ioClient(url, {
      transports: ['websocket'],
      forceNew: true,
    });

    const updatesA: any[] = [];
    const updatesB: any[] = [];
    a.on('update', (_matchID, state) => updatesA.push(state.G.value));
    b.on('update', (_matchID, state) => updatesB.push(state.G.value));

    await Promise.all([
      new Promise<void>((r) => a.on('connect', () => r())),
      new Promise<void>((r) => b.on('connect', () => r())),
    ]);

    a.emit('sync', 'match-1', '0', 2);
    b.emit('sync', 'match-1', '1', 2);
    await new Promise((r) => setTimeout(r, 150));

    a.emit(
      'update',
      { type: 'MAKE_MOVE', payload: { type: 'bump', args: [], playerID: '0' } },
      0,
      'match-1',
      '0'
    );
    await new Promise((r) => setTimeout(r, 300));

    expect(updatesA).toContain(1);
    expect(updatesB).toContain(1);

    const bDisc = new Promise<void>((r) => b.on('disconnect', () => r()));
    b.disconnect();
    await bDisc;

    a.disconnect();
    await new Promise((r) => setTimeout(r, 50));
  }, 10_000);
});
