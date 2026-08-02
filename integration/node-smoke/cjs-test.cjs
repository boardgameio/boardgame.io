const assert = require('node:assert/strict');

const { Client } = require('boardgame.io/client');
const { INVALID_MOVE } = require('boardgame.io/core');
const { Origins, Server } = require('boardgame.io/server');

assert.equal(typeof Server, 'function');
assert.equal(typeof Client, 'function');
assert.ok(INVALID_MOVE);

const server = Server({
  games: [{ name: 'smoke', setup: () => ({}), moves: {} }],
  origins: [Origins.LOCALHOST],
});

assert.ok(server.app);
assert.ok(server.run);

// Constructing a queue exercises the p-queue default import, which loading
// the bundle alone does not.
assert.equal(typeof server.transport.getMatchQueue('smoke').add, 'function');

console.log('CJS smoke OK');
