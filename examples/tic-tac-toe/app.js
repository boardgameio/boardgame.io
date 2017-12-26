/*
 * Copyright 2017 Google Inc.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Route, Link } from 'react-router-dom';
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
      <App debug={false} gameid="multi" player="0" />
    </div>
    <div className="run">
      <App debug={false} gameid="multi" player="1" />
    </div>
  </div>
);

const Runner = () => (
  <BrowserRouter>
    <div>
    <ul>
    <li><Link to="/">Tic-Tac-Toe</Link></li>
    <li><Link to="/multiplayer">Multiplayer</Link></li>
    </ul>

    <Route exact path="/" component={App}/>
    <Route path="/multiplayer" component={Multiplayer}/>
    </div>
  </BrowserRouter>
);

render(<Runner/>, document.getElementById('app') ||
                  document.createElement('div'));

if (module.hot) {
  module.hot.accept();
}
