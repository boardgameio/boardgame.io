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

  playerView: (G, ctx, player) => {
    return StripSecrets(G, player);
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
ReactDOM.render(<App gameid="gameid" player="1" />, document.getElementById('root'));
```

From now on, this client will see state that is customized
for `player 1`, which is calculated using the `playerView`
function above.
