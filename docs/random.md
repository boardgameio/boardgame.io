# Randomness and its Use in Games

Many games allow moves whose outcome depends on shuffled cards or rolled dice.
Take e.g. the game [Yahtzee](https://en.wikipedia.org/wiki/Yahtzee).
A player rolls dice, chooses some, rolls another time, chooses some more, and does a final dice roll.
Depending on the face-up sides he now must choose where he will score.

This poses interesting challenges regarding the implementation.

* **AI**. Randomness makes games interesting since you cannot predict the future, but it
  needs to be controlled in order for allowing games that can be replayed exactly (e.g. for AI purposes).

* **PRNG State**. The game runs on both the server and client.
  All code and data on the client can be viewed and used to a player's advantage.
  If a client could predict the next random numbers that are to be generated, the future flow of a game stops being unpredictable.
  The library must not allow such a scenario. The RNG and its state must stay at the server.

* **Pure Functions**. The library is built using Redux. This is important for games since each move is a [reducer](https://redux.js.org/docs/basics/Reducers.html),
  and thus must be pure. Calling `Math.random()` and other functions that
  maintain external state would make the game logic impure and not idempotent.

### Using Randomness in Games

```js
import { Random } from 'boardgame.io/core';

Game({
  moves: {
    rollDie(G, ctx) {
      return { ...G, dice: Random.D6() };
    },
  },
});
```

!> The PRNG state is maintained inside `ctx._random` by the `Random`
package automatically.

### Shuffles

To simulate a shuffled deck of cards, sometimes it might be simplest to draw a card from a random index in an array. This can get confusing if your game moves
include a move for peeking at the top card which is later rendered moot by
another move which shuffles the deck. To simplify modeling this, you might want
to represent your deck as an array. Use `Random.Shuffle` to perform a shallow
shuffle of the elements.

```js
import { Random } from 'boardgame.io/core';

const SomeGame = Game({
  setup: () => ({
    deck: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
  }),
  moves: {
    shuffleDeck(G) {
      return { ...G, deck: Random.Shuffle(G.deck) };
    },
  },
});
```

### Seed

The library uses a `seed` in `ctx._random` that is stripped before it
is sent to the client. All the code that needs randomness uses this
`seed` to generate random numbers.

You can override the initial `seed` like this:

```js
Game({
  seed: <somevalue>
  ...
})
```

### Background

There is an interesting background article by David Bau called [Random Seeds, Coded Hints, and Quintillions](http://davidbau.com/archives/2010/01/30/random_seeds_coded_hints_and_quintillions.html).
Despite its age, this article gives insight on topics about randomness, like differentiating _local_ and _network_ entropy.
