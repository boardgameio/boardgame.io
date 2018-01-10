# v0.16.0

###  Features

- [Phases](http://boardgame.io/#/phases)

### Breaking Changes

- `boardgame.io/game` is now `boardgame.io/core`, and does not have a default export.

```
// v0.16
import { Game } from 'boardgame.io/core'
```

```
// v0.15
import Game from 'boardgame.io/game'
```

- `victory` is now `endGameIf`, and goes inside a `flow` section.
- The semantics of `endGameIf` are subtly different. The game ends if
  the function returns anything at all.
- `ctx.winner` is now `ctx.gameover`, and contains the return value of `endGameIf`.
- `props.endTurn` is now `props.game.endTurn`.
