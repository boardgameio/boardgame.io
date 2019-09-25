# Secret State

In some games you might need to hide information from
players. For example, you might not want to reveal the
hands of opponents in card games.

This is easily accomplished at the UI layer (by not
rendering secret information), but the framework also
provides support for not even sending such data to
the client.

In order to do this, use the `playerView` setting in
the game object. It accepts a function that
takes `G`, `ctx`, `playerID` and returns a version of `G`
that is stripped of any secret information for that specific
player.

```js
const game = {
  ...

  playerView: (G, ctx, playerID) => {
    return StripSecrets(G, playerID);
  }
};
```

!> Make sure that you associate the game clients with individual
players (as discussed in the [Multiplayer](multiplayer.md) section).

#### PlayerView.STRIP_SECRETS

The framework comes bundled with an implementation of `playerView`
that does the following:

- It removes a key named `secret` from `G`.
- If `G` contains a `players` object, it removes all keys except
  for the one that matches `playerID`.

```
G: {
  secret: { ... },

  players: {
    '0': { ... },
    '1': { ... },
    '2': { ... },
  }
}
```

becomes the following for player `1`:

```
G: {
  players: {
    '1': { ... },
  }
}
```

Usage:

```js
import { Game, PlayerView } from 'boardgame.io/core';

const App = Game({
  ...
  playerView: PlayerView.STRIP_SECRETS
});
```
