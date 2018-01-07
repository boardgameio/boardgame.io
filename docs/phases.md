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
- draw a card from the deck into your hand
- play a card from your hand onto the deck

```js
const game = Game({
  setup: () => ({ deck: 5, hand: 0 }),

  moves: {
    drawCard: G => ({ ...G, deck: G.deck - 1, hand: G.hand + 1 }),
    playCard: G => ({ ...G, deck: G.deck + 1, hand: G.hand - 1 }),
  }
});
```

We'll ignore the rendering component of this game, but this is how it might look:

```react
<iframe class='react' src='react/phases-1.html' height='800' scrolling='no' title='example' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'></iframe>
```

!> Note that you can draw or play a card at any time, including taking a card when the deck is empty.

#### Flow

Now let's say we want the game to work in two phases:
- the first phase where the player can only draw cards.
- a second phase where the player can only play cards.

Further, we want the game to transition from the first phase to
the second automatically once the deck is empty, and we want the
game to transition back to the draw phase once the player's hand
is empty.

In order to do this, we add a `flow` section to the `Game`
constructor. It takes a `phases` array, which defines different
phases in the game. Each phase can specify a list of `allowedMoves`,
which allows only those moves to be played during that phase.
They can also contain a `endPhaseIf` function, that terminates
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
        endPhaseIf: G => (G.deck <= 0),
      },
      {
        name: 'play phase',
        allowedMoves: ['playCard'],
        endPhaseIf: G => (G.hand <= 0),
      }
    ],
  }
});
```

!> Phases can also be terminated manually by calling `props.game.endPhase()` from the
   board React component (in response to a user action like clicking a button, for example).

```react
<iframe class='react' src='react/phases-2.html' height='1000' scrolling='no' title='example' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'></iframe>
```
