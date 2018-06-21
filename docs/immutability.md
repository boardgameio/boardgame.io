# Immutability

It is important that all your move functions are pure
and don't mutate the passed in arguments. Always return
a new copy of `G`, unless nothing has changed, in which
case you may return the same object that was passed in.

!> A move can also return `undefined` (or not return),
which indicates that the move (or its combination of arguments)
is invalid at this point in the game and shouldn't update the
game state.

Here are some patterns for immutable updates:

#### Object.assign()

You can create a new copy of an object using `Object.assign`,
and override any properties in it.

```js
move(G, ctx) {
  const counter = G.counter + 1;
  return Object.assign({}, G, counter);
}
```

#### Object Spread

If you use ES2015 features, the object spread is useful
while performing immutable updates.

```js
move(G, ctx) {
  const counter = G.counter + 1;
  return { ...G, counter };
}
```

#### Immutability Helpers

You might also take advantage of an external library like
[immutable.js](https://facebook.github.io/immutable-js/).
This is particularly helpful if you have lots of mutations
that you want to express in a concise way.

```js
import { fromJS } from 'immutable';

move(G, ctx) {
  return fromJS(G).withMutations(g => {
    ...
  }).toJS();
}
```

#### Additional Reading

[Immutable Update Patterns](https://redux.js.org/recipes/structuring-reducers/immutable-update-patterns)
