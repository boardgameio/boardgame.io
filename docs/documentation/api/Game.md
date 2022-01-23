# Game

?> Using TypeScript? Check out [the TypeScript docs](typescript.md) on how to type your game object.

```js
{
  // The name of the game.
  name: 'tic-tac-toe',

  // Function that returns the initial value of G.
  // setupData is an optional custom object that is
  // passed through the Game Creation API.
  setup: ({ ctx, ...plugins }, setupData) => G,

  // Optional function to validate the setupData before
  // matches are created. If this returns a value,
  // an error will be reported to the user and match
  // creation is aborted.
  validateSetupData: (setupData, numPlayers) => 'setupData is not valid!',

  moves: {
    // short-form move.
    A: ({ G, ctx, playerID, events, random, ...plugins }, ...args) => {},

    // long-form move.
    B: {
      // The move function.
      move: ({ G, ctx, playerID, events, random, ...plugins }, ...args) => {},
      // Prevents undoing the move.
      // Can also be a function: (G, ctx) => true/false
      undoable: false,
      // Prevents the move arguments from showing up in the log.
      redact: true,
      // Prevents the move from running on the client.
      client: false,
      // Prevents the move counting towards a player’s number of moves.
      noLimit: true,
      // Processes the move even if it was dispatched from an out-of-date client.
      // This can be risky; check the validity of the state update in your move.
      ignoreStaleStateID: true,
    },
  },

  // Everything below is OPTIONAL.

  // Function that allows you to tailor the game state to a specific player.
  playerView: ({ G, ctx, playerID }) => G,

  // The seed used by the pseudo-random number generator.
  seed: 'random-string',

  turn: {
    // The turn order.
    order: TurnOrder.DEFAULT,

    // Called at the beginning of a turn.
    onBegin: ({ G, ctx, events, random, ...plugins }) => G,

    // Called at the end of a turn.
    onEnd: ({ G, ctx, events, random, ...plugins }) => G,

    // Ends the turn if this returns true.
    // Returning { next }, sets next playerID.
    endIf: ({ G, ctx, random, ...plugins }) => (
      true | { next: '0' }
    ),

    // Called after each move.
    onMove: ({ G, ctx, events, random, ...plugins }) => G,

    // Prevents ending the turn before a minimum number of moves.
    minMoves: 1,

    // Ends the turn automatically after a number of moves.
    maxMoves: 1,

    // Calls setActivePlayers with this as argument at the
    // beginning of the turn.
    activePlayers: { ... },

    stages: {
      A: {
        // Players in this stage are restricted to moves defined here.
        moves: { ... },

        // Players in this stage will be moved to the stage specified
        // here when the endStage event is called.
        next: 'B'
      },

      ...
    },
  },

  phases: {
    A: {
      // Called at the beginning of a phase.
      onBegin: ({ G, ctx, events, random, ...plugins }) => G,

      // Called at the end of a phase.
      onEnd: ({ G, ctx, events, random, ...plugins }) => G,

      // Ends the phase if this returns true.
      endIf: ({ G, ctx, random, ...plugins }) => true,

      // Overrides `moves` for the duration of this phase.
      moves: { ... },

      // Overrides `turn` for the duration of this phase.
      turn: { ... },

      // Make this phase the first phase of the game.
      start: true,

      // Set the phase to enter when this phase ends.
      // Can also be a function: ({ G, ctx }) => 'nextPhaseName'
      next: 'nextPhaseName',
    },

    ...
  },

  // The minimum and maximum number of players supported
  // (This is only enforced when using the Lobby server component.)
  minPlayers: 1,
  maxPlayers: 4,

  // Ends the game if this returns anything.
  // The return value is available in `ctx.gameover`.
  endIf: ({ G, ctx, random, ...plugins }) => obj,

  // Called at the end of the game.
  // `ctx.gameover` is available at this point.
  onEnd: ({ G, ctx, events, random, ...plugins }) => G,

  // Disable undo feature for all the moves in the game
  disableUndo: true,

  // Transfer delta state with JSON Patch in multiplayer
  deltaState: true,
}
```
