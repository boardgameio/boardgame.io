# Phases

Most games beyond very simple ones tend to have different
behaviors at various "phases". A game might have a phase
at the beginning where players are drafting cards before
playing, for example. Alternatively, an individual player's turn
might be divided into different phases (an action phase followed by
a buy phase in Dominion, for example).

Each phase in `boardgame.io` defines a set of options
that are applied during that phase. This includes the
ability to restrict moves, use a specific turn order and much more.

#### Card Game

Let us start with a contrived example of a single player
game that has exactly two moves:

* draw a card from the deck into your hand
* play a card from your hand onto the deck

```js
const game = Game({
  setup: () => ({ deck: 5, hand: 0 }),

  moves: {
    drawCard: G => ({ ...G, deck: G.deck - 1, hand: G.hand + 1 }),
    playCard: G => ({ ...G, deck: G.deck + 1, hand: G.hand - 1 }),
  },
});
```

We'll ignore the rendering component of this game, but this is how it might look:

```react
<iframe class='react' src='react/phases-1.html' height='800' scrolling='no' title='example' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'></iframe>
```

!> Note that you can draw or play a card at any time, including taking a card when the deck is empty.

#### Phases

Now let's say we want the game to work in two phases:

* the first phase where the player can only draw cards (until the deck is empty).
* a second phase where the player can only play cards (until their hand is empty).

In order to do this, we add a `flow` section to the `Game`
constructor (you should already be familiar with this as the location
where you placed `endGameIf` in the
[tutorial](#/tutorial?id=add-victory-condition)).

It can also contain a `phases` array, which defines different
phases in the game. Each phase can specify a list of `allowedMoves`,
which allows only those moves to be played during that phase.
They can also contain a `endPhaseIf` function that terminates
the phase automatically if a particular condition is met.

```js
const game = Game({
  setup: () => ({ deck: 5, hand: 0 }),

  moves: {
    drawCard: G => ({ ...G, deck: G.deck - 1, hand: G.hand + 1 }),
    playCard: G => ({ ...G, deck: G.deck + 1, hand: G.hand - 1 }),
  },

  flow: {
    phases: [
      {
        name: 'draw phase',
        allowedMoves: ['drawCard'],
        endPhaseIf: G => G.deck <= 0,
      },
      {
        name: 'play phase',
        allowedMoves: ['playCard'],
        endPhaseIf: G => G.hand <= 0,
      },
    ],
  },
});
```

!> Phases can also be terminated manually by calling `props.events.endPhase()` from the
board React component (in response to a user action like clicking a button, for example).

Watch our game in action now with phases. Notice that you can only draw cards in the first
phase, and you can only play cards in the second phase.

```react
<iframe class='react' src='react/phases-2.html' height='1000' scrolling='no' title='example' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'></iframe>
```

!> Note the additional fields in `ctx` like `phase`.

#### Automatic Setup and Cleanup

Phases can also specify automatic "board actions" that occur at the beginning or
end of a phase. These are specified just like normal moves in `onPhaseBegin` and
`onPhaseEnd`.

```js
phases: [
  {
    name: '...',
    onPhaseBegin: (G, ctx) => G,
    onPhaseEnd: (G, ctx) => G,
  },
];
```

#### Triggers / Hooks

The `flow` section can specify a number of automatic behaviors when a move is made
or when the turn or phase is ended. These can also be overridden at the phase level.
Let's take a look at some of these:

!> For a more complete set of options, take a look
[here](https://github.com/nicolodavis/boardgame.io/blob/master/src/core/flow.js#L139).

```js
flow: {
  // Ends the turn if this returns true.
  endTurnIf: (G, ctx) => boolean

  // Ends the game if this returns anything other than undefined.
  endGameIf: (G, ctx) => boolean

  // Run at the start of a turn.
  onTurnBegin: (G, ctx) => G

  // Run at the end of a turn.
  onTurnEnd: (G, ctx) => G

  // Run at the end of a move.
  onMove: (G, ctx) => G

  phases: [
    {
      name: 'A',

      // Ends the phase if this returns a truthy value.
      endPhaseIf: (G, ctx) => {}

      // Run at the beginning of a phase.
      onPhaseBegin: (G, ctx) => G

      // Run at the end of a phase.
      onPhaseEnd:   (G, ctx) => G

      // Can override the global-options here for this
      // specific phase only.
      endTurnIf: ...
      endGameIf: ...
      onTurnBegin: ...
      onTurnEnd: ...
      onMove:    ...
    }
  ]
}
```

!> An important point to note is that in a multiplayer game, all of the code under
`flow` is executed only on the server. The code under `moves`, in contrast, is
run on both client and server. It is run on the client in order to effect a
quick state transition without network lag, and run on the server to process
the authoritative version of the state.
