# Events

An event is used to advance the game state. It is somewhat
analogous to a move, except that while a move changes
`G`, an event changes `ctx`. Also, events are provided by the
framework (as opposed to moves, which are written by you).

### Event Types

#### endStage

This event takes the player that called it out of the stage
that they are in. If the definition for the current stage
in the game object specifies a `next` option, then the player
is taken to the next stage. If not, the player is
returned to a state where they are not in any stage.

```js
endStage();
```

#### endTurn

This event ends the turn.
The default behavior is to increment `ctx.turn` by `1`
and advance `currentPlayer` to the next player according
to the configured [turn order](turn-order.md) (the default being a round-robin).

This event also accepts an argument, which (if provided)
switches the turn to the specified player instead.

```js
endTurn(); // without argument
endTurn({ next: '2' }); // Player 2 is the next player.
```

#### endPhase

This event ends the current phase. If the definition for the
current phase in the game object specifies a
`next` option, then the game moves to that phase. If not, the
game returns to a state where no phase is active.

```js
endPhase();
```

#### endGame

This event ends the game. If you pass an argument to it,
then that argument is made available in `ctx.gameover`.
After the game is over, further state changes to the game
(via a move or event) are not possible.
In order to enable the included Bot/AI logic, you must specify the winner in the `endGame` event.

```js
endGame({ winner: '2' });
```

#### setStage

Takes the player that called the event into the stage specified.

```js
setStage('stage-name');
```

#### setPhase

Takes the game into the phase specified. Ends the active phase first.

```js
setPhase('phase-name');
```

#### setActivePlayers

Allows adding additional players to the set of "active players", and
also any stages that you want to put them in. See the guide on [Stages](stages.md)
for more details.

### Triggering an event from game logic.

You can trigger events from a move or code inside
your game logic (a phase’s `onBegin` hook, for example).
This is done through the `events` API in the object passed
as the first argument to moves:

```js
moves: {
  drawCard: ({ G, ctx, events }) => {
    events.endPhase();
  };
}
```

!> Events are queued up and triggered **after** a move.
Any changes you make to `G` will be applied before events are
triggered, even if the event is called first in your move function.

### Triggering an event from the client

<!-- tabs:start -->

#### **Plain JS**

Events are available inside the `events` property of
a boardgame.io client instance. For example:

```js
import { Client } from 'boardgame.io/client';

const client = Client({ /* options */ });

const clickHandler = () => {
  client.events.endTurn();
}
```

#### **React**

Events are available through `props` inside the
`events` object. For example:

```js
import React from 'react';

function Board({ events }) {
  const onClick = () => {
    events.endTurn();
  };

  return <button onClick={onClick}>End Turn</button>;
}
```
<!-- tabs:end -->

### Disabling events

Events can be disabled. For example, you might not want a
player to be able to end the game directly by simply calling
the `endGame` event.

In order to disable an event, just add `eventName: false` to
the `events` section in your game config.

```js
const game = {
  events: {
    endGame: false,
    // ...
  },
};
```

!> This doesn't apply to events in moves or hooks, but just the
ability to call an event directly from a client.

### Calling events from hooks

The events API is available in game hooks like it is inside moves. However,
because of how hooks and events interact, certain events cannot be called from
certain hooks. The following table shows which hooks support which events.

|                    | turn<br>`onMove` | turn<br>`onBegin` | turn<br>`onEnd` | phase<br>`onBegin` | phase<br>`onEnd` | game<br>`onEnd` |
|-------------------:|:----------------:|:-----------------:|:---------------:|:------------------:|:----------------:|:---------------:|
|         `setStage` |         ✅        |         ❌         |        ❌        |          ❌         |         ❌        |        ❌        |
|         `endStage` |         ✅        |         ❌         |        ❌        |          ❌         |         ❌        |        ❌        |
| `setActivePlayers` |         ✅        |         ✅         |        ❌        |          ❌         |         ❌        |        ❌        |
|          `endTurn` |         ✅        |         ✅         |        ❌        |          ✅         |         ❌        |        ❌        |
|         `setPhase` |         ✅        |         ✅         |        ✅        |          ✅         |         ❌        |        ❌        |
|         `endPhase` |         ✅        |         ✅         |        ✅        |          ✅         |         ❌        |        ❌        |
|          `endGame` |         ✅        |         ✅         |        ✅        |          ✅         |         ✅        |        ❌        |

✅ = supported &nbsp;&nbsp;&nbsp; ❌ = not supported
