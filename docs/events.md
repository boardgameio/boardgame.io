# Events

The framework provides a number of events to help move along your games progess.

Some come by default, and can be turned off if you dont want them.  
Others need to be explicity turned on in order to be available.

When provided by the framework, you can call them during gameplay,
or inside of the config object you pass to `Game`.

Although in both cases, how you access them is slightly different.

### Provided Events

* `endTurn()` - Provided by default.

  * To disable add `endTurn: false` to a custom flow config.

* `endPhase(nextPhase)` - Provided by default when using phases.

  * To disable add `endPhase: false` to a custom flow config.
  * (arguments) `nextPhase` - optional phase to transition to, if not provided defaults to next phase defined in config

* `endGame(arg)` - This is only provided when setting `endGame: true` in a custom flow config.

  * (arguments) `arg` - This optional argument when provided will be available as ctx.gameOver. (same as the return value from `endGameIf`)

* `undo()` - Provided by default or if given a list of `undoableMoves` in flow config of game, event will be only be usable in a move listed in `undoableMoves`.
  * To disable completley, pass an empty Array as `undoableMoves`. See [undo/redo](undo.md) docs for more info.
* `redo()` - Provided by default or if given a list of `undoableMoves` in flow config of game, event will be only be usable in a move listed in `undoableMoves`.
  * To disable completley, pass an empty Array as `undoableMoves`. See [undo/redo](undo.md) docs for more info.
* `changeActionPlayers(actionPlayers)` - Provided by default when more than one player available to change players who can currently make a move.
  * (arguments) `actionPlayers` - Array of players that are currently allowed to make moves.

### Triggering events during gameplay

To trigger game events from inside of your game,  
your Board component is passed an object of event  
functions as a prop called events.

To use them you just need to call the event function you want to trigger:

```js
import React, { Component } from 'react';

export default class Board extends Component {
  onPressEndTurnButton = () => {
    this.props.events.endTurn();
  };
  render = () => (
    <div>
      <button onClick={this.onPressEndTurnButton}>End Turn</button>
    </div>
  );
}
```

### Triggering events inside of Game config

If you need to trigger an event from inside of the Game config object, you can do it using ctx:

```js
const game = Game({
  onMove: (G, ctx, action) => {
    ctx.events.endPhase();
  },
});
```
