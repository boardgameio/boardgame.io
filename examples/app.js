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
import { Multiplayer } from './multiplayer';
import './app.css';
import './tic-tac-toe/tic-tac-toe.css';

export const Singleplayer = Client({
  game: TicTacToe,
  board: Board
});

const App = () => (
  <Router>
    <div>
    <ul>
    <li><NavLink to="/" exact={true}>Tic-Tac-Toe</NavLink></li>
    <li><NavLink to="/multiplayer" exact={true}>Multiplayer</NavLink></li>
    </ul>

    <Route exact path="/" component={Singleplayer}/>
    <Route path="/multiplayer" component={Multiplayer}/>
    </div>
  </Router>
);

render(<App/>, document.getElementById('app') ||
               document.createElement('div'));

if (module.hot) {
  module.hot.accept();
}
