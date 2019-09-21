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
