# Debugging

### Using the Debug Panel in production

boardgame.io comes bundled with a debug panel that lets you
interact with your game and game clients. When you build your app
for production (i.e. when `NODE_ENV === 'production'`) this is stripped
out from the final bundle.

If you want to include the debug panel in a production build you can
do so explicitly when creating your client:

```js
import { Debug } from 'boardgame.io/debug';

const client = Client({
  // ...
  debug: { impl: Debug },
});
```

### Debug Panel options

You can use the `collapseOnLoad` option to hide the panel by default when the client loads. The `hideToggleButton` option removes the toggle button on the side of the panel which means you can only use the keyboard shortcut to toggle its visibility.

```js
const client = Client({
  // ...
  debug: {
    // ...
    collapseOnLoad: true/false,
    hideToggleButton: true/false
  },
});
```

### Custom metadata in game logs

It can sometimes be helpful to surface some metadata during a move.
You can do this by using the log plugin. For example,

```js
const move = ({ log }) => {
  log.setMetadata('metadata for this move');
};
```

This metadata is stored in the `log` client property and displayed
in the Log section of the debug panel.

### Redux

The framework uses Redux under the hood.
You may sometimes want to debug this Redux store directly.
In order to do so, you can pass along a Redux store enhancer
with your client. For example,

```js
import logger from 'redux-logger';
import { applyMiddleware } from 'redux';

Client({
  // ...
  enhancer: applyMiddleware(logger),
});
```

Doing so will `console.log` on state changes. This can also hook into the [Chrome Redux DevTools](http://extension.remotedev.io/) browser extension like this:

```js
Client({
  // ...
  enhancer: (
    window.__REDUX_DEVTOOLS_EXTENSION__
    && window.__REDUX_DEVTOOLS_EXTENSION__()
  ),
})
```

or both

```js
import logger from 'redux-logger';
import { applyMiddleware, compose } from 'redux';

Client({
  // ...
  enhancer: compose(
    applyMiddleware(logger),
    (window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())
  ),
})
```
