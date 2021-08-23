# Typescript

boardgame.io includes type definitions for Typescript.

Basic boardgame.io game:

```typescript
// Game.tsx
import { Game } from 'boardgame.io';

export interface MyGameState {
  // aka 'G', your game's state
}

export const MyGame: Game<MyGameState> = {
  // ...
}
```

## React

React components must include boardgame.io-specific properties, so extend your props from `BoardProps`:

```typescript
// Board.tsx
import { BoardProps } from 'boardgame.io/react';

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
