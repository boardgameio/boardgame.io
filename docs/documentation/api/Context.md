# Context

Here are some examples on what the `ctx` Context parameter contains:

## Simple Beginning Game

This would be the context of a simple two player game without phases or stages that has just started:

```js
{
  /** Number of players in the game */
  numPlayers: 2,
  /** List of player IDs in play order */
  playOrder: ["A", "B"],
  /** Current position in the play order */
  playOrderPos: 0,
  /**
   * If there are stages, this is an Object containing all currently active players with their playerIds as fields and the stage they are in as content.
   *
   * Will be `null` if there are no stages.
   * */
  activePlayers: null,
  /** playerID of the player that is acting right now */
  currentPlayer: "A",
  /** Number of moves that have been taken in the game already */
  numMoves: 0,
  /** Turn number of the current turn */
  turn: 0,
  /**
   * Contains the return value of the `endIf` function in the `Game` object if the game is over.
   *
   * Is empty if the game is not over.
   */
  phase: null,
}
```

## Simple In Progress Game

This would be the context of the same game after it has just ended

```js
{
  /** Number of players in the game */
  numPlayers: 2,
  /** List of player IDs in play order */
  playOrder: ["A", "B"],
  /** Current position in the play order */
  playOrderPos: 1,
  /**
   * If there are stages, this is an Object containing all currently active players with their playerIds as fields and the stage they are in as content.
   *
   * Will be `null` if there are no stages.
   * */
  activePlayers: null,
  /** playerID of the player that is acting right now */
  currentPlayer: "B",
  /** Number of moves that have been taken in the game already */
  numMoves: 6,
  /** Turn number of the current turn */
  turn: 6,
  /** Active phase of the game or `null` if there are no phases */
  phase: null,
  /**
   * Contains the return value of the `endIf` function in the `Game` object if the game is over.
   *
   * Is empty if the game is not over.
   */
  gameOver: {
    winner: "B",
  },
}
```

## Game with Phases and Stages

This would be the context of a more complex game with phases and stages:

```js
{
  /** Number of players in the game */
  numPlayers: 4,
  /** List of player IDs in play order */
  playOrder: ["A", "B", "C", "D"],
  /** Current position in the play order */
  playOrderPos: 1,
  /**
   * If there are stages, this is an Object containing all currently active players with their playerIds as fields and the stage they are in as content.
   *
   * Will be `null` if there are no stages.
   * */
  activePlayers: {
    A: "Choose Opponent",
    B: "Choose Opponent",
  },
  /** playerID of the player that is acting right now */
  currentPlayer: "B",
  /** Number of moves that have been taken in the game already */
  numMoves: 4,
  /** Turn number of the current turn */
  turn: 2,
  /** Active phase of the game or `null` if there are no phases */
  phase: "Building",
}
```
