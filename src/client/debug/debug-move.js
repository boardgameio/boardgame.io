/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { KeyboardShortcut } from './keyboard-shortcut';
import './debug.css';

/**
 * DebugMove
 *
 * Component that allows the user to dispatch a move from
 * the debug pane. The user is presented with the textarea
 * to enter any additional arguments.
 */
export class DebugMove extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    shortcut: PropTypes.string.isRequired,
    fn: PropTypes.func.isRequired,
  };

  state = {
    error: '',
  };

  onSubmit = value => {
    let error = '';

    try {
      let argArray = new Function(`return [${value}]`)();
      this.props.fn.apply(this, argArray);
    } catch (e) {
      error = '' + e;
    }

    this.setState({
      error,
      focus: false,
      enterArg: false,
    });
  };

  render() {
    return (
      <div>
        <KeyboardShortcut value={this.props.shortcut}>
          <DebugMoveArgField name={this.props.name} onSubmit={this.onSubmit} />
        </KeyboardShortcut>
        {this.state.error ? (
          <span className="move-error">{this.state.error}</span>
        ) : null}
      </div>
    );
  }
}

export class DebugMoveArgField extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
    active: PropTypes.bool,
    activate: PropTypes.func,
    deactivate: PropTypes.func,
  };

  componentDidUpdate() {
    if (this.props.active) {
      this.span.focus();
    } else {
      this.span.blur();
    }
  }

  onKeyDown = e => {
    if (e.key == 'Enter') {
      e.preventDefault();
      const value = this.span.innerText;
      this.props.onSubmit(value);
      this.span.innerText = '';
      this.props.deactivate();
    }

    if (e.key == 'Escape') {
      e.preventDefault();
      this.props.deactivate();
    }
  };

  render() {
    let className = 'move';
    if (this.props.active) className += ' active';
    return (
      <div className={className} onClick={this.props.activate}>
        {this.props.name}
        (<span
          ref={r => {
            this.span = r;
          }}
          className="arg-field"
          onBlur={this.props.deactivate}
          onKeyDown={this.onKeyDown}
          contentEditable
        />)
      </div>
    );
  }
}
