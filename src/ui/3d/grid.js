/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import UIContext from '../ui-context';
import * as THREE from 'three';

// Not yet implemented.
export class Grid extends React.Component {
  static propTypes = {
    rows: PropTypes.number.isRequired,
    cols: PropTypes.number.isRequired,
    outline: PropTypes.bool,
    colorMap: PropTypes.object,
    cellSize: PropTypes.number,
    thickness: PropTypes.number,
    padding: PropTypes.number,
    onClick: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseOut: PropTypes.func,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.element),
      PropTypes.element,
    ]),
  };
  static defaultProps = {
    colorMap: {},
    outline: true,
    cellSize: 1,
    padding: 0.1,
    thickness: 0.1,
  };

  constructor(props) {
    super(props);
    this.boardGroup = new THREE.Group();
    this.squareGroup = new THREE.Group();
    this.tokenGroup = new THREE.Group();
    this.boardGroup.add(this.squareGroup);
    this.boardGroup.add(this.tokenGroup);
  }

  _getCellColor(x, y) {
    const key = `${x},${y}`;
    let color = '#777777';
    if (key in this.props.colorMap) {
      color = this.props.colorMap[key];
    }
    return color;
  }

  _drawSquare(ctx) {
    this.ctx = ctx;
    ctx.add(this.boardGroup);
    this.boardGroup.translateX(
      (-(this.props.padding + this.props.cellSize) * (this.props.cols - 1)) / 2
    );
    this.boardGroup.translateZ(
      (-(this.props.padding + this.props.cellSize) * (this.props.rows - 1)) / 2
    );

    // add square base
    if (this.props.outline) {
      for (let x = 0; x < this.props.cols; x++) {
        for (let y = 0; y < this.props.rows; y++) {
          let squareProps = {
            x: x,
            y: y,
            ctx: ctx,
            size: this.props.cellSize,
            color: this._getCellColor(x, y),
            padding: this.props.padding,
            thickness: this.props.thickness,
          };
          let square = new Square(squareProps);
          this.squareGroup.add(square);
          const onEvent = e => {
            if (e.type == 'click') {
              this.props.onClick({ x: x, y: y });
            } else if (e.type == 'mouseOver') {
              this.props.onMouseOver({ x: x, y: y });
            } else if (e.type == 'mouseOut') {
              this.props.onMouseOut({ x: x, y: y });
            }
          };
          ctx.regCall(square, onEvent);
        }
      }
    }

    //set tokens
    const tokens = React.Children.map(this.props.children, child => {
      return React.cloneElement(child, {
        size: this.props.cellSize,
        ui: ctx,
        parrent: this.tokenGroup,
        padding: this.props.padding,
        lift: this.props.thickness,
      });
    });
    return tokens;
  }

  componentWillUnmount() {
    this.ctx.remove(this.boardGroup);
  }

  render() {
    return (
      <UIContext.Consumer>{ctx => this._drawSquare(ctx)}</UIContext.Consumer>
    );
  }
}

// Not yet implemented.
export class Square extends THREE.Mesh {
  constructor(props) {
    super();
    this.userData = {
      responsive: true,
      draggable: false,
      ...props,
    };
    props = this.userData;
    this.geometry = new THREE.BoxBufferGeometry(
      props.size,
      props.thickness,
      props.size
    );
    this.material = new THREE.MeshLambertMaterial({ color: props.color });

    this.receiveShadow = true;
    this.translateX(this.userData.x * (props.size + props.padding));
    this.translateZ(this.userData.y * (props.size + props.padding));
    this.translateY(this.userData.thickness / 2);
  }
}
