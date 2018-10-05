## v0.25.4

#### Bugfixes

* Fixed babelHelpers error in npm.

## v0.25.3

Broken, do not use (complains about babelHelpers missing).

#### Bugfixes

* [[ebf7e73](https://github.com/nicolodavis/boardgame.io/commit/ebf7e73)] fix bug that was preventing playerID from being overriden by the debug ui

## v0.25.2

#### Bugfixes

* [[a42e07b](https://github.com/nicolodavis/boardgame.io/commit/a42e07b)] npm audit fix --only=prod
* [[cfe7296](https://github.com/nicolodavis/boardgame.io/commit/cfe7296)] update koa and socket.io

## v0.25.1

#### Bugfixes

* [[09b523e](https://github.com/nicolodavis/boardgame.io/commit/09b523e)] require mongo and firebase only if used

## v0.25.0

#### Features

* [[fe8a9d0](https://github.com/nicolodavis/boardgame.io/commit/fe8a9d0)] Added ability to specify server protocol (#247)
* [[43dcaac](https://github.com/nicolodavis/boardgame.io/commit/43dcaac)] write turn / phase stats in ctx.stats
* [[bd8208a](https://github.com/nicolodavis/boardgame.io/commit/bd8208a)] fabricate playerID in singleplayer mode
* [[b4e3e09](https://github.com/nicolodavis/boardgame.io/commit/b4e3e09)] { all: true } option for setActionPlayers
* [[5d3a34d](https://github.com/nicolodavis/boardgame.io/commit/5d3a34d)] { once: true } option for setActionPlayers
* [[75a274c](https://github.com/nicolodavis/boardgame.io/commit/75a274c)] rename changeActionPlayers to setActionPlayers
* [[4ec3a61](https://github.com/nicolodavis/boardgame.io/commit/4ec3a61)] end phase when a turn order runs out
* [[cb6111b](https://github.com/nicolodavis/boardgame.io/commit/cb6111b)] retire the string constant 'any'
* [[36fc47f](https://github.com/nicolodavis/boardgame.io/commit/36fc47f)] basic support for objective-based AI
* [[d1f0a3e](https://github.com/nicolodavis/boardgame.io/commit/d1f0a3e)] improved rendering of turns and phases in the log
* [[0bc31d6](https://github.com/nicolodavis/boardgame.io/commit/0bc31d6)] better MCTS visualization
* [[14a5ad7](https://github.com/nicolodavis/boardgame.io/commit/14a5ad7)] update redux to 4.0.0

#### Bugfixes

* [[84f07c6](https://github.com/nicolodavis/boardgame.io/commit/84f07c6)] Do not fabricate playerID for playerView
* [[c4a11a7](https://github.com/nicolodavis/boardgame.io/commit/c4a11a7)] ignore events from all but currentPlayer
* [[6a8b657](https://github.com/nicolodavis/boardgame.io/commit/6a8b657)] move mongodb and firebase deps to devDependencies
* [[239f8dd](https://github.com/nicolodavis/boardgame.io/commit/239f8dd)] Use parse/stringify from flatted lib to support circular structures (fixes #222) (#240)
* [[edd1df0](https://github.com/nicolodavis/boardgame.io/commit/edd1df0)] Differentiate automatic game events in the log
* [[570f40e](https://github.com/nicolodavis/boardgame.io/commit/570f40e)] don't render AI metadata if visualize is not specified
* [[a8431c7](https://github.com/nicolodavis/boardgame.io/commit/a8431c7)] set default RNG seed once per game, not game type
* [[5090429](https://github.com/nicolodavis/boardgame.io/commit/5090429)] API: check secret _before_ handling the request (#231)
* [[1a24791](https://github.com/nicolodavis/boardgame.io/commit/1a24791)] attach events API early so that it can be used on the first onTurnBegin
* [[acb9d8c](https://github.com/nicolodavis/boardgame.io/commit/acb9d8c)] enable events API in initial onTurnBegin/onPhaseBegin

#### Breaking Changes

* `changeActionPlayers` is now `setActionPlayers`. It also supports more advanced [options](http://boardgame.io/#/events?id=setactionplayers).
* Returning `undefined` from a `TurnOrder` results in the phase ending, not setting `currentPlayer` to `any`.
* Only the `currentPlayer` can call events (`endTurn`, `endPhase` etc.).

## v0.24.0

#### Features

* [[b28ee74](https://github.com/nicolodavis/boardgame.io/commit/b28ee74)] ability to change playerID from Debug UI
* [[fe1230e](https://github.com/nicolodavis/boardgame.io/commit/fe1230e)] Firebase integration (#223)

## v0.23.3

#### Bugfixes

* [[6194986](https://github.com/nicolodavis/boardgame.io/commit/6194986)] remove async/await from client code

## v0.23.2

#### Bugfixes

* [[7a61f09](https://github.com/nicolodavis/boardgame.io/commit/7a61f09)] make Random API present in first onTurnBegin and onPhaseBegin

#### Features

* [[99b9844](https://github.com/nicolodavis/boardgame.io/commit/99b9844)] Python Bots
* [[a7134a5](https://github.com/nicolodavis/boardgame.io/commit/a7134a5)] List available games API

## v0.23.1

#### Bugfixes

* [[f26328c](https://github.com/nicolodavis/boardgame.io/commit/f26328c)] add ai.js to rollup config

# v0.23

#### Features

* [[dda540a](https://github.com/nicolodavis/boardgame.io/commit/dda540a)] AI framework
* [[8e2f8c4](https://github.com/nicolodavis/boardgame.io/commit/8e2f8c4)] lobby API support (#189)

#### Bugfixes

* [[7a80f66](https://github.com/nicolodavis/boardgame.io/commit/7a80f66)] make changeActionPlayers an opt-in event
* [[40cd4b8](https://github.com/nicolodavis/boardgame.io/commit/40cd4b8)] Add config update on phase change Fixes #211 (#212)

## v0.22.1

#### Bugfixes

* [[bb39ca7](https://github.com/nicolodavis/boardgame.io/commit/bb39ca7)] fix bug that was causing isActive to return false
* [[81ed088](https://github.com/nicolodavis/boardgame.io/commit/81ed088)] ensure endTurn is called only once after a move
* [[ca9f6ca](https://github.com/nicolodavis/boardgame.io/commit/ca9f6ca)] disable move if playerID is null

# v0.22.0

#### Features

* [[5362955](https://github.com/nicolodavis/boardgame.io/commit/5362955)] React Native Client (#128)
* [[b329df2](https://github.com/nicolodavis/boardgame.io/commit/b329df2)] Pass through props (#173)

## v0.21.5

#### Bugfixes

* [[55715c9](https://github.com/nicolodavis/boardgame.io/commit/55715c9)] Fix undefined ctx in onPhaseBegin

## v0.21.4

#### Features

* [[387d413](https://github.com/nicolodavis/boardgame.io/commit/387d413)] Debug UI CSS improvements
* [[2105f46](https://github.com/nicolodavis/boardgame.io/commit/2105f46)] call endTurnIf inside endPhase
* [[9b0324c](https://github.com/nicolodavis/boardgame.io/commit/9b0324c)] allow setting the next player via endTurn
* [[f76f97e](https://github.com/nicolodavis/boardgame.io/commit/f76f97e)] correct isMultiplayer

#### Bugfixes

* [[278b369](https://github.com/nicolodavis/boardgame.io/commit/278b369)] Fix bug that was ending phase incorrectly (#176)

## v0.21.3

#### Features

* [[dc31a66](https://github.com/nicolodavis/boardgame.io/commit/dc31a66)] expose allowedMoves in ctx
* [[da4711a](https://github.com/nicolodavis/boardgame.io/commit/da4711a)] make allowedMoves both global and phase-specific
* [[9324c58](https://github.com/nicolodavis/boardgame.io/commit/9324c58)] Allowed moves as function (#164)

#### Bugfixes

* [[5e49448](https://github.com/nicolodavis/boardgame.io/commit/5e49448)] convert multiplayer move whitelist to blacklist

## v0.21.2

#### Bugfixes

* [[27705d5](https://github.com/nicolodavis/boardgame.io/commit/27705d5)] pass Events API correctly inside events.update

## v0.21.1

#### Bugfixes

* [[87e77c1](https://github.com/nicolodavis/boardgame.io/commit/87e77c1)] correctly detach APIs from ctx in startTurn

# v0.21

#### Features

* [[2ee244e](https://github.com/nicolodavis/boardgame.io/commit/2ee244e)] Reset Game (#155)
* [[9cd3fdf](https://github.com/nicolodavis/boardgame.io/commit/9cd3fdf)] allow to modify actionPlayers via Events (#157)
* [[767362f](https://github.com/nicolodavis/boardgame.io/commit/767362f)] endGame event
* [[78634ee](https://github.com/nicolodavis/boardgame.io/commit/78634ee)] Events API
* [[a240e45](https://github.com/nicolodavis/boardgame.io/commit/a240e45)] undoableMoves implementation (#149)
* [[c12e911](https://github.com/nicolodavis/boardgame.io/commit/c12e911)] Process only known moves (#151)
* [[7fcdbfe](https://github.com/nicolodavis/boardgame.io/commit/7fcdbfe)] Custom turn order (#130)
* [[748f36f](https://github.com/nicolodavis/boardgame.io/commit/748f36f)] UI: add mouse hover action props to grid, hex, and token (#153)
* [[f664237](https://github.com/nicolodavis/boardgame.io/commit/f664237)] Add notion of actionPlayers (#145)

## v0.20.2

#### Features

* [[43ba0ff](https://github.com/nicolodavis/boardgame.io/commit/43ba0ff)] allow optional redux enhancer (#139)
* [[dd6c110](https://github.com/nicolodavis/boardgame.io/commit/dd6c110)] Run endPhase event (analogue to endTurn) when game ends (#144)

#### Bugfixes

* [[8969433](https://github.com/nicolodavis/boardgame.io/commit/8969433)] Fix bug that was causing Random code to return the same numbers.

#### Breaking Changes

* The `Random` API is different. There is no longer a `Random` package
  that you need to import. The API is attached to the `ctx` parameter that
  is passed to the moves. Take a look at http://boardgame.io/#/random for
  more details.

## v0.20.1

#### Bugfixes

* [[06d78e2](https://github.com/nicolodavis/boardgame.io/commit/06d78e2)] Enable SSR
* [[ed09f51](https://github.com/nicolodavis/boardgame.io/commit/ed09f51)] Allow calling Random during setup
* [[c50d5ea](https://github.com/nicolodavis/boardgame.io/commit/c50d5ea)] fix log rendering of phases

# v0.20

#### Features

* [[eec8896](https://github.com/nicolodavis/boardgame.io/commit/eec8896)] undo/redo

# v0.19

#### Features

* MongoDB connector
  * [[eaa372f](https://github.com/nicolodavis/boardgame.io/commit/eaa372f)] add Mongo to package
  * [[63c3cdf](https://github.com/nicolodavis/boardgame.io/commit/63c3cdf)] mongo race condition checks
  * [[65cefdf](https://github.com/nicolodavis/boardgame.io/commit/65cefdf)] allow setting Mongo location using MONGO_URI
  * [[557b66c](https://github.com/nicolodavis/boardgame.io/commit/557b66c)] add run() to Server
  * [[2a85b40](https://github.com/nicolodavis/boardgame.io/commit/2a85b40)] replace lru-native with lru-cache
  * [[003fe46](https://github.com/nicolodavis/boardgame.io/commit/003fe46)] MongoDB connector

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

## v0.18.1

#### Bugfixes

[[0c894bd](https://github.com/nicolodavis/boardgame.io/commit/0c894bd)] add react.js to rollup config

# v0.18

#### Features

* [[4b90e84](https://github.com/nicolodavis/boardgame.io/commit/4b90e84)] decouple client from React

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

  * [[ebe7758](https://github.com/nicolodavis/boardgame.io/commit/ebe7758)] allow to throw multiple dice (#120)
  * [[8c88b70](https://github.com/nicolodavis/boardgame.io/commit/8c88b70)] Simplify Random API (#119)
  * [[45599e5](https://github.com/nicolodavis/boardgame.io/commit/45599e5)] Server-side array shuffling. (#116)
  * [[d296b36](https://github.com/nicolodavis/boardgame.io/commit/d296b36)] Random API (#103)

* [[f510b69](https://github.com/nicolodavis/boardgame.io/commit/f510b69)] onTurnBegin (#109)

#### Bugfixes

* [[6a010c8](https://github.com/nicolodavis/boardgame.io/commit/6a010c8)] Debug UI: fixes related to errors in arguments (#123)

## v0.17.2

#### Features

* [[0572210](https://github.com/nicolodavis/boardgame.io/commit/0572210)] Exposing Client connection status to board. (#97)
* [[c2ea197](https://github.com/nicolodavis/boardgame.io/commit/c2ea197)] make db interface async (#86)
* [[9e507ce](https://github.com/nicolodavis/boardgame.io/commit/9e507ce)] exclude dependencies from package

#### Bugfixes

* [[a768f1f](https://github.com/nicolodavis/boardgame.io/commit/a768f1f)] remove entries from clientInfo and roomInfo on disconnect

## v0.17.1

#### Features

* [[f23c5dd](https://github.com/nicolodavis/boardgame.io/commit/f23c5dd)] Card and Deck (#74)
* [[a21c1dd](https://github.com/nicolodavis/boardgame.io/commit/a21c1dd)] prevent endTurn when movesPerTurn have not been made

#### Bugfixes

* [[11e215e](https://github.com/nicolodavis/boardgame.io/commit/11e215e)] fix bug that was using the wrong playerID when calculating playerView

# v0.17.0

#### Features

* [[0758c7e](https://github.com/nicolodavis/boardgame.io/commit/0758c7e)] cascade endPhase
* [[cc7d44f](https://github.com/nicolodavis/boardgame.io/commit/cc7d44f)] retire triggers and introduce onMove instead
* [[17e88ce](https://github.com/nicolodavis/boardgame.io/commit/17e88ce)] convert events whitelist to boolean options
* [[e315b9e](https://github.com/nicolodavis/boardgame.io/commit/e315b9e)] add ui to NPM package
* [[5b34c5d](https://github.com/nicolodavis/boardgame.io/commit/5b34c5d)] remove pass event and make it a standard move
* [[f3da742](https://github.com/nicolodavis/boardgame.io/commit/f3da742)] make playerID available in ctx
* [[cb09d9a](https://github.com/nicolodavis/boardgame.io/commit/cb09d9a)] make turnOrder a globally configurable option

## v0.16.8

#### Features

* [[a482469](https://github.com/nicolodavis/boardgame.io/commit/a482469b2f6a317a50fb25f23b7ffc0c2f597c1e)] ability to specify socket server

#### Bugfixes

* [[2ab3dfc](https://github.com/nicolodavis/boardgame.io/commit/2ab3dfc6928eb8f0bfdf1ce319ac53021a2f905b)] end turn automatically when game ends

## v0.16.7

#### Bugfixes

* [[c65580d](https://github.com/nicolodavis/boardgame.io/commit/c65580d)] Fix bug introduced in af3a7b5.

## v0.16.6

#### Bugfixes

* [[af3a7b5](https://github.com/nicolodavis/boardgame.io/commit/af3a7b5)] Only process move reducers (on the client) and nothing else when in multiplayer mode.

Buggy fix (fixed in 0.16.7).

#### Features

* [[2721ad4](https://github.com/nicolodavis/boardgame.io/commit/2721ad4)] Allow overriding `db` implementation in Server.

## v0.16.5

#### Features

* `PlayerView.STRIP_SECRETS`

## v0.16.4

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

## v0.16.3

#### Features

* Multiple game types per server!

#### Breaking Changes

* `Server` now accepts an array `games`, and no longer takes `game` and `numPlayers`.

```
const app = Server({
  games: [ TicTacToe, Chess ]
};
```

## v0.16.2

#### Bugfixes

* [[a61ceca](https://github.com/nicolodavis/boardgame.io/commit/a61ceca8cc8e973d786678e1bcc7ec50739ebeaa)]: Log turn ends correctly (even when triggered automatically by `endTurnIf`)

#### Features

* [[9ce42b2](https://github.com/nicolodavis/boardgame.io/commit/9ce42b297372160f3ece4203b4c92000334d85e0)]: Change color in `GameLog` based on the player that made the move.

## v0.16.1

#### Bugfixes

* [[23d9726](https://github.com/nicolodavis/boardgame.io/commit/23d972677c6ff43b77d5c30352dd9959b517a93c)]: Fix bug that was causing `log` to be erased after `flow.processMove`.

#### Features

* [Triggers](https://github.com/nicolodavis/boardgame.io/commit/774e540b20d7402184a00abdb7c512d7c8e85995)
* [movesPerTurn](https://github.com/nicolodavis/boardgame.io/commit/73d5b73d00eaba9aaf73a3576dfcfb25fc2b311d)

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
