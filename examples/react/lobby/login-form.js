/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';

export class LobbyLoginForm extends React.Component {
  static propTypes = {
    playerName: PropTypes.string,
    onEnter: PropTypes.func.isRequired,
  };
  static defaultProps = {
    playerName: '',
  };

  state = {
    playerName: this.props.playerName,
    nameErrorMsg: '',
    hasError: null,
  };

  componentDidCatch(error) {
    this.setState({ hasError: '' + error });
  }

  render() {
    if (this.state.hasError)
      return <p>Failed to render LobbyLoginForm: {this.state.hasError}</p>;
    return (
      <div>
        <p className="phase-title">Choose a player name:</p>
        <input
          type="text"
          value={this.state.playerName}
          onChange={evt => this.onChangePlayerName(evt)}
          onKeyPress={evt => this.onKeyPress(evt)}
        />
        <span className="buttons">
          <button className="buttons" onClick={() => this.onClickEnter()}>
            Enter
          </button>
        </span>
        <br />
        <span className="error-msg">
          {this.state.nameErrorMsg}
          <br />
        </span>
      </div>
    );
  }

  onClickEnter() {
    if (this.state.playerName === '') return;
    this.props.onEnter(this.state.playerName);
  }

  onKeyPress(event) {
    if (event.key === 'Enter') {
      this.onClickEnter();
    }
  }

  onChangePlayerName(event) {
    const name = event.target.value.trim();
    this.setState({
      playerName: name,
      nameErrorMsg: name.length > 0 ? '' : 'empty player name',
    });
  }
}
