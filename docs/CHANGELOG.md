# v0.20.2

#### Features

* [[43ba0ff](https://github.com/google/boardgame.io/commit/43ba0ff)] allow optional redux enhancer (#139)
* [[dd6c110](https://github.com/google/boardgame.io/commit/dd6c110)] Run endPhase event (analogue to endTurn) when game ends (#144)

#### Bugfixes

* [[8969433](https://github.com/google/boardgame.io/commit/8969433)] Fix bug that was causing Random code to return the same numbers.

#### Breaking Changes

* The `Random` API is different. There is no longer a `Random` package
  that you need to import. The API is attached to the `ctx` parameter that
  is passed to the moves. Take a look at http://boardgame.io/#/random for
  more details.

# v0.20.1

#### Bugfixes

* [[06d78e2](https://github.com/google/boardgame.io/commit/06d78e2)] Enable SSR
* [[ed09f51](https://github.com/google/boardgame.io/commit/ed09f51)] Allow calling Random during setup
* [[c50d5ea](https://github.com/google/boardgame.io/commit/c50d5ea)] fix log rendering of phases

# v0.20

#### Features

* [[eec8896](https://github.com/google/boardgame.io/commit/eec8896)] undo/redo

# v0.19

#### Features

* MongoDB connector
  * [[eaa372f](https://github.com/google/boardgame.io/commit/eaa372f)] add Mongo to package
  * [[63c3cdf](https://github.com/google/boardgame.io/commit/63c3cdf)] mongo race condition checks
  * [[65cefdf](https://github.com/google/boardgame.io/commit/65cefdf)] allow setting Mongo location using MONGO_URI
  * [[557b66c](https://github.com/google/boardgame.io/commit/557b66c)] add run() to Server
  * [[2a85b40](https://github.com/google/boardgame.io/commit/2a85b40)] replace lru-native with lru-cache
  * [[003fe46](https://github.com/google/boardgame.io/commit/003fe46)] MongoDB connector

#### Breaking Changes

* `boardgame.io/server` no longer has a default export, but returns
  `Server` and `Mongo`.

```
// v0.19
const Server = require('boardgame.io/server').Server;
```

```
// v0.18
const Server = require('boardgame.io/server');
```

# v0.18.1

#### Bugfixes

[[0c894bd](https://github.com/google/boardgame.io/commit/0c894bd)] add react.js to rollup config

# v0.18

#### Features

* [[4b90e84](https://github.com/google/boardgame.io/commit/4b90e84)] decouple client from React

This adds a new package `boardgame.io/react`. Migrate all your
calls from:

```
import { Client } from 'boardgame.io/client'
```

to:

```
import { Client } from 'boardgame.io/react'
```

`boardgame.io/client` exposes a raw JS client that isn't tied
to any particular UI framework.

* Random API:

  * [[ebe7758](https://github.com/google/boardgame.io/commit/ebe7758)] allow to throw multiple dice (#120)
  * [[8c88b70](https://github.com/google/boardgame.io/commit/8c88b70)] Simplify Random API (#119)
  * [[45599e5](https://github.com/google/boardgame.io/commit/45599e5)] Server-side array shuffling. (#116)
  * [[d296b36](https://github.com/google/boardgame.io/commit/d296b36)] Random API (#103)

* [[f510b69](https://github.com/google/boardgame.io/commit/f510b69)] onTurnBegin (#109)

#### Bugfixes

* [[6a010c8](https://github.com/google/boardgame.io/commit/6a010c8)] Debug UI: fixes related to errors in arguments (#123)

# v0.17.2

#### Features

* [[0572210](https://github.com/google/boardgame.io/commit/0572210)] Exposing Client connection status to board. (#97)
* [[c2ea197](https://github.com/google/boardgame.io/commit/c2ea197)] make db interface async (#86)
* [[9e507ce](https://github.com/google/boardgame.io/commit/9e507ce)] exclude dependencies from package

#### Bugfixes

* [[a768f1f](https://github.com/google/boardgame.io/commit/a768f1f)] remove entries from clientInfo and roomInfo on disconnect

# v0.17.1

#### Features

* [[f23c5dd](https://github.com/google/boardgame.io/commit/f23c5dd)] Card and Deck (#74)
* [[a21c1dd](https://github.com/google/boardgame.io/commit/a21c1dd)] prevent endTurn when movesPerTurn have not been made

#### Bugfixes

* [[11e215e](https://github.com/google/boardgame.io/commit/11e215e)] fix bug that was using the wrong playerID when calculating playerView

# v0.17.0

#### Features

* [[0758c7e](https://github.com/google/boardgame.io/commit/0758c7e)] cascade endPhase
* [[cc7d44f](https://github.com/google/boardgame.io/commit/cc7d44f)] retire triggers and introduce onMove instead
* [[17e88ce](https://github.com/google/boardgame.io/commit/17e88ce)] convert events whitelist to boolean options
* [[e315b9e](https://github.com/google/boardgame.io/commit/e315b9e)] add ui to NPM package
* [[5b34c5d](https://github.com/google/boardgame.io/commit/5b34c5d)] remove pass event and make it a standard move
* [[f3da742](https://github.com/google/boardgame.io/commit/f3da742)] make playerID available in ctx
* [[cb09d9a](https://github.com/google/boardgame.io/commit/cb09d9a)] make turnOrder a globally configurable option

# v0.16.8

#### Features

* [[a482469](https://github.com/google/boardgame.io/commit/a482469b2f6a317a50fb25f23b7ffc0c2f597c1e)] ability to specify socket server

#### Bugfixes

* [[2ab3dfc](https://github.com/google/boardgame.io/commit/2ab3dfc6928eb8f0bfdf1ce319ac53021a2f905b)] end turn automatically when game ends

# v0.16.7

#### Bugfixes

* [[c65580d](https://github.com/google/boardgame.io/commit/c65580d)] Fix bug introduced in af3a7b5.

# v0.16.6

#### Bugfixes

* [[af3a7b5](https://github.com/google/boardgame.io/commit/af3a7b5)] Only process move reducers (on the client) and nothing else when in multiplayer mode.

Buggy fix (fixed in 0.16.7).

#### Features

* [[2721ad4](https://github.com/google/boardgame.io/commit/2721ad4)] Allow overriding `db` implementation in Server.

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
