# Phases

A round-robin turn order where each player makes
a number of moves before hitting `endTurn` might suffice
for simple games, but sometimes you need more structure
and customization.

A `flow` allows you to define different phases that
follow their own turn-order rules, with the option to
specify certain automatic board actions that happen when
a phase begins or ends.

#### Game

Let us start with a contrived example of a single player
game that has exactly two moves:
- take a card from the deck into your hand
- play a card from your hand onto the deck

```js
const game = Game({
  setup: () => ({ deck: 5, hand: 0 }),

  moves: {
    takeCard: G => ({ ...G, deck: G.deck - 1, hand: G.hand + 1 }),
    playCard: G => ({ ...G, deck: G.deck + 1, hand: G.hand - 1 }),
  }
});
```

We'll ignore the rendering portion of this game (check the examples in
the repository for the code), but this is how it might look:

```react
<iframe class='react' src='react/phases-1.html' height='400' scrolling='no' title='example' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'></iframe>
```
