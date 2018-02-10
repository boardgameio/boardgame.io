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
    let { className, dotStyle, faceCount, ...rest } = this.props;
    let { faceValue } = this.state;
    const classNames = ['bgio-dice'];
    if (className) classNames.push(className);
    return (
      <div className={classNames.join(' ')} {...rest} onClick={this.onClick}>
        {dotStyle && faceCount < 9 // hard to fit mor ethan 9 "dots" on the dice;
          ? [...Array(faceValue)].map((face, i) => {
              return <div key={i} className="bgio-dot" />;
            })
          : { faceValue }}
      </div>
    );
  }
}

Dice.propTypes = {
  faceCount: PropTypes.number,
  faceValue: PropTypes.number,
  dotStyle: PropTypes.bool,
  className: PropTypes.string,
};

Dice.defaultProps = {
  faceCount: 6,
  faceValue: 6,
  dotStyle: true,
};

export default Dice;
