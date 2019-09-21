# Phases

Most games beyond very simple ones tend to have different
behaviors at various "phases". A game might have a phase
at the beginning where players are drafting cards before
entering a playing phase, for example.

Each phase in `boardgame.io` defines a set of options
that are applied during that phase. This includes the
ability to restrict moves, use a specific turn order and much more.
Turns happen within phases.

#### Card Game

Let us start with a contrived example of a single player
game that has exactly two moves:

- draw a card from the deck into your hand.
- play a card from your hand onto the deck.

```js
function DrawCard(G) {
  G.deck--;
  G.hand++;
}

function PlayCard(G) {
  G.deck++;
  G.hand--;
}

const game = {
  setup: () => ({ deck: 5, hand: 0 }),
  moves: { DrawCard, PlayCard },
};
```

!> Notice how we moved the moves out into standalone functions
instead of inlining them in the game spec.

We'll ignore the rendering part of this game, but this is how it might look:

```react
<iframe class='react' src='react/phases-1.html' height='270' scrolling='no' title='example' frameborder='no' allowtransparency='true' allowfullscreen='true'></iframe>
```

!> Note that you can draw or play a card at any time, including taking a card when the deck is empty.

#### Phases

Now let's say we want the game to work in two phases:

- a first phase where the player can only draw cards (until the deck is empty).
- a second phase where the player can only play cards (until their hand is empty).

The game alternates between these two phases indefinitely.

In order to do this, we define two `phases`. Each phase can specify its own
list of moves, which come into effect during that phase:

```js
const game = {
  setup: () => ({ deck: 5, hand: 0 }),

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
the main `moves` section in the game. However, if it does,
then the `moves` section in the phase overrides the global
one.

The game doesn't begin in any of these phases. In order to begin
in the "draw" phase, we add a `start: true` to its config. Only
one phase can have `start: true`.

```js
const game = {
  setup: () => ({ deck: 5, hand: 0 }),

  phases: {
    draw: {
      moves: { DrawCard },
+     start: true,
    },

    play: {
      moves: { PlayCard },
    },
  },
};
```

Let's also add conditions for when these phases end. The "draw"
phase ends once the deck is empty, and the "play" phase ends once
the hand is empty.

```js
const game = {
  setup: () => ({ deck: 5, hand: 0 }),

  phases: {
    draw: {
      moves: { DrawCard },
+     endIf: G => (G.deck <= 0),
      start: true,
    },

    play: {
      moves: { PlayCard },
+     endIf: G => (G.hand <= 0),
    },
  },
};
```

`endIf` ends the phase that it is defined in when it returns
`true`. The game is then returned to a state where no phase is
active. However, for this game, we want the game to move to
the "play" phase once the "draw" phase is done (and vice-versa).
To do this, we add a `next` option to each phase:

```js
const game = {
  setup: () => ({ deck: 5, hand: 0 }),

  phases: {
    draw: {
      moves: { drawCard },
      endIf: G => (G.deck <= 0),
      start: true,
+     next: 'play',
    },
    play: {
      moves: { playCard },
      endIf: G => (G.hand <= 0),
+     next: 'draw',
    }
  },
};
```

Watch our game in action now with phases. Notice that you can only draw cards in the first
phase, and you can only play cards in the second phase.

```react
<iframe class='react' src='react/phases-2.html' height='300' scrolling='no' title='example' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'></iframe>
```

#### Setup and Cleanup hooks

Phases can also specify automatic "board actions" that occur at the beginning or
end of a phase. These are specified just like normal moves in `onBegin` and `onEnd`.

```js
phases: {
  phaseA: {
    onBegin: (G, ctx) => { ... },
    onEnd: (G, ctx) => { ... },
  },
};
```

!> Hooks like `onBegin` and `onEnd` are run only on the server in
multiplayer games. Moves, on the other hand, run on both client
and server. They are run on the client in order to facilitate
a lag-free experience, and are run on the server to calculate the
authoritative game state.

#### Moving between phases

The two primary ways of moving between phases are by calling the
following events:

1. `endPhase`: This ends the current phase and returns the game
   to a state where no phase is active. If the phase specifies a
   `next` option, then the game will move into that phase instead.
   This event can also be triggered automatically by using an `endIf`
   condition in the phase spec.

2. `setPhase`: This ends the current phase and moves the game into
   the phase specified by the argument.

!> Whenever a phase ends, the current player's turn is first ended automatically.
