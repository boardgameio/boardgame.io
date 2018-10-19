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

* a first phase where the player can only draw cards (until the deck is empty).
* a second phase where the player can only play cards (until their hand is empty).

In order to do this, we add a `flow` section to the game
spec (you should already be familiar with this as the location
where you placed `endGameIf` in the
[tutorial](#/tutorial?id=add-victory-condition)). It can also contain a `phases` object, which defines different phases in the game. Each phase can specify a list of `allowedMoves`,
which allows only those moves to be played during that phase.

```js
const game = Game({
  setup: () => ({ deck: 5, hand: 0 }),

  moves: {
    drawCard: G => ({ ...G, deck: G.deck - 1, hand: G.hand + 1 }),
    playCard: G => ({ ...G, deck: G.deck + 1, hand: G.hand - 1 }),
  },

  flow: {
    startingPhase: 'draw',

    phases: {
      draw: {
        allowedMoves: ['drawCard'],
        endPhaseIf: G => G.deck <= 0,
        next: 'play',
      },

      play: {
        allowedMoves: ['playCard'],
        endPhaseIf: G => G.hand <= 0,
        next: 'draw',
      },
    },
  },
});
```

!> Every game also has an implicit `default` phase, which is just
a phase with no specific options, so the example above actually
has three phases, even though we never use the `default` phase.

### Terminating a phase

A phase ends when one of the following happens:

###### 1. `endPhaseIf` triggers:

This is a simple boolean function that terminates the phase when
it returns `true` (see the example above).

###### 2. The `endPhase` event is dispatched:

This can happen either in the game logic or from the client
directly. See the [Events API](events.md) for more details
on how to dispatch events.

###### What happens when a phase terminates?

The game moves on to the "next" phase. This phase is determined by the
following in increasing order of precedence (i.e. if [2] and [4] are both
relevant, the result of [4] is used):

1. The `default` phase is chosen as the next phase if no other option is present.

2. If a phase specifies the `next` option (like our example above does), then that is
   chosen as the next phase.

3. `endPhaseIf` can return the name of the next phase.

4. The `endPhase` event accepts the name of the next phase as an argument.

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
phases: {
  phaseA: {
    onPhaseBegin: (G, ctx) => G,
    onPhaseEnd: (G, ctx) => G,
  },
};
```

#### Triggers / Hooks

The `flow` section can specify a number of automatic behaviors when a move is made
or when the turn or phase is ended. These can also be overridden at the phase level.
Let's take a look at some of these:

!> For an authoritative set of options, take a look
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

  phases: {
    A: {
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
  }
}
```

!> An important point to note is that in a multiplayer game, all of the code under
`flow` is executed only on the master. The code under `moves`, on the other hand, is
run on both client and server. It is run on the client in order to effect a
quick state transition without network lag, and run on the server to process
the authoritative version of the state.
