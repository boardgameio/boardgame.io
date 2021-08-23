# TypeScript

boardgame.io includes type definitions for TypeScript.

### Basic usage

```typescript
// Game.ts
import type { Game, Move } from "boardgame.io";

export interface MyGameState {
  // aka 'G', your game's state
}

const move: Move<MyGameState> = (G, ctx) => {};

export const MyGame: Game<MyGameState> = {
  // ...
};
```

[Open this snippet in the TypeScript Playground ↗︎](https://www.typescriptlang.org/play?#code/PTAEHEEMFsFMDoAuBnAUAS2gBwPYCdFREBPLWUAbwhlgBpQBZHAN3IF9QAzPHaUAcgBGOSHgAmAcxrx0OfgG5UqWAA9cBUOgB2iWHk6QAxuQbEocAMqJIuyqlCgQoSAGtIA8P3rEcAVzygUnD8yKDI1rqobEqGOFrhoNAssABcjMkAPKbmsFY2sAB8oAC8oAAU4PSGiCoAlCVFFGyKymr4hLHxhNk0aTlZZjR5ukWlFPaOYPDTUUA)

### React

React components must include boardgame.io-specific properties, so extend your props from `BoardProps`:

```typescript
// Board.tsx
import type { BoardProps } from 'boardgame.io/react';

interface MyGameProps extends BoardProps {
  // Custom properties for your component
}

export class MyGameBoard extends React.Component<MyGameProps> {
  // Your game board
}
```

Read more about [Client](api/Client.md) in the reference. No special typing should be required.

```typescript
// App.tsx
import { Client } from 'boardgame.io/react';

import { MyGame } from './Game';
import { MyGameBoard } from './Board';

const App = Client({
  game: MyGame,
  board: MyGameBoard,
});
export default App;
```

?> Want to see a more complete example? Check out a TypeScript–React implementation of the Tic-Tac-Toe tutorial on CodeSandbox:
<br/><br/>
[![Edit boardgame.io React-TypeScript demo](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/boardgame-io-react-typescript-demo-u5uvm?fontsize=14&hidenavigation=1&theme=dark)
