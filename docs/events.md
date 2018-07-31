# Events

An event is used to advance the game state. It is somewhat
analogous to a move, except that while a move changes
`G`, an event changes `ctx`. Also, events are provided by the
framework (as opposed to moves, which are written by you).

Some events are enabled by default, and can be turned off if you dont want them. Others need to be explicity turned on in order to use them.

##### endTurn

This event just ends the current player's turn.
The default behavior is to increment `ctx.turn` by `1`
and advance `currentPlayer` to the next player according
to the configured turn order (the default being a round-robin).

This event is enabled by default. To disable this event,
pass `endTurn: false` inside your `flow` section. Note that
turns can still end if you use `endTurnIf` or `movesPerTurn`.
Disabling the event merely prevents you from explicitly
triggering it.

`endTurn` also accepts an argument, which (if provided)
switches the turn to the specified player.

##### endPhase

This event just ends the current phase, and sets `ctx.phase`
to the next phase in round-robin fashion. Note that this
is orthogonal to a player turn (i.e. you can end the phase
many times within a single turn, or you can have many
turns within a single phase).

To disable this event, pass `endPhase: false` inside your
`flow` section. Note that phases can still end if you use
`endPhaseIf`.

`endPhase` also accepts an argument, which (if provided)
switches the phase to the phase specified.

##### endGame

This event ends the game. If you pass an argument to it,
then that argument is made available in `ctx.gameover`.
After the game is over, further state changes to the game
(via a move or event) are not possible.

##### setActionPlayers

This changes `ctx.actionPlayers` to the provided argument.
See the guide on [Turn Orders](turn-order.md) for more
details about `actionPlayers`.

You may use an alternative form for the argument to set
more advanced options:

```
const opts = {
  // The array of playerID's.
  value: [...],

  // Each playerID can play once (after which
  // their entry is removed from actionPlayers)
  once: true,

  // Use this instead of value if you want to set
  // actionPlayers to all the players in the game.
  all: true,
};

setActionPlayers(opts);
```

!> This event is not enabled by default and must be enabled
by setting `setActionPlayers: true` in the `flow` section
of your game.

### Triggering an event from a React client.

Events are available through `props` inside the
`events` object. For example:

```js
import React from 'react';
import PropTypes from 'prop-types';

class Board extends React.Component {
  static propTypes = {
    events: PropTypes.any.isRequired,
  };

  onClick = () => {
    this.props.events.endTurn();
  };

  render = () => <button onClick={this.onClick}>End Turn</button>;
}
```

### Triggering an event from inside game logic.

You can also trigger events from within a move or any
code inside the `flow` section. This is done through
the `ctx.events` object:

```js
moves: {
  drawCard: (G, ctx) => {
    ctx.events.endPhase();
  };
}
```
