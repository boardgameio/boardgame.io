# Debugging

It may help to debug the internal Redux store. In order to do so, you can
pass along a Redux store enhancer with your client. For example,

```js
import logger from 'redux-logger';
import { applyMiddleware } from 'redux';

export default Client({
  game,
  numPlayers: 1,
  board: Board,
  enhancer: applyMiddleware(logger),
});
```

Doing so will console.log on state changes. This can also hook into the [Chrome Redux DevTools](http://extension.remotedev.io/) browser extension like this:

```js
export default Client({
  ...
  enhancer: window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())
}
```

or both

```js
import logger from 'redux-logger';
import { applyMiddleware, compose } from 'redux';

export default Client({
  ...
  enhancer: compose(
    applyMiddleware(logger),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())
  )
})
```
