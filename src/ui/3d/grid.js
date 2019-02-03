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

/**
 * Grid
 *
 * Component that will show children on a cartesian regular grid.
 *
 * Props:
 *   rows       - Number of rows (height) of the grid.
 *   cols       - Number of columns (width) of the grid.
 *   cellSize   - Size of a square.
 *   thichness  - Thichness of a square.
 *   padding    - Padding between squares.
 *   colorMap   - A map from 'x,y' => color.
 *   onClick    - (x, y) => {}
 *                Called when a square is clicked.
 *   onMouseOver    - (x, y) => {}
 *                Called when a square is mouse over.
 *   onMouseOut    - (x, y) => {}
 *                Called when a square is mouse out.
 *
 * Usage:
 *
 * <Grid rows={8} cols={8}>
 *   <Token x={1} y={2}/>
 * </Grid>
 */
export const Grid = props => (
  <UIContext.Consumer>
    {context => <GridImpl {...props} context={context} />}
  </UIContext.Consumer>
);

class GridImpl extends React.Component {
  static propTypes = {
    rows: PropTypes.number.isRequired,
    cols: PropTypes.number.isRequired,
    cellSize: PropTypes.number,
    thickness: PropTypes.number,
    padding: PropTypes.number,
    colorMap: PropTypes.object,
    onClick: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseOut: PropTypes.func,
    context: PropTypes.any,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.element),
      PropTypes.element,
    ]),
  };
  static defaultProps = {
    colorMap: {},
    cellSize: 1,
    padding: 0.1,
    thickness: 0.1,
  };

  constructor(props) {
    super(props);
    this.boardGroup = new THREE.Group();
    this.tokenGroup = new THREE.Group();
    this.boardGroup.add(this.tokenGroup);
    // translate the board to center on (0,0,0)
    this.boardGroup.translateX(
      (-(this.props.padding + this.props.cellSize) * (this.props.cols - 1)) / 2
    );
    this.boardGroup.translateZ(
      (-(this.props.padding + this.props.cellSize) * (this.props.rows - 1)) / 2
    );
  }

  _getCellColor(x, y) {
    const key = `${x},${y}`;
    let color = '#777777';
    if (key in this.props.colorMap) {
      color = this.props.colorMap[key];
    }
    return color;
  }

  componentWillUnmount() {
    this.context.remove(this.boardGroup);
  }

  render() {
    this.context = this.props.context;
    this.context.add(this.boardGroup);

    // when rerendering, render a new squareGroup
    this.boardGroup.remove(this.squareGroup);
    this.squareGroup = new THREE.Group();
    this.boardGroup.add(this.squareGroup);

    // add square base
    for (let x = 0; x < this.props.cols; x++) {
      for (let y = 0; y < this.props.rows; y++) {
        let squareProps = {
          x: x,
          y: y,
          size: this.props.cellSize,
          color: this._getCellColor(x, y),
          padding: this.props.padding,
          thickness: this.props.thickness,
        };
        let square = new Square(squareProps);
        this.squareGroup.add(square);
        const onEvent = e => {
          if (e.type == 'click') {
            if (this.props.onClick) this.props.onClick({ x: x, y: y });
          } else if (e.type == 'mouseOver') {
            if (this.props.onMouseOver) this.props.onMouseOver({ x: x, y: y });
          } else if (e.type == 'mouseOut') {
            if (this.props.onMouseOut) this.props.onMouseOut({ x: x, y: y });
          }
        };
        this.context.regCall(square, onEvent);
      }
    }
    //set tokens
    const tokens = React.Children.map(this.props.children, child => {
      return React.cloneElement(child, {
        three: true,
        boardSize: this.props.cellSize,
        ui: this.context,
        parrent: this.tokenGroup,
        padding: this.props.padding,
        lift: this.props.thickness,
      });
    });

    return tokens;
  }
}

/**
 * Square
 *
 * Component that renders a square inside a Grid.
 *
 * Props
 *   x          - X coordinate on grid coordinates.
 *   y          - Y coordinate on grid coordinates.
 *   size       - Square size.
 *   color      - Color of the square
 *   thichness  - Thichness of a square.
 *   padding    - Padding between squares.
 *
 * Not meant to be used by the end user directly (use Token).
 * Also not exposed in the NPM.
 */
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
