# Randomness

Many games allow moves whose outcome depends on shuffled cards or rolled dice.
Take e.g. the game [Yahtzee](https://en.wikipedia.org/wiki/Yahtzee).
A player rolls dice, chooses some, rolls another time, chooses some more, and does a final dice roll.
Depending on the face-up sides the player now must choose where they will score.

This poses interesting challenges regarding the implementation.

- **AI**. Randomness makes games interesting since you cannot predict the future, but it
  needs to be controlled in order for allowing games that can be replayed exactly (e.g. for AI purposes).

- **<abbr title="Pseudo-Random Number Generator">PRNG</abbr> State**.
  The game runs on both the server and client.
  All code and data on the client can be viewed and used to a player's advantage.
  If a client could predict the next random numbers that are to be generated, the future flow of a game stops being unpredictable.
  The library must not allow such a scenario. The RNG and its state must stay on the server.

- **Pure Functions**. The library is built using Redux. This is important for games since each move is a [reducer](https://redux.js.org/docs/basics/Reducers.html),
  and thus must be pure. Calling `Math.random()` and other functions that
  maintain external state would make the game logic impure and not idempotent.

### Using Randomness in Games

The object passed to moves and other game logic contains an object `random`,
which exposes a range of functions for generating randomness.

For example, the `random.D6` function is similar to rolling six-sided dice:

```js
{
  moves: {
    rollDie: ({ G, random }) => {
      G.dieRoll = random.D6(); // dieRoll = 1–6
    },

    rollThreeDice: ({ G, random }) => {
      G.diceRoll = random.D6(3); // diceRoll = [1–6, 1–6, 1–6]
    }
  },
}
```

You can see details for all the available random functions below.

### Seed

You can set the initial `seed` used for the random number generator
on your game object:

```js
const game = {
  seed: 42,
  // ...
};
```

?> `seed` can be either a string or a number.

## API Reference

### 1. Die

#### Arguments

1. `spotvalue` (_number_): The die dimension (_default: 6_).
2. `diceCount` (_number_): The number of dice to throw.

#### Returns

The die roll value (or an array of values if `diceCount` is greater than `1`).

#### Usage

```js
const game = {
  moves: {
    move({ random }) {
      const die = random.Die(6);      // die = 1-6
      const dice = random.Die(6, 3);  // dice = [1-6, 1-6, 1-6]
    },
  }
};
```

### 2. Number

Returns a random number between `0` and `1`.

#### Usage

```js
const game = {
  moves: {
    move({ random }) {
      const n = random.Number();
    },
  }
};
```

### 3. Shuffle

#### Arguments

1. `deck` (_array_): An array to shuffle.

#### Returns

The shuffled array.

#### Usage

```js
const game = {
  moves: {
    move({ G, random }) {
      G.deck = random.Shuffle(G.deck);
    },
  },
};
```

### 4. Wrappers

`D4`, `D6`, `D8`, `D10`, `D12` and `D20` are wrappers around
`Die(n)`.

#### Arguments

1. `diceCount` (_number_): The number of dice to throw.

#### Usage

```js
const game = {
  moves: {
    move({ random }) {
      const die = random.D6();
    },
  }
};
```
