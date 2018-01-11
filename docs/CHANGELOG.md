# v0.16.1

#### Bugfixes
- [[23d9726](https://github.com/google/boardgame.io/commit/23d972677c6ff43b77d5c30352dd9959b517a93c)]: Fix bug that was causing `log` to be erased after `flow.processMove`.

#### Features
- [Triggers](https://github.com/google/boardgame.io/commit/774e540b20d7402184a00abdb7c512d7c8e85995)
- [movesPerTurn](https://github.com/google/boardgame.io/commit/73d5b73d00eaba9aaf73a3576dfcfb25fc2b311d)

# v0.16.0

####  Features

- [Phases](http://boardgame.io/#/phases)

#### Breaking Changes

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
