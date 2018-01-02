/*
 * Copyright 2017 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

// This has to be mocked in order to keep BrowserRouter from colliding with MemoryRouter for tests

import React from 'react';
import PropTypes from 'prop-types';

const rrd = require('react-router-dom');

// Just render plain div with its children
const HashRouter = ({children}) => <div>{children}</div>
HashRouter.propTypes = {
  children: PropTypes.node
};

rrd.HashRouter = HashRouter;
module.exports = rrd;
