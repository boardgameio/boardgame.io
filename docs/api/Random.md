# Random

API for code that requires randomness. See the guide [here](random.md).

## 1. Die

### Arguments

1. `spotvalue` (_number_): The die dimension (_default: 6_).
2. `diceCount` (_number_): The number of dice to throw.

### Returns

The die roll value (or an array of values if `diceCount` is greater than `1`).

#### Usage

```js
const game = Game({
  moves: {
    move(G, ctx) {
      const die = ctx.random.Die(6);      // die = 1-6
      const dice = ctx.random.Die(6, 3);  // dice = [1-6, 1-6, 1-6]
      ...
    },
  }
});
```

## 2. Number

Returns a random number between `0` and `1`.

#### Usage

```js
const game = Game({
  moves: {
    move(G, ctx) {
      const n = ctx.random.Number();
      ...
    },
  }
});
```

## 3. Random.Shuffle

### Arguments

1. `deck` (_array_): An array to shuffle.

### Returns

The shuffled array.

#### Usage

```js
const game = Game({
  moves: {
    move(G, ctx) {
      const deck = ctx.random.Shuffle(G.deck);
      return { ...G, deck };
    },
  },
});
```

## 4. Wrappers

`D4`, `D6`, `D8`, `D10`, `D12` and `D20` are wrappers around
`Random.Die(n)`.

### Arguments

1. `diceCount` (_number_): The number of dice to throw.

### Usage

```js
const game = Game({
  moves: {
    move(G, ctx) {
      const die = ctx.random.D6();
      ...
    },
  }
});
```
