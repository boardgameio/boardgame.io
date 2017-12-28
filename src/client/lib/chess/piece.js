/*
 * Copyright 2018 Google Inc.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Bishop from './bishop';
import King from './king';
import Knight from './knight';
import Pawn from './pawn';
import Queen from './queen';
import Rook from './rook';
const ANIMATION_DURATION = 750;

/*
 * piece
 *
 * Component for every chess piece. It animates any change in x and y
 * using in out cubic easing. Its SVG elements uses a space of a square width
 * side 1.
 *
 * Props:
 *   x       - X coordinate on SVG space.
 *   y       - Y coordinate on SVG space.
 *   type    - Rook (r), pawn (p), king (k) etc. Uses Chess.js convention.
 *   color   - Whether 'light' or 'dark' piece.
 *   onClick - Callback to be called when clicked, with X and Y parameters.
 *
 * Usage:
 *
 * <svg viewBox={'0 0 1 1'}>
 *   <ChessPiece type='k' color='light' x={0} y={0}
 *               onClick={onClickFn}/>
 * </svg>
 */
class ChessPiece extends React.Component {
  /**
  * Sets the x and y of the state on creation.
  */
  componentWillMount() {
    this.setState({
      x: this.props.x,
      y: this.props.y
    });
  }

  /**
  * If there is a change in x and y, saves old X, Y, and current time. Starts
  * animation.
  */
  componentWillReceiveProps (nextProps) {
    if (nextProps.x != this.props.x || nextProps.y != this.props.y) {
      this.setState({
        ...this.state,
        originTime: Date.now(),
        originX: this.props.x,
        originY: this.props.y,
      });
      requestAnimationFrame(this.animate(Date.now()));
    }
  }

  /**
  * Recursively animates state x and y value in a given time.
  * @param {number} now Unix timestamp when this was called.
  */
  animate(now) {
    return (() => {
      let elapsed = now - this.state.originTime;
      if (elapsed < ANIMATION_DURATION) {
        let percentage = this._easeInOutCubic(elapsed, 0, 1,
                                              ANIMATION_DURATION);
        this.setState({
          ...this.state,
          x: (this.props.x-this.state.originX)*percentage + this.state.originX,
          y: (this.props.y-this.state.originY)*percentage + this.state.originY,
        });
        requestAnimationFrame(this.animate(Date.now()));
      } else {
        this.setState({
          ...this.state,
          x: this.props.x,
          y: this.props.y
        });
      }
    }).bind(this);
  }

  /**
  * Returns animation easing value. See http://easings.net/#easeInOutCubic.
  * @param {number} t Current time.
  * @param {number} b Beginning value.
  * @param {number} c Final value.
  * @param {number} d Duration.
  */
  _easeInOutCubic (t, b, c, d) {
    t /= d/2;
    if (t < 1) return c/2*t*t*t + b;
    t -= 2;
    return c/2*(t*t*t + 2) + b;
  }

  render() {
    let primaryColor = '#000000';
    let secondaryColor = '#ffffff';
    if (this.props.color == 'light') {
      primaryColor = '#ffffff';
      secondaryColor = '#000000';
    }
    let drawing = null;
    switch (this.props.type) {
      case 'b': //bishop
        drawing = Bishop(primaryColor, secondaryColor); break;
      case 'k': //king
        drawing = King(primaryColor, secondaryColor); break;
      case 'q': //queen
        drawing = Queen(primaryColor, secondaryColor); break;
      case 'p': //pawn
        drawing = Pawn(primaryColor, secondaryColor); break;
      case 'r': //rook
        drawing = Rook(primaryColor, secondaryColor); break;
      case 'n': //Knight
        drawing = Knight(primaryColor, secondaryColor); break;
    }
    return (
      <g transform={'translate('+this.state.x+','+this.state.y+')'}
         onClick={() => { this.props.onClick(this.props.x, this.props.y) }}>
        <g transform="scale(.022222,.022222)">
          {drawing}
        </g>
      </g>
    );
  }
}

ChessPiece.propTypes = {
  type: PropTypes.string.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

export default ChessPiece;
