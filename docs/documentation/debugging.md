# Debugging

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
