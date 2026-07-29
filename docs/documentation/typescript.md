# TypeScript

boardgame.io includes type definitions for TypeScript.

### Basic usage

```typescript
// Game.ts
import type { Game, Move } from "boardgame.io";

export interface MyGameState {
  // aka 'G', your game's state
}

const move: Move<MyGameState> = ({ G, ctx }) => {};

export const MyGame: Game<MyGameState> = {
  // ...
};
```

[Open this snippet in the TypeScript Playground ↗︎](https://www.typescriptlang.org/play/?#code/PTAEHEEMFsFMDoAuBnAsAKAJbQA4HsAnRURATx1lAG8IZYAaUAWTwDdKBfUAMwL2lAAiAEZ5IBACYBzOvEx5BAbgwZYAD3xFQmAHaJYBbpADGlJqShwAyokj7qGUKBChIAa0igA5OC+NSeACuBKAycF7IoMi2+hgcKujGeDrRoNBssABczBkAPOaWsDZ2sAB8oAC8oAAUNOCMxohqoBwAlJXlVBzK6KoahMRJKcQFdNmF+RZ0xfrlVVSOzmDwK3GKQA)

### React

React components must include boardgame.io-specific properties, so extend your
props from `BoardProps`. By passing your game state type to `BoardProps`,
you’ll get the correct typing for `G` in your board component.

```typescript
// Board.tsx
import type { BoardProps } from 'boardgame.io/react';
import type { MyGameState } from './Game.ts'

interface MyGameProps extends BoardProps<MyGameState> {
  // Additional custom properties for your component
}

export function MyGameBoard(props: MyGameProps) {
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
