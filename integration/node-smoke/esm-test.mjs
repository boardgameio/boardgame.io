import assert from 'node:assert/strict';

import { Client } from 'boardgame.io/client';
import { INVALID_MOVE } from 'boardgame.io/core';
import { Origins, Server } from 'boardgame.io/server';

assert.equal(typeof Server, 'function');
assert.equal(typeof Client, 'function');
assert.ok(INVALID_MOVE);

const server = Server({
  games: [{ name: 'smoke', setup: () => ({}), moves: {} }],
  origins: [Origins.LOCALHOST],
});

assert.ok(server.app);
assert.ok(server.run);

console.log('ESM smoke OK');
