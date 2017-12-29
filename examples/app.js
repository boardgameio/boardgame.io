/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { render } from 'react-dom';
import { HashRouter as Router, Route, NavLink } from 'react-router-dom';
import routes from './routes';
import './app.css';

const App = () => (
  <Router>
    <div>
      <ul>
        {
          routes.map((route, idx) => (
            <li key={idx}>
              <NavLink to={route.path} exact={true}>{route.text}</NavLink>
            </li>
          ))
        }
      </ul>

      {
        routes.map((route, idx) => (
            <Route key={idx} exact path={route.path} component={route.component}/>
        ))
      }
    </div>
  </Router>
);

render(<App/>, document.getElementById('app') ||
               document.createElement('div'));

if (module.hot) {
  module.hot.accept();
}
