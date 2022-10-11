# Concepts

### State

boardgame.io captures game state in two objects: `G` and `ctx`.

```js
{
  // The game state (managed by you).
  G: {},

  // Read-only metadata (managed by the framework).
  ctx: {
    turn: 0,
    currentPlayer: '0',
    numPlayers: 2,
  }
}
```

These state objects are passed around everywhere and maintained
on both client and server seamlessly. The state in `ctx` is
incrementally adoptable, meaning that you can manage all the
state manually in `G` if you so desire.

?> `ctx` contains other fields not shown here that games
can take advantage of, including support for game phases and complex
turn orders.

!> Because state can be sent between client and server,
`G` must be a JSON-serializable object; in particular, it must
not contain classes or functions.

### Moves

These are functions that tell the framework how to change `G`
when a particular game move is made. They must not depend on
external state or have any side-effects (except modifying `G`).
See the guide on [Immutability](immutability.md) for how
immutability is handled by the framework.

```js
moves: {
  drawCard: ({ G, ctx }) => {
    const card = G.deck.pop();
    G.hand.push(card);
  },

  // ...
}
```

On the client, you use a `moves` object to dispatch your
move functions.

<!-- tabs:start -->
#### **Plain JS**

You can access `moves` from an instance of the plain JavaScript client:

```js
client.moves.drawCard();
```

#### **React**

Using React, `moves` is provided through your component’s `props`:

```js
props.moves.drawCard();
```

<!-- tabs:end -->

### Events

These are framework-provided functions that are analogous to moves, except that they work on `ctx`. These typically advance the game state by doing things like
ending the turn, changing the game phase etc.
Events are dispatched from the client in a similar way to moves.

<!-- tabs:start -->
#### **Plain JS**
```js
client.events.endTurn();
```

#### **React**
```js
props.events.endTurn();
```
<!-- tabs:end -->

For more details, see the guide on [Events](events.md).

### Phase

A phase is a period in the game that overrides the game
configuration while it is active. For example, you can use
a different set of moves or a different turn order during
a phase. The game can transition between different phases, and turns
occur inside phases. See the guide on [Phases](phases.md) for more details.

### Turn

A turn is a period of the game that is associated with an individual
player. It typically consists of one or more moves made by
that player before it passes on to another player. You can
also allow other players to play during your turn, although
this is less common. See the guide on
[Turn Orders](turn-order.md) for more details.

### Stage

A stage is similar to a phase, except that it happens within a turn, and
applies to individual players rather than the game as a whole.
A turn may be subdivided into many stages, each allowing a different set of moves
and overriding other game configuration options while that stage is active.
Also, different players can be in different stages during a turn.
See the guide on [Stages](stages.md) for more details.
