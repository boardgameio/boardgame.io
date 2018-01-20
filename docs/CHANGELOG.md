# v0.16.7

#### Bugfixes

* [c65580d] Fix bug introduced in af3a7b5.

# v0.16.6

#### Bugfixes

* [af3a7b5] Only process move reducers (on the client) and nothing else when in multiplayer mode.

Buggy fix (fixed in 0.16.7).

#### Features

* [2721ad4] Allow overriding `db` implementation in Server.

# v0.16.5

#### Features

* `PlayerView.STRIP_SECRETS`

# v0.16.4

#### Bugfixes

* `endPhaseIf` is called after each move (in addition to at the end of a turn).
* `gameID` is namespaced on the server so that there are no clashes across game types.

#### Breaking Changes

* `props.game` is now `props.events` (to avoid confusing it with the `game` object).

```
// OLD
onClick() {
  this.props.game.endTurn();
}

// NEW
onClick() {
  this.props.events.endTurn();
}
```

# v0.16.3

#### Features

* Multiple game types per server!

#### Breaking Changes

* `Server` now accepts an array `games`, and no longer takes `game` and `numPlayers`.

```
const app = Server({
  games: [ TicTacToe, Chess ]
};
```

# v0.16.2

#### Bugfixes

* [[a61ceca](https://github.com/google/boardgame.io/commit/a61ceca8cc8e973d786678e1bcc7ec50739ebeaa)]: Log turn ends correctly (even when triggered automatically by `endTurnIf`)

#### Features

* [[9ce42b2](https://github.com/google/boardgame.io/commit/9ce42b297372160f3ece4203b4c92000334d85e0)]: Change color in `GameLog` based on the player that made the move.

# v0.16.1

#### Bugfixes

* [[23d9726](https://github.com/google/boardgame.io/commit/23d972677c6ff43b77d5c30352dd9959b517a93c)]: Fix bug that was causing `log` to be erased after `flow.processMove`.

#### Features

* [Triggers](https://github.com/google/boardgame.io/commit/774e540b20d7402184a00abdb7c512d7c8e85995)
* [movesPerTurn](https://github.com/google/boardgame.io/commit/73d5b73d00eaba9aaf73a3576dfcfb25fc2b311d)

# v0.16.0

#### Features

* [Phases](http://boardgame.io/#/phases)

#### Breaking Changes

* `boardgame.io/game` is now `boardgame.io/core`, and does not have a default export.
* `boardgame.io/client` no longer has a default export.

```
// v0.16
import { Game } from 'boardgame.io/core'
import { Client } from 'boardgame.io/client'
```

```
// v0.15
import Game from 'boardgame.io/game'
import Client from 'boardgame.io/client'
```

* `victory` is now `endGameIf`, and goes inside a `flow` section.
* The semantics of `endGameIf` are subtly different. The game ends if
  the function returns anything at all.
* `ctx.winner` is now `ctx.gameover`, and contains the return value of `endGameIf`.
* `props.endTurn` is now `props.game.endTurn`.
