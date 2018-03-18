/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import './dice.css';

class Dice extends React.Component {
  constructor(props) {
    super(props);
  }

  onClick = () => {
    if (this.props.onClick) {
      this.props.onClick();
    }
  };

  render() {
    // Face values larger than this are not represented with dots.
    const MAXVALUE = 9;

    let { className, dotStyle, value, ...rest } = this.props;
    const classNames = ['bgio-dice'];
    if (className) classNames.push(className);

    return (
      <div className={classNames.join(' ')} {...rest} onClick={this.onClick}>
        {dotStyle && value < MAXVALUE ? (
          [...Array(value)].map((face, i) => {
            return <div key={i} className="bgio-dot" />;
          })
        ) : (
          <span>{value}</span>
        )}
      </div>
    );
  }
}

Dice.propTypes = {
  value: PropTypes.number,
  dotStyle: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

Dice.defaultProps = {
  value: 4,
  dotStyle: true,
};

export { Dice };
