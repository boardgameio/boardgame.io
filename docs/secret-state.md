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
takes `G`, `ctx` and returns a version of `G` that is
stripped of any secret information for the current
player.

!> You can get the current player via `ctx.currentPlayer`.

```js
const App = Game({
  ...

  playerView: (G, ctx) => {
    return StripSecrets(G, ctx.currentPlayer);
  }
});
```
