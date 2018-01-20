/*
 * Copyright 2017 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { NavLink, Route } from 'react-router-dom';

const LiNavLink = props => {
  const {
    to,
    exact,
    strict,
    activeClassName,
    className,
    activeStyle,
    style,
    isActive: getIsActive,
    ...rest
  } = props;
  return (
    <Route
      path={typeof to === 'object' ? to.pathname : to}
      exact={exact}
      strict={strict}
    >
      {({ location, match }) => {
        const isActive = !!(getIsActive ? getIsActive(match, location) : match);
        return (
          <li
            className={
              isActive ? [activeClassName, className].join(' ') : className
            }
            style={isActive ? { ...style, ...activeStyle } : style}
          >
            <NavLink to={to} {...rest} />
          </li>
        );
      }}
    </Route>
  );
};

LiNavLink.propTypes = {
  to: PropTypes.string,
  exact: PropTypes.bool,
  strict: PropTypes.bool,
  activeClassName: PropTypes.string,
  className: PropTypes.string,
  activeStyle: PropTypes.object,
  style: PropTypes.object,
  isActive: PropTypes.func,
};

export default LiNavLink;
