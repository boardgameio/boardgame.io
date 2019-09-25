# Stages

A stage is similar to a phase, except that it happens within a turn.
A turn can be subdivided into many stages, each allowing a different
set of moves during that stage.

Stages are also useful to allow more than one player to play during a turn.
By default, only the `currentPlayer` is allowed to make moves during a turn.
However, some game situations call for moves by other players. For example,
the `currentPlayer` might play a card that requires every other player in
the game to discard a card. These discards don't have to happen in any
particular order, and they're not really separate turns (the `currentPlayer`
can still play other cards before the turn finally ends). Stages are useful
in such situations.

Whenever one or more players enters a stage during a turn, then the framework
only allows moves from those players (rather than `currentPlayer`). The
players don't have to all be in the same stage either (each player can be
in their own stage). Each player that is in a stage is now considered an
"active" player that can make moves as allowed by the stage that they are in.

### Defining Stages

Stages are defined inside a `turn` section:

```js
const game = {
  moves: { ... },

  turn: {
    stages: {
      discard: {
        moves: { DiscardCard },
      },
    },
  },
};

```

The example above defines a single `discard` stage that players enter when they are
required to discard a card. The stage defines its own `moves` section which specifies
what moves a player in that stage can make. This `moves` section completely overrides
the global `moves` section for players in that stage (players are not allowed to make
any moves from the global `moves` section while they are in that stage). However, if
a stage does not contain a `moves` section, then players can make moves from the global `moves`.

!> A move defined in a stage can have the same name as a global move, but it isn't related to the global equivalent in any way.

### Entering Stages

A stage can be entered by calling the `setStage` event.
This takes the player that called the event into the specified stage:

```js
setStage('discard');
```

### Exiting Stages

Exiting a stage is performed by calling the `endStage` event.
This removes the player from the stage that they are currently
in and returns them to a state where they aren't in any stage.

```js
endStage();
```

It is possible to automatically take a player to another stage
when `endStage` is called. This is done by specifying a `next`
option in the stage config.

```js
stages: {
  A: { next: 'B' },
  B: { next: 'C' },
  C: { next: 'A' },
}
```

In the example above, `endStage` will cycle between the three
stages.

### Advanced

Sometimes you need to move a group of players into a stage
(as opposed to just the player that called the event). For
example, if we need "everyone else" to discard a card in
response to a move that we made, we have to move multiple
players into a stage. We use the `setActivePlayers` event
for this:

```js
setActivePlayers({
  // Move the currentPlayer to a stage.
  currentPlayer: 'stage-name',

  // Move every other player to a stage.
  others: 'stage-name'

  // Move all players to a stage.
  all: 'stage-name'

  // Calls endStage automatically after the player
  // has made the specified number of moves.
  moveLimit: 5,

  // This takes the stage configuration to the
  // value prior to this setActivePlayers call
  // once the set of active players becomes empty
  // (due to players either calling endStage or
  // a moveLimit ending the stage for them).
  revert: true,

  // A next option will be used once the set of active players
  // becomes empty (either by using moveLimit or manually removing
  // players).
  // All options available inside setActivePlayers are available
  // inside next.
  next: { ... },
});
```

!> The player that just made a move is available at
`ctx.playerID` in case you need to differentiate between
multiple players that could simultaneously move.

Sometimes you want to add a player to the set of active players
but don't want them to be in a specific stage. You can use `Stage.NULL`
for this:

```js
import { Stage } from 'boardgame.io/core';

// This allows any player to make a move, but doesn't restrict them to
// a particular stage.
setActivePlayers({ all: Stage.NULL });
```

You can have `setActivePlayers` automatically called
at the beginning of the turn by adding an `activePlayers` section
to the `turn` config:

```js
turn: {
  activePlayers: { all: Stage.NULL },
}
```

### Presets

A number of `activePlayers` configurations are available as presets that you
can use directly:

```js
import { ActivePlayers } from 'boardgame.io/core';

turn: {
  activePlayers: ActivePlayers.ALL;
}
```

##### ALL

Equivalent to `{ all: Stage.NULL }`. Any player can play, and they
aren't restricted to any particular stage.

##### ALL_ONCE

Equivalent to `{ all: Stage.NULL, moveLimit: 1 }`. Any player can make
exactly one move before they are removed from the set of active players.

##### OTHERS

Similar to `ALL`, but excludes the current player from the set
of active players.

##### OTHERS_ONCE

Similar to `ALL_ONCE`, but excludes the current player from the set
of active players.

```react
<iframe class='plain' src='react/stages' height='1050' scrolling='no' title='example' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'></iframe>
```
