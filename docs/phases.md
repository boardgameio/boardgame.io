# Phases

A round-robin turn order where each player makes
a number of moves before hitting `endTurn` might suffice
for simple games, but sometimes you need more structure
and customization.

A `flow` allows you to define different phases that
follow their own turn-order rules, with the option to
specify certain automatic board actions that happen when
a phase begins or ends.

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

#### Automatic setup and cleanup

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

?> The framework takes care of running these board actions locally while prototyping
in singleplayer mode, and running it only on the server in multiplayer mode.

#### Custom Turn Orders

The phase can also take a `turnOrder` option in order to customize how
the turn gets passed around between different players during that phase.

```js
import { TurnOrder } from 'boardgame.io/core';

flow: {
  phases: [{
    name: 'A',
    turnOrder: TurnOrder.DEFAULT,
  }],
}
```

A `TurnOrder` object has the following structure:

```js
{
  // Get the first player.
  first: (G, ctx) => startingPlayer,

  // Get the next player when endTurn is called.
  next: (G, ctx) => nextPlayer
}
```

!> `TurnOrder.ANY` implements a turn order where any player can play during
the phase, following no particular order.

#### Passing

When you use phases, you will notice that you also have an additional game
event called `pass` that you can use. This is analogous to `endTurn`, but
also marks the fact that the played passed when they ended the turn.

When all the players have passed, `ctx.allPassed` is set to `true`.

Putting this all together, you can do the following to implement a phase
where play continues in round-robin order (skipping over players that pass),
until all players have passed:

```js
phases: [
  {
    name: 'A',
    endTurnIf: G => G.allPassed,
    turnOrder: TurnOrder.SKIP,
  },
];
```
