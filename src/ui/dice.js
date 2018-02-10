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

    this.state = {
      faceValue: props.faceValue,
    };
  }

  onClick = () => {
    let { faceCount } = this.props;
    let faceValue = Math.floor(Math.random() * faceCount) + 1; // can't have a zero face;

    if (this.props.onClick) {
      this.props.onClick(faceValue);
    }

    this.setState({
      faceValue,
    });
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.faceValue !== nextProps.faceValue) {
      this.setState({ faceValue: nextProps.faceValue });
    }
  }

  render() {
    let { className, dotStyle, faceValue, faceCount, ...rest } = this.props;
    const classNames = ['bgio-dice'];
    if (className) classNames.push(className);

    return (
      <div className={classNames.join(' ')} {...rest} onClick={this.onClick}>
        {dotStyle && faceCount < 9 && faceValue < 9 ? ( // hard to fit mor ethan 9 "dots" on the dice;
          [...Array(this.state.faceValue)].map((face, i) => {
            return <div key={i} className="bgio-dot" />;
          })
        ) : (
          <span>{this.state.faceValue}</span>
        )}
      </div>
    );
  }
}

Dice.propTypes = {
  faceCount: PropTypes.number,
  faceValue: PropTypes.number,
  dotStyle: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

Dice.defaultProps = {
  faceCount: 6,
  faceValue: 4,
  dotStyle: true,
};

export { Dice };
