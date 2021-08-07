# Testing Strategies

### Unit Tests

Moves are just functions, so they lend themselves to unit testing.
A useful strategy is to implement each move as a standalone function
before passing them to the game object:

`Game.js`

```js
export function clickCell(G, ctx, id) {
  G.cells[id] = ctx.currentPlayer;
}

export const TicTacToe = {
  moves: { clickCell },
  // ...
}
```

`Game.test.js`

```js
import { clickCell } from './Game';

it('should place the correct value in the cell', () => {
  // original state.
  const G = {
    cells: [null, null, null, null, null, null, null, null, null],
  };

  // make move.
  clickCell(G, { currentPlayer: '1' }, 3);

  // verify new state.
  expect(G).toEqual({
    cells: [null, null, null, '1', null, null, null, null, null],
  });
});
```

### Scenario Tests

Test your game logic in specific scenarios.

```js
import { Client } from 'boardgame.io/client';
import { TicTacToe } from './Game';

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

!> Note that we imported the vanilla JavaScript client, not the
one from `boardgame.io/react`.

### Multiplayer Tests

Use the local multiplayer mode to simulate multiplayer interactions
in unit tests.

```js
it('multiplayer test', () => {
  const spec = {
    game: MyGame,
    multiplayer: Local(),
  };

  const p0 = Client({ ...spec, playerID: '0' });
  const p1 = Client({ ...spec, playerID: '1' });

  p0.start();
  p1.start();

  p0.moves.moveA();
  p0.events.endTurn();

  // Player 1's state reflects the moves made by Player 0.
  expect(p1.getState()).toEqual(...);

  p1.moves.moveA();
  p1.events.endTurn();

  ...
});
```

### Integration Tests

Test the application end-to-end from the UI layer's point of view.

In this case we use [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
to mount our React component and look for the TicTacToe board inside of it.
We then check the board is rendered and responds to user interaction as expected.

```js
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import App from './app';

describe('Tic-Tac-Toe', () => {
  const { container } = render(<App />);
  const cells = container.querySelectorAll('td');
  
  test('board is empty initially', () => {
    expect(cells).toHaveLength(9);
    for (const cell of cells) {
      expect(cell).toBeEmptyDOMElement();
    }
  });
  
  test('clicking a cell places player 0’s marker', () => {
    fireEvent.click(cells[5]);
    expect(cells[5]).toHaveTextContent('0');
  });
});
```
