/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-syle
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Square } from './grid';

/**
 * Token
 *
 * Component that represents a board game piece (or token).
 * Can be used by itself or with one of the grid systems
 * provided (Grid or HexGrid).
 *
 * A token renders as a square inside a Grid and a
 * hexagon inside a HexGrid. Additionally, you can pass
 * it a child if you want any other custom rendering.
 *
 * Props:
 *   x       - X coordinate on grid / hex grid.
 *   y       - Y coordinate on grid / hex grid.
 *   z       - Z coordinate on hex grid.
 *   animate - Changes in position are animated if true.
 *   animationDuration - Length of animation.
 *   onClick - Called when the token is clicked.
 *   onMouseOver - Called when the token is mouse over.
 *   onMouseOut - Called when the token is mouse out.
 *
 * Usage:
 *
 * <Grid rows={8} cols={8}>
 *   <Token x={1} y={2}/>
 * </Grid>
 *
 * <HexGrid>
 *   <Token x={1} y={2} z={-3}/>
 * </HexGrid>
 *
 * <Grid rows={8} cols={8}>
 *   <Token x={1} y={2}>
 *     <Knight color="white"/>
 *   </Token>
 * </Grid>
 */
class Token extends React.Component {
  static propTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
    z: PropTypes.number,
    template: PropTypes.any,
    style: PropTypes.any,
    animate: PropTypes.bool,
    onClick: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseOut: PropTypes.func,
    children: PropTypes.element,
    animationDuration: PropTypes.number,
  };

  static defaultProps = {
    animationDuration: 750,
    template: Square,
  };

  /**
   * Sets the x and y of the state on creation.
   */
  // eslint-disable-next-line react/no-deprecated
  componentWillMount() {
    this.setState(this.getCoords());
  }

  /**
   * If there is a change in props, saves old x/y,
   * and current time. Starts animation.
   * @param {Object} nextProps Next props.
   */
  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(nextProps) {
    let oldCoord = this.getCoords();
    let newCoord = this.getCoords(nextProps);

    // Debounce.
    if (oldCoord.x == newCoord.x && oldCoord.y == newCoord.y) {
      return;
    }

    this.setState({
      ...this.state,
      originTime: Date.now(),
      originX: oldCoord.x,
      originY: oldCoord.y,
      originZ: oldCoord.z,
    });

    requestAnimationFrame(this._animate(Date.now()));
  }

  /**
   * Recursively animates x and y.
   * @param {number} now Unix timestamp when this was called.
   */
  _animate(now) {
    return (() => {
      let elapsed = now - this.state.originTime;
      let svgCoord = this.getCoords();
      if (elapsed < this.props.animationDuration && this.props.animate) {
        const percentage = this._easeInOutCubic(
          elapsed,
          0,
          1,
          this.props.animationDuration
        );

        this.setState({
          ...this.state,
          x:
            (svgCoord.x - this.state.originX) * percentage + this.state.originX,
          y:
            (svgCoord.y - this.state.originY) * percentage + this.state.originY,
          z:
            (svgCoord.z - this.state.originZ) * percentage + this.state.originZ,
        });

        requestAnimationFrame(this._animate(Date.now()));
      } else {
        this.setState({
          ...this.state,
          x: svgCoord.x,
          y: svgCoord.y,
          z: svgCoord.z,
        });
      }
    }).bind(this);
  }

  /**
   * Gets SVG x/y/z coordinates.
   * @param {Object} props Props object to get coordinates from.
   * @return {Object} Object with x, y and z parameters.
   */
  getCoords(props = this.props) {
    return { x: props.x, y: props.y, z: props.z };
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
    const Component = this.props.template;

    return (
      <Component
        x={this.state.x}
        y={this.state.y}
        z={this.state.z}
        style={this.props.style}
        onClick={this.props.onClick}
        onMouseOver={this.props.onMouseOver}
        onMouseOut={this.props.onMouseOut}
      >
        {this.props.children}
      </Component>
    );
  }
}

export default Token;
