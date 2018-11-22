# Events

An event is used to advance the game state. It is somewhat
analogous to a move, except that while a move changes
`G`, an event changes `ctx`. Also, events are provided by the
framework (as opposed to moves, which are written by you).

Some events are enabled by default, and can be turned off if you dont want them. Others need to be explicitly turned on in order to use them. Also note that only the current player can call events (and must also be an action player to do so).

##### endTurn

This event just ends the current player's turn.
The default behavior is to increment `ctx.turn` by `1`
and advance `currentPlayer` to the next player according
to the configured turn order (the default being a round-robin).

`endTurn` also accepts an argument, which (if provided)
switches the turn to the specified player.

##### endPhase

This event just ends the current phase, and sets `ctx.phase`
to the next phase in round-robin fashion. Note that this
is orthogonal to a player turn (i.e. you can end the phase
many times within a single turn, or you can have many
turns within a single phase).

`endPhase` also accepts an argument, which (if provided)
switches the phase to the phase specified.

##### endGame

This event ends the game. If you pass an argument to it,
then that argument is made available in `ctx.gameover`.
After the game is over, further state changes to the game
(via a move or event) are not possible.

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

### Enabling / Disabling events

An important point to note is that not all events are
enabled on the client, and some need to be explicitly
enabled.

The following table describes the defaults:

|  Event   | Default |
| :------: | :-----: |
| endTurn  |  true   |
| endPhase |  true   |
| endGame  |  false  |

In order to enable an event, just add `eventName: true` to
your `flow` section.

```js
flow: {
  endGame: true,
  ...
}
```

In order to disable an event, add `eventName: false`.

```js
flow: {
  endPhase: false,
  ...
}
```

!> This doesn't apply to events in game logic, but just the
ability to call an event directly from a client.
