# Phases

A round-robin turn order where each player makes
a number of moves before hitting `endTurn` might suffice
for simple games, but sometimes you need more structure
and customization.

A game `flow` allows you to define different phases that
follow their own turn-order rules, with the option to
specify certain automatic board "moves" that happen when
a phase begins or ends.

```js
import { Game, GameFlow } from 'boardgame.io/core';

Game({
  moves: {
    ...
  },

  flow: GameFlow({
    phases: [
      { name: 'A' },
      { name: 'B' },
      ...
    ],
  })
})
```
