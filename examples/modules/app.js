/*
 * Copyright 2017 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import _ from 'lodash';
import LiNavLink from './li-navlink';

import routes from './routes';
import './app.css';

// CSS for the sidebar is taken from vue.css
const App = () => (
  <Router>
    <main>
      <aside className="sidebar">
        <div className="sidebar-nav" style={{ height: '90%' }}>
          <ul>
            {routes.map((route_category, idx) => (
              <li key={idx}>
                <p>{route_category.name}</p>
                <ul>
                  {route_category.routes.map((route, _idx) => (
                    <LiNavLink
                      key={`${idx}.${_idx}`}
                      to={route.path}
                      exact={true}
                      activeClassName="active"
                    >
                      {route.text}
                    </LiNavLink>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <section className="content">
        {_.flattenDeep(routes.map(route => route.routes)).map((route, idx) => (
          <Route
            key={idx}
            exact
            path={route.path}
            component={route.component}
          />
        ))}
      </section>
    </main>
  </Router>
);

export default App;
