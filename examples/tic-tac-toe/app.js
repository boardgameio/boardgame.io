/*
 * Copyright 2017 Google Inc.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { render } from 'react-dom';
import { HashRouter as Router, Route, NavLink } from 'react-router-dom';
import Client from 'boardgame.io/client';
import { TicTacToe, Board } from './tic-tac-toe';
import './app.css';

export const App = Client({
  game: TicTacToe,
  board: Board,
  multiplayer: true,
});

const Multiplayer = () => (
  <div className="runner">
    <div className="run">
      <App debug={false} gameID="multi" playerID="0" />
    </div>
    <div className="run">
      <App debug={false} gameID="multi" playerID="1" />
    </div>
  </div>
);

const Runner = () => (
  <Router>
    <div>
    <ul>
    <li><NavLink to="/" exact={true}>Tic-Tac-Toe</NavLink></li>
    <li><NavLink to="/multiplayer" exact={true}>Multiplayer</NavLink></li>
    </ul>

    <Route exact path="/" component={App}/>
    <Route path="/multiplayer" component={Multiplayer}/>
    </div>
  </Router>
);

render(<Runner/>, document.getElementById('app') ||
                  document.createElement('div'));

if (module.hot) {
  module.hot.accept();
}
