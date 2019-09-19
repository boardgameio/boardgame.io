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
 *   draggable - Whether a Token is draggable or not.
 *   shouldDrag - Whether a draggable token should start drag.
 *   onDrag - Called when a token was dragged (moved).
 *            Parameter contain { x, y, originalX, originalY }.
 *   onDrop - Called when the token was dropped after dragging.
 *            Parameter contain { x, y, originalX, originalY }.
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
export class Token extends React.Component {
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
    draggable: PropTypes.bool,
    shouldDrag: PropTypes.func,
    onDrag: PropTypes.func,
    onDrop: PropTypes.func,
    svgRef: PropTypes.object,
  };

  static defaultProps = {
    animationDuration: 750,
    template: Square,
  };

  constructor(props) {
    super(props);
    this.state = {
      ...this.getCoords(),
      dragged: null,
      usingTouch: false,
    };
  }

  _startDrag = e => {
    if (this.props.draggable && this.props.shouldDrag(this.getCoords())) {
      e.preventDefault(); // Required for Safari/iOs.
      e = e.touches ? e.touches[0] : e;
      this.setState({
        ...this.state,
        dragged: { x: e.pageX, y: e.pageY },
      });
      this._addOrRemoveDragEventListeners(true);
    }
  };

  _drag = e => {
    if (this.state.dragged) {
      e.preventDefault(); // Required for Safari/iOs.
      e = e.touches ? e.touches[0] : e;
      const ctm = this.props.svgRef.current.getScreenCTM().inverse();
      const deltaPageX = e.pageX - this.state.dragged.x;
      const deltaPageY = e.pageY - this.state.dragged.y;
      const deltaSvgX = ctm.a * deltaPageX + ctm.b * deltaPageY;
      const deltaSvgY = ctm.c * deltaPageX + ctm.d * deltaPageY;
      const x = this.state.x + deltaSvgX;
      const y = this.state.y + deltaSvgY;
      if (this.props.onDrag) {
        this.props.onDrag({
          x,
          y,
          originalX: this.props.x,
          originalY: this.props.y,
        });
      }

      this.setState({
        ...this.state,
        x,
        y,
        dragged: { x: e.pageX, y: e.pageY },
      });
    }
  };

  _endDrag = e => {
    if (this.state.dragged) {
      e.preventDefault();
      // Whether this is a drop or a click depends if the mouse moved after drag.
      // Android will issue very small drag events, so we need a distance.
      const dist = Math.sqrt(
        (this.state.x - this.props.x) ** 2 + (this.state.y - this.props.y) ** 2
      );
      if (dist > 0.2) {
        this.props.onDrop({
          x: this.state.x,
          y: this.state.y,
          originalX: this.props.x,
          originalY: this.props.y,
        });
      } else {
        this.props.onClick({ x: this.state.x, y: this.state.y });
      }
      this.setState({
        ...this.state,
        x: this.props.x,
        y: this.props.y,
        dragged: null,
      });
      this._addOrRemoveDragEventListeners(false);
    }
  };

  _onClick = param => {
    // Ignore onClick if the element is draggable, because desktops will
    // send both onClick and touch events, leading to duplication.
    // Whether this will be a click or a drop will be defined in _endDrag.
    if (!(this.props.draggable && this.props.shouldDrag(this.getCoords()))) {
      this.props.onClick(param);
    }
  };

  componentWillUnmount() {
    if (this.state.dragged) {
      this._addOrRemoveDragEventListeners(false);
    }
  }

  /**
   * If there is a change in props, saves old x/y,
   * and current time. Starts animation.
   * @param {Object} nextProps Next props.
   */
  // eslint-disable-next-line react/no-deprecated
  UNSAFE_componentWillReceiveProps(nextProps) {
    let oldCoord = this.getCoords();
    let newCoord = this.getCoords(nextProps);

    // Debounce.
    if (oldCoord.x == newCoord.x && oldCoord.y == newCoord.y) {
      return;
    }

    this.setState({
      ...this.state,
      originTime: Date.now(),
      originX: this.state.x,
      originY: this.state.y,
      originZ: this.state.z,
    });

    requestAnimationFrame(this._animate(Date.now()));
  }

  /**
   * Add or remove event listeners.
   * @param {boolean} shouldAdd If it should add (or remove) listeners.
   */
  _addOrRemoveDragEventListeners(shouldAdd) {
    const svgEl = this.props.svgRef.current;
    if (!svgEl) return;
    let addOrRemoveEventListener = svgEl.addEventListener;
    if (!shouldAdd) {
      addOrRemoveEventListener = svgEl.removeEventListener;
    }
    addOrRemoveEventListener('touchmove', this._drag, { passive: false });
    addOrRemoveEventListener('mousemove', this._drag, { passive: false });
    addOrRemoveEventListener('mouseup', this._endDrag, { passive: false });
    addOrRemoveEventListener('mouseleave', this._endDrag, { passive: false });
    addOrRemoveEventListener('touchcancel', this._endDrag, { passive: false });
    addOrRemoveEventListener('touchleave', this._endDrag, { passive: false });
    addOrRemoveEventListener('touchend', this._endDrag, { passive: false });
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
    if (t < 1) return (c / 2) * t * t * t + b;
    t -= 2;
    return (c / 2) * (t * t * t + 2) + b;
  }

  /**
   * Gets event listeners needed for drag and drop.
   */
  _eventListeners() {
    return [
      { name: 'mousedown', callback: this._startDrag },
      { name: 'touchstart', callback: this._startDrag },
    ];
  }

  render() {
    const Component = this.props.template;

    return (
      <Component
        x={this.state.x}
        y={this.state.y}
        z={this.state.z}
        style={this.props.style}
        onClick={this._onClick}
        onMouseOver={this.props.onMouseOver}
        onMouseOut={this.props.onMouseOut}
        eventListeners={this._eventListeners()}
        svgRef={this.props.svgRef}
      >
        {this.props.children}
      </Component>
    );
  }
}
