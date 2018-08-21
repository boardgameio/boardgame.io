# Tests


#### Unit Tests
Test the move function logic independently from the game. Because the move functions are You are the one who implements the move function so you are aware of which values you need to pass it in order to have it work properly. In our case `G` should have the `cells` property and `ctx` should have the `currentPlayer` property.


`App.js`
```js
export function clickCell(G, ctx, id) {
  const cells = [...G.cells];
  cells[id] = ctx.currentPlayer;
  return { ...G, cells };
}
Game({
  ...
  moves: {
    clickCell
  }
  ...
})
```

`App.spec.js`
```js
// import our move function
import { clickCell } from './App';

it ('should place the correct value in the cell', () => {
  const gameState = {
    cells: [null, null, null, null, null, null, null, null, null]
  };
  // click on cell index 3 as player '1'
  const newGameState = clickCell(gameState, { currentPlayer: '1' }, 3);
  // check the new state that the clickCell move returned
  expect(newGameState).toEqual({
    cells: [null, null, null, '1', null, null, null, null, null]
  });
});
```

#### Scenario Tests
Test a flow of the game decoupled from the UI layer. Even if you use the `react` or `reactNative` client in your actual application code, you can initialize a vanilla javascript `Client` with your game definition for your tests.

```js
// import vanilla javascript client
import { Client } from 'boardgame.io/client';
// import game
import { TicTacToe } from './App';

it('should declare player 1 as the winner', () => {
  // setup a specific board scenario
  const TicTacToeCustomScenario = { ...TicTacToe, setup: () => ({ cells: ['0', '0', null, '1', '1', null, null, null, null] }) };
  // initialize the client with your custom scenario
  const client = Client({
    game: TicTacToeCustomScenario
  });
  // make some game moves
  client.moves.clickCell(8);
  client.events.endTurn();
  client.moves.clickCell(5);
  // get the latest game state
  const { G, ctx } = client.store.getState();
  // the board should look like this now
  expect(G.cells).toEqual(['0', '0', null, '1', '1', '1', null, null, '0']);
  // player '1' should be declared the winner
  expect(ctx.gameover).toEqual({winner: '1'})
});
```

#### Integration Tests
Test the application from the UI layer's point of view. In this case we mount our React component and look for the TicTacToe board inside of it. We then check the board's props and invoke callbacks in order to see that the props changed accordingly.

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

  expect(board.props.G).toEqual({
    cells: cells
  });
  expect(board.props.ctx.gameover).toEqual(undefined);

  const moves = [0, 3, 1, 4, 2];
  board.props.moves.clickCell(5);

  expect(board.props.G).toEqual({
    cells: [null, null, null, null, null, '0', null, null, null]
  });
});
```
