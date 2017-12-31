/*
 * Copyright 2017 Google Inc.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import _ from 'lodash';
import core from './core';
import tic_tac_toe from './tic-tac-toe';
import chess from './chess';

const transform_routes = (routes, prefix) => {
  routes = _.map(routes, (route) => {
    route.path = prefix + route.path;
    return route;
  });
  return routes;
}

const routes = [
  core.routes[0],
  {
    root: {
      text: 'Tic-Tac-Toe',
      path: '/tic-tac-toe'
    },
    routes: transform_routes(tic_tac_toe.routes, '/tic-tac-toe')
  },
  {
    root: {
      text: 'Chess',
      path: '/chess'
    },
    routes: transform_routes(chess.routes, '/chess')
  }
];

export default routes;
