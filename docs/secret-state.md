# Secret State

In some games, you might need to hide information from
players. For example, you might not want to reveal the
hands of opponents in card games.

This is easily accomplished at the UI layer (by not
rendering secret information), but the framework also
provides support for not even sending such data to
the client.

In order to do this, use the `playerView` setting in
the `Game` constructor. It accepts a function that
takes `G`, `ctx`, `player` and returns a version of `G`
that is stripped of any secret information for the
player keyed by `player`.

```js
const App = Game({
  ...

  playerView: (G, ctx, playerID) => {
    return StripSecrets(G, playerID);
  }
});
```

In addition to this, you also need to associate clients with
a particular player. The framework is not tied to any particular
authentication system (use anything you wish). Once you have
a mapping from the currently logged in user to a particular
player in a game, use the `player` prop to make the client
aware of this.

```
ReactDOM.render(<App gameID="gameid" player="1" />, document.getElementById('root'));
```

From now on, this client will see state that is customized
for `player "1"`, which is calculated using the `playerView`
function above.

#### PlayerView.STRIP_SECRETS

The framework comes bundled with an implementation of `playerView`
that does the following:

* It removes a key named `secret` from `G`.
* If `G` contains a `players` object, it removes all keys except
  for one that matches `playerID`.

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
