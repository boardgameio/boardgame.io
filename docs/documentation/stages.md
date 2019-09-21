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
only allows moves from those players (rather than `currentPlayer`). Those
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
endStage(); // takes no arguments
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

### Other Players

The events above move the player that called them between stages.
Sometimes you want other players to enter stages.

**TODO**: talk about activePlayers here

### Default `activePlayers` configurations

**boardgame.io** provides some default configurations
for `activePlayers` for common patterns.

```js
import { ActivePlayers } from 'boardgame.io/core';
```

You can then use these in your turn configuration:

```js
turn: {
  activePlayers: ActivePlayers.ALL;
}
```

##### `ALL`

`activePlayers` is set to include all players while the turn stays
fixed with one player. This allows every player in the game
to make a move (in any order) during the current player’s turn.

##### `ALL_ONCE`

Similar to `ALL`, but allows each player to make exactly
one move. Once all players have made their move, the turn will
return to the current player.

##### `OTHERS`

Similar to `ALL`, but excludes the current player from the set
of action players.

##### `OTHERS_ONCE`

Similar to `OTHERS`, but allows each player to make exactly one
move. When all (other) players have made their move, the current
player can move again. This is typically used in a phase where you
would like to elicit a response from every other player in the
game. For example, you might have a card which (when played)
requires every other player in the game to discard a card.

### Showcase

```react
<iframe class='react' src='react/turn-order/turn-order.html' height='1050' scrolling='no' title='example' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'></iframe>
```
