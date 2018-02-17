/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';

export class Meeple extends React.Component {
  static propTypes = {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    style: PropTypes.any,
    onClick: PropTypes.func,
    children: PropTypes.element,
  };

  static defaultProps = {
    x: 0,
    y: 0,
    style: { fill: '#ff0000' },
  };

  onClick = () => {
    this.props.onClick({
      x: this.props.x,
      y: this.props.y,
    });
  };

  render() {
    const tx = this.props.x; //* this.props.size;
    const ty = this.props.y; //* this.props.size;

    // If a child is passed, render child.
    if (this.props.children) {
      return (
        <g onClick={this.onClick} transform={`translate(${tx}, ${ty})`}>
          {this.props.children}
        </g>
      );
    }

    // If no child, render a disc.
    return (
      <g onClick={this.onClick} transform={`translate(${tx}, ${ty})`}>
        <g transform="translate(-0.75, -0.62) scale(0.16, 0.16)">
          <g
            strokeWidth="0.1px"
            strokeLinejoin="round"
            strokeLinecap="round"
            stroke="black"
          >
            <polygon
              fill="green"
              points="6.019,5.6454 5.4864,5.9214 5.1434,6.1862 4.9869,6.4751 4.9749,6.6978 5.0712,6.9205 5.2638,7.0709 5.6188,7.1311 6.1364,7.1672 6.2403,7.2454 6.2264,7.416 6.1637,7.5867 6.0488,7.7887 5.9095,8.0569 5.7876,8.2589 5.6622,8.4957 5.5682,8.6698 5.488,8.8335 5.3905,9.0425 5.3209,9.2097 5.2686,9.3629 5.2303,9.5336 5.2199,9.6763 5.2338,9.7878 5.3,9.8575 5.4079,9.8853 5.8433,9.8888 6.3309,9.8818 6.7836,9.8958 6.9335,9.8829 7.0618,9.8372 7.1551,9.7429 7.2523,9.6 7.3728,9.3959 7.5323,9.1312 7.6107,9.0136 7.6779,8.9114 7.7507,8.826 7.7997,8.7868 7.8445,8.7602 7.9032,8.784 7.9634,8.8344 8.0124,8.889 8.088,8.9996 8.1692,9.1284 8.2406,9.2473 8.3301,9.3985 8.3875,9.4923 8.4765,9.6274 8.5723,9.7666 8.6154,9.81 8.6646,9.8471 8.733,9.8738 8.8498,9.8883 9.5616,9.8891 9.9829,9.8863 10.3412,9.8765 10.4187,9.8474 10.4609,9.7974 10.4834,9.7225 10.4784,9.592 10.4643,9.4963 10.4257,9.3418 10.3736,9.1738 10.2594,8.9118 10.1771,8.7288 9.9962,8.3969 9.8047,8.0509 9.6536,7.7839 9.5041,7.4832 9.4588,7.3393 9.4481,7.2829 9.4763,7.2227 9.5395,7.1828 9.6299,7.1498 9.7708,7.1362 9.9312,7.1313 10.11,7.1264 10.3122,7.1012 10.421,7.073 10.5153,7.0244 10.595,6.9709 10.6524,6.8961 10.7039,6.8028 10.7233,6.7182 10.7321,6.5919 10.7185,6.4635 10.664,6.3343 10.5944,6.2309 10.4866,6.1092 10.3424,5.9972 10.1549,5.8838 9.9561,5.7789 9.7252,5.6753 9.5446,5.6039 9.3599,5.5409 9.1401,5.4695 8.9372,5.3982 8.7874,5.3352 8.7692,5.1658 8.7552,4.9895 8.7273,4.8439 8.6769,4.6857 8.6293,4.5696 8.5691,4.4716 8.4795,4.3554 8.3647,4.2644 8.2584,4.2071 8.1296,4.1609 8.0106,4.1343 7.8539,4.1301 7.6971,4.1399 7.5571,4.1609 7.427,4.2113 7.3038,4.2868 7.2156,4.3708 7.1387,4.4604 7.0673,4.5794 7.0001,4.7599 6.9805,4.8439 6.9581,4.9783 6.9385,5.1042 6.9329,5.2246 6.9244,5.331 6.9264,5.33 6.7796,5.399 6.6766,5.4311 6.5273,5.4784"
            />
          </g>
        </g>
      </g>
    );
  }
}
