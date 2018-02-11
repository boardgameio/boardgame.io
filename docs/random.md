# Randomness and its Use in Games

Many games allow moves whose outcome depends on shuffled cards or rolled dice.
Take e.g. the game [Yahtzee](https://en.wikipedia.org/wiki/Yahtzee).
A player rolls dice, chooses some, rolls another time, chooses some more, and does a final dice roll.
Depending on the face-up sides he now must choose where he will score.

This poses interesting challenges regarding the implementation.

* **AI**. Randomness makes games interesting since you cannot predict the future, but it
  needs to be controlled in order for allowing games that can be replayed exactly (e.g. for AI purposes).

* **PRNG State**. The library is used both on the server side and on the client side.
  All code and data on the client can be viewed and used to a players advantage.
  If a client could predict the next random numbers that are to be generated, the future flow of a game stops being unpredictable.
  The library must not allow such a scenario. The RNG and its state must stay at the server.

## Using Randomness in Games

Boardgame.io took a rather unusual approach to randomness: It disallows getting random variables directly.
Instead, a game can ask the engine to generate random numbers, and the engine will inject those into the game on the next move.

```js
import { rolldie } from 'boardgame.io/core';

const SomeGome = Game({
  // ...
  moves: {
    clickCell(G, ctx, id) {
      const G_withRequest = rolldie(G, 'field1');
      return { ...G_withRequest };
    },
  },
  // ...
});
```

This will place a request to a D6 dice roll inside `G`.
While processing the move, the request gets evaluated and the result placed into `field1`, where it can be used for e.g. rendering purposes.

## Background

There is an interesting background article by David Bau called [Random Seeds, Coded Hints, and Quintillions](http://davidbau.com/archives/2010/01/30/random_seeds_coded_hints_and_quintillions.html).
Despite its age, this article gives insight on topics about randomness, like differentiating _local_ and _network_ entropy.
