# Testing Strategies

#### Unit Tests

Moves are pure functions, so they lend themselves to easy testing. A useful strategy would be
to implement it as a standalone function before passing it to the `Game` constructor:

`game.js`

```js
export function clickCell(G, ctx, id) {
  const cells = [...G.cells];
  cells[id] = ctx.currentPlayer;
  return { ...G, cells };
}

Game({
  moves: { clickCell }
  ...
})
```

`game.test.js`

```js
import { clickCell } from './game';

it('should place the correct value in the cell', () => {
  // original state.
  const G = {
    cells: [null, null, null, null, null, null, null, null, null],
  };

  // make move.
  const newGameState = clickCell(G, { currentPlayer: '1' }, 3);

  // verify new state.
  expect(newGameState).toEqual({
    cells: [null, null, null, '1', null, null, null, null, null],
  });
});
```

#### Scenario Tests

Test your game logic in specific scenarios.

```js
// import vanilla Javascript client (not the React client).
import { Client } from 'boardgame.io/client';
import { TicTacToe } from './game';

it('should declare player 1 as the winner', () => {
  // set up a specific board scenario
  const TicTacToeCustomScenario = {
    ...TicTacToe,
    setup: () => ({
      cells: ['0', '0', null, '1', '1', null, null, null, null],
    }),
  };

  // initialize the client with your custom scenario
  const client = Client({
    game: TicTacToeCustomScenario,
  });

  // make some game moves
  client.moves.clickCell(8);
  client.moves.clickCell(5);

  // get the latest game state
  const { G, ctx } = client.store.getState();

  // the board should look like this now
  expect(G.cells).toEqual(['0', '0', null, '1', '1', '1', null, null, '0']);
  // player '1' should be declared the winner
  expect(ctx.gameover).toEqual({ winner: '1' });
});
```

#### Integration Tests

Test the application end-to-end from the UI layer's point of view.
In this case we mount our React component and look for the TicTacToe board inside of it.
We then check the board's props and invoke callbacks in order to see that the props changed accordingly.

```js
import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import App from './app';

Enzyme.configure({ adapter: new Adapter() });

test('should place marker', () => {
  const game = Enzyme.mount(<App />);
  const board = game.find('TicTacToeBoard').instance();
  const cells = Array(9).fill(null);

  expect(board.props.G).toEqual({ cells });
  expect(board.props.ctx.gameover).toEqual(undefined);

  board.props.moves.clickCell(5);

  expect(board.props.G).toEqual({
    cells: [null, null, null, null, null, '0', null, null, null],
  });
});
```
