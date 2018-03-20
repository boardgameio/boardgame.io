# Events

The framework provides a number of events to help move along your games progess

Some come by default, and can be turned off if you dont want them, others need to
be explicity turned on to be available

when provided, you can call them during gameplay,
or inside of the config object you pass to `Game`

but in both cases how you access them is slightly different

### Provided Events

* endTurn(G, ctx) - provided by default, to disable add `endTurn: false` to a custom flow config
* endPhase(G, ctx) - provided by default when using phases, to disable add `endPhase: false` to a custom flow config
* endGame(G, ctx) - only provided when `endGame: true` in a custom flow config
* undo(G, ctx) - provided when given a list of `undoableMoves` in flow config of game
* redo(G, ctx) - provided when given a list of `undoableMoves` in flow config of game
* changeActionPlayers(G, ctx) - provided by default when more than one player available to change players who can currently make a move

### triggering events during gameplay

to trigger game events from inside of your game, your Board component is passed an object of event functions as a prop called events

to use just call the event you want to trigger

```
this.props.events.endTurn()
```

### triggering events inside of Game config

if you need to trigger an event from inside of the Game config object, you can do it using ctx,

```
...
    onMove: (G, ctx, action)=>{
	ctx.events.endPhase()
    }
...
```
