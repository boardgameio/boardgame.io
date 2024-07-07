# Phases

Most games beyond very simple ones tend to have different
behaviors at various phases. A game might have a phase
at the beginning where players are drafting cards before
entering a playing phase, for example.

Each phase in [boardgame.io](https://boardgame.io/) defines a set
of game configuration options that are applied for the duration
of that phase. This includes the ability to define a different
set of moves, use a different turn order etc. **Turns happen
inside phases**.

### Card Game

Let us start with a contrived example of a game that has exactly
two moves:

- draw a card from the deck into your hand.
- play a card from your hand onto the deck.

```js
function drawCard({ G, playerID }) {
  G.deck--;
  G.hand[playerID]++;
}

function playCard({ G, playerID }) {
  G.deck++;
  G.hand[playerID]--;
}

const game = {
  setup: ({ ctx }) => ({ deck: 6, hand: Array(ctx.numPlayers).fill(0) }),
  moves: { drawCard, playCard },
  turn: { minMoves: 1, maxMoves: 1 },
};
```

?> Notice how we moved the moves out into standalone functions
instead of inlining them in the game object.

We'll ignore the rendering part of this game, but this is how it might look. Note that you can draw or play a card at any time, including taking a card when the deck is empty.

```react
<iframe class='plain' src='snippets/phases-1' height='350' scrolling='no' title='example' frameborder='no' allowtransparency='true' allowfullscreen='true'></iframe>
```

### Phases

Now let's say we want the game to work in two phases:

- a first phase where the players only draw cards (until the deck is empty).
- a second phase where the players only play cards.

In order to do this, we define two `phases`. Each phase can specify its own
list of moves, which come into effect during that phase:

```js
const game = {
  setup: ({ ctx }) => ({ deck: 6, hand: Array(ctx.numPlayers).fill(0) }),
  turn: { minMoves: 1, maxMoves: 1 },

  phases: {
    draw: {
      moves: { DrawCard },
    },

    play: {
      moves: { PlayCard },
    },
  },
};
```

!> A phase that doesn't specify any moves just uses moves from
the main `moves` section in the game. 

The game doesn't begin in any of these phases. In order to begin
in the "draw" phase, we add a `start: true` to its config. Only
one phase can have `start: true`.

```js
phases: {
  draw: {
    moves: { DrawCard },
    start: true,
  },

  play: {
    moves: { PlayCard },
  },
}
```

Let's also end the "draw" phase automatically once the deck is
empty.

```js
phases: {
  draw: {
    moves: { DrawCard },
    endIf: ({ G }) => (G.deck <= 0),
    next: 'play',
    start: true,
  },

  play: {
    moves: { PlayCard },
  },
}
```

`endIf` ends the phase that it is defined in when it returns
`true`. The game is returned to a state where no phase is
active. However, for this game, we want to move to
the "play" phase once the "draw" phase is done. We specify a
`next` option for this, which tells the framework to go to that
phase.

Watch our game in action (now with phases). Notice that you can only draw cards in the first
phase, and you can only play cards in the second phase.

```react
<iframe class='plain' src='snippets/phases-2' height='350' scrolling='no' title='example' frameborder='no' allowtransparency='true' allowfullscreen='true'></iframe>
```

### Setup and Cleanup hooks

You can also run code automatically at the beginning or end of a phase. These are specified just like normal moves in `onBegin` and `onEnd`.

```js
phases: {
  phaseA: {
    onBegin: ({ G, ctx }) => { ... },
    onEnd: ({ G, ctx }) => { ... },
  },
};
```

?> Hooks like `onBegin` and `onEnd` are run only on the server in
multiplayer games. Moves, on the other hand, run on both client
and server. They are run on the client in order to facilitate
a lag-free experience, and are run on the server to calculate the
authoritative game state.

### Moving between Phases

#### Using events

The two primary ways of moving between phases are by calling the
following events:

1. `endPhase`: This ends the current phase and returns the game
   to a state where no phase is active. If the phase specifies a
   `next` option, then the game will move into that phase instead.

2. `setPhase`: This ends the current phase and moves the game into
   the phase specified by the argument.


#### Using an `endIf` condition

You can also end a phase by returning a truthy value from its
`endIf` method:

```js
phases: {
  phaseA: {
    next: 'phaseB',
    endIf: ({ G, ctx }) => true,
  },
  phaseB: { ... },
},
```

!> Whenever a phase ends, the current player's turn is first ended automatically.


### Setting the next phase dynamically

Instead of setting a phase’s `next` option with a string, you can
provide a function that will return the next phase based on game
state at the end of the phase:

```js
phases: {
  phaseA: {
    next: ({ G }) => {
      return G.condition ? 'phaseC' : 'phaseB';
    },
  },
  phaseB: { ... },
  phaseC: { ... },
},
```


### Override Behavior

As observed above, a phase can specify its own `moves` section
which comes into effect when the phase is active. This `moves`
section completely replaces the global `moves` section
for the duration of the phase. The moves may have the
same name as their global equivalents, but they are not related
to them in any way.

A phase can similarly also override the `turn` section. You will
typically do this if you want to use a different
[Turn Order](turn-order.md) during the phase.
