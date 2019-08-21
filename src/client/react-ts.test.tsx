import React from 'react';
import { createTypescriptTestGame } from '../core/game-ts.test';
import Client from './react';

test('that a typescript game can be rendered with react', () => {
  const testClient = Client({
    game: createTypescriptTestGame(),
    board: function Board(props) {
      return <h1>{props.G.playerViewedValue}</h1>;
    },
  });
  expect(testClient).not.toBeNull();
});
