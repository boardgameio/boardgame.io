/*
 * Copyright 2017 Google Inc.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { HashRouter as Router, Route, NavLink } from 'react-router-dom';
import _ from 'lodash';

import routes from './routes';
import './app.css';
import Logo from './logo.svg';

const App = () => (
  <Router>
    <div>
      <header>
        <div className='header-container'>
          <a href='/'><Logo height={40}/></a>

          <nav className='main-menu'>

            {
              routes.map((route, idx) => {
                if (route.root === undefined) {
                  return (
                    <NavLink key={idx} to={route.path} exact={true} className='menu-button'>{route.text}</NavLink>
                  );
                } else {
                  return (
                    <div key={idx} className='dropdown-wrapper menu-button'>
                      <NavLink to={route.root.path} exact={true} className='menu-button'>{route.root.text}</NavLink>
                      <div className='drop-menu fade-in effect'>
                        {
                          route.routes.map((_route, _idx) => (
                            <NavLink key={`${idx}.${_idx}`} to={_route.path} exact={true} className='menu-button'>{_route.text}</NavLink>
                          ))
                        }
                      </div>
                    </div>
                  );
                }
              })
            }

          </nav>
        </div>
      </header>

      {
        _.flattenDeep(
          routes.map(route => {
            if (route.root === undefined) {
              return route;
            } else {
              return route.routes;
            }
          })
        ).map((route, idx) => (
          <Route key={idx} exact path={route.path} component={route.component}/>
        ))
      }
    </div>
  </Router>
);

export default App;
