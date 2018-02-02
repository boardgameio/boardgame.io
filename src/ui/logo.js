/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';

const Logo = ({ width, height }) => (
  <svg
    width={width || 128}
    height={height || 128}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 128 128"
  >
    <path
      d="M64,120.37,15.27,92.28V35.91L64,7.82l48.73,28.09V92.28Z"
      fill="#373748"
    />
    <path
      fill="#000"
      d="M64,124,12,94V34L64,4l52,30V94ZM18.33,90.37,64,116.74l45.67-26.37V37.63L64,11.26,18.33,37.63Z"
    />
    <path
      d="M81.77,43.17c5.92,0,10.51,1.72,13.57,5.16,3.25,3.44,4.77,8.41,4.77,14.71q0,10.32-5.15,16.06c-3.44,3.82-8.22,5.73-14.53,5.73-5.92,0-10.51-1.72-13.56-5.35-3.25-3.63-4.78-8.6-4.78-15.29s1.72-12,5.16-15.67S75.46,43.17,81.77,43.17Zm-.57,5.16c-4.4,0-7.45,1.15-9.56,3.63s-3,6.31-3,11.66c0,5.73,1,9.74,3,12.42,2.11,2.48,5.16,3.82,9.56,3.82s7.64-1.34,9.74-3.82,3.25-6.5,3.25-11.85c0-5.54-1.15-9.55-3.25-12C88.65,49.48,85.59,48.33,81.2,48.33Z"
      fill="#fff"
    />
    <path
      d="M39.35,71.45l.19,12.8H33.43L33.62,72l-.19-28.48h6.11l-.19,27.9Z"
      fill="#fff"
    />
  </svg>
);

Logo.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
};

export default Logo;
