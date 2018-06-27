# Randomness

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
Game({
  moves: {
    rollDie(G, ctx) {
      return { ...G, dice: ctx.random.D6() };
    },
  },
});
```

!> The PRNG state is maintained inside `ctx._random` by the `Random`
package automatically.

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

### API Reference

[link](api/Random.md)
