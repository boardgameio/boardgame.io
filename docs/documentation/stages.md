# Stages

Stages are a way to break a turn into smaller parts. They are useful
when you want to restrict the set of moves that a player can make.
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

You can check `playerID` inside a move to figure out
which player made it. This may be necessary in situations
where multiple players are active (and could simultaneously make a move).

```js
const move = ({ G, ctx, playerID }) => {
  console.log(`move made by player ${playerID}`);
};
```

### Defining Stages

Stages are defined inside a `turn` section:

```js
const game = {
  moves: { ... },

  turn: {
    stages: {
      discard: {
        moves: { discardCard },
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
(as opposed to just the player that called the event).
We use the `setActivePlayers` event for this:

```js
setActivePlayers({
  // Move the current player to a stage.
  currentPlayer: 'stage-name',

  // Move every other player to a stage.
  others: 'stage-name',

  // Move all players to a stage.
  all: 'stage-name',

  // Enumerate the set of players and the stages that they
  // are in.
  value: {
    '0': 'stage-name',
    '1': 'stage-name',
    ...
  },

  // Prevents manual endStage before the player
  // has made the specified number of moves.
  minMoves: 1,

  // Calls endStage automatically after the player
  // has made the specified number of moves.
  maxMoves: 5,

  // This takes the stage configuration to the
  // value prior to this setActivePlayers call
  // once the set of active players becomes empty
  // (due to players either calling endStage or
  // maxMoves ending the stage for them).
  revert: true,

  // A next option will be used once the set of active players
  // becomes empty (either by using maxMoves or manually removing
  // players).
  // All options available inside setActivePlayers are available
  // inside next.
  next: { ... },
});
```

Let's go back to the example we discussed earlier where we
require every other player to discard a card when we play one:

```js
function playCard({ events }) {
  events.setActivePlayers({ others: 'discard', minMoves: 1, maxMoves: 1 });
}

const game = {
  moves: { playCard },
  turn: {
    stages: {
      discard: {
        moves: { discard },
      },
    },
  },
};
```

```react
<iframe class='plain' src='snippets/stages-1' height='160' scrolling='no' title='example' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'></iframe>
```

#### Advanced Move Limits

Passing a `minMoves` argument to `setActivePlayers` forces all the
active players to make at least that number of moves before being able to
end the stage, but sometimes you might want to set different move limits 
for different players. For cases like this, `setStage` and `setActivePlayers` 
support long-form arguments:

```js
setStage({ stage: 'stage-name', minMoves: 3 });
```

```js
setActivePlayers({
  currentPlayer: { stage: 'stage-name', minMoves: 2 },
  others: { stage: 'stage-name', minMoves: 1 },
  value: {
    '0': { stage: 'stage-name', minMoves: 4 },
  },
});
```

Passing a `maxMoves` argument to `setActivePlayers` limits all the
active players to making that number of moves, but sometimes you might want
to set different move limits for different players. For cases like this,
`setStage` and `setActivePlayers` support long-form arguments:

```js
setStage({ stage: 'stage-name', maxMoves: 3 });
```

```js
setActivePlayers({
  currentPlayer: { stage: 'stage-name', maxMoves: 2 },
  others: { stage: 'stage-name', maxMoves: 1 },
  value: {
    '0': { stage: 'stage-name', maxMoves: 4 },
  },
});
```

### Stage.NULL

Sometimes you want to add a player to the set of active players
but don't want them to be in a specific stage. You can use `Stage.NULL`
for this:

```js
import { Stage } from 'boardgame.io/core';

// This allows any player to make a move, but doesn't restrict them to
// a particular stage.
setActivePlayers({ all: Stage.NULL });
```

There is also a convenient syntax to enumerate the players
that you want in the set of active players:

```js
// Players 0 and 3 are added to the set of active players,
// and neither is placed in a stage.
setActivePlayers(['0', '3']);
```

### Configuring active players at the beginning of a turn.

You can have `setActivePlayers` called automatically
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

#### ALL

Equivalent to `{ all: Stage.NULL }`. Any player can play, and they
aren't restricted to any particular stage.

#### ALL_ONCE

Equivalent to `{ all: Stage.NULL, minMoves: 1, maxMoves: 1 }`. Any player can make
exactly one move before they are removed from the set of active players.

#### OTHERS

Similar to `ALL`, but excludes the current player from the set
of active players.

#### OTHERS_ONCE

Similar to `ALL_ONCE`, but excludes the current player from the set
of active players.
