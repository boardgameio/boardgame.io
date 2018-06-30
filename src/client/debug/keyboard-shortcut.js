/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Mousetrap from 'mousetrap';
import './debug.css';

/**
 * KeyboardShortcut
 *
 * Registers a keyboard shortcut to activate the
 * associated child component that is passed in.
 *
 * When the key is pressed, 'active' is set to true
 * in the prop passed to the child.
 */
export class KeyboardShortcut extends React.Component {
  static propTypes = {
    value: PropTypes.string.isRequired,
    children: PropTypes.any,
    onPress: PropTypes.func,
  };

  state = {
    active: false,
  };

  deactivate = () => {
    this.setState({ active: false });
  };

  activate = () => {
    this.setState({ active: true });
    if (this.props.onPress) {
      this.props.onPress();
      this.setState({ active: false });
    }
  };

  componentDidMount() {
    Mousetrap.bind(this.props.value, e => {
      e.preventDefault();
      this.activate();
    });
  }

  componentWillUnmount() {
    Mousetrap.unbind(this.props.value);
  }

  render() {
    let child = this.props.children;
    if (typeof this.props.children === typeof this) {
      child = React.cloneElement(this.props.children, {
        active: this.state.active,
        deactivate: this.deactivate,
        activate: this.activate,
      });
    }

    let className = 'key';
    if (this.state.active) {
      className += ' active';
    }

    return (
      <div className={className}>
        <div className="key-box" onClick={this.activate}>
          {this.props.value}
        </div>
        <div className="key-child">{child}</div>
      </div>
    );
  }
}
