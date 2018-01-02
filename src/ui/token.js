/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';

const ANIMATION_DURATION = 750;

/**
 * Token
 *
 * Component that handles board game piece behaviors and position on grid.
 * If animate=True, it animates any change in x and y using in out cubic easing.
 *
 * Props:
 *   x       - X coordinate on grid coordinates.
 *   y       - Y coordinate on grid coordinates.
 *   animate - Whether it should animate any change in position.
 *   onClick - Callback to be called when clicked, with X and Y parameters.
 *   _coordinateFn - Transform coordinates to SVG space. Function should be
 * given by the grid, no need to specify it manually.
 *
 * Usage:
 *
 * <Grid rows={8} cols={8}>
 *   <Token x={1} y={2}>
 *     <Knight color='dark' />
 *   </Token>
 * </Grid>
 */
class Token extends React.Component {
  static propTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
    animate: PropTypes.bool,
    onClick: PropTypes.func,
    _coordinateFn: PropTypes.func,
    children: PropTypes.element,
  }

  /**
   * Sets the x and y of the state on creation.
   */
  componentWillMount() {
    this.setState(this._getSvgCoordinates());
  }

  /**
   * If there is a change in x and y, saves old X, Y, and current time. Starts
   * animation.
   */
  componentWillReceiveProps(nextProps) {
    if (nextProps.x != this.props.x || nextProps.y != this.props.y) {
      let svgCoord = this._getSvgCoordinates();
      this.setState({
        ...this.state,
        originTime: Date.now(),
        originX: svgCoord.x,
        originY: svgCoord.y,
      });
      requestAnimationFrame(this._animate(Date.now()));
    }
  }

  /**
   * Recursively animates state x and y value in a given time.
   * @param {number} now Unix timestamp when this was called.
   */
  _animate(now) {
    return (() => {
      let elapsed = now - this.state.originTime;
      let svgCoord = this._getSvgCoordinates();
      if (elapsed < ANIMATION_DURATION && this.props.animate) {
        let percentage = this._easeInOutCubic(elapsed, 0, 1,
                                              ANIMATION_DURATION);
        this.setState({
          ...this.state,
          x: (svgCoord.x - this.state.originX) * percentage + this.state.originX,
          y: (svgCoord.y - this.state.originY) * percentage + this.state.originY,
        });
        requestAnimationFrame(this._animate(Date.now()));
      } else {
        this.setState({
          ...this.state,
          x: svgCoord.x,
          y: svgCoord.y
        });
      }
    }).bind(this);
  }

  /**
   * Gets SVG coordinates. If a coordinate function is available, it will pass
   * all props to it and receive back X and Y in SVG space
   * @return {Object} Object with x and y parameter.
   */
  _getSvgCoordinates() {
    if (this.props._coordinateFn) {
      return this.props._coordinateFn(this.props);
    } else {
      return { x: this.props.x, y: this.props.y };
    }
  }

  /**
   * Returns animation easing value. See http://easings.net/#easeInOutCubic.
   * @param {number} t Current time.
   * @param {number} b Beginning value.
   * @param {number} c Final value.
   * @param {number} d Duration.
   */
  _easeInOutCubic(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t * t + b;
    t -= 2;
    return c / 2 * (t * t * t + 2) + b;
  }

  render() {
    return (
      <g transform={'translate(' + this.state.x + ',' + this.state.y + ')'}
         onClick={() => { this.props.onClick(this.props.x, this.props.y) }}>
        {this.props.children}
      </g>
    );
  }
}

export default Token;
