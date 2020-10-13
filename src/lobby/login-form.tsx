/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';

type LoginFormProps = {
  playerName?: string;
  onEnter: (playerName: string) => void;
};

type LoginFormState = {
  playerName?: string;
  nameErrorMsg: string;
};

class LobbyLoginForm extends React.Component<LoginFormProps, LoginFormState> {
  static defaultProps = {
    playerName: '',
  };

  state = {
    playerName: this.props.playerName,
    nameErrorMsg: '',
  };

  render() {
    return (
      <div>
        <p className="phase-title">Choose a player name:</p>
        <input
          type="text"
          value={this.state.playerName}
          onChange={this.onChangePlayerName}
          onKeyPress={this.onKeyPress}
        />
        <span className="buttons">
          <button className="buttons" onClick={this.onClickEnter}>
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

  onClickEnter = () => {
    if (this.state.playerName === '') return;
    this.props.onEnter(this.state.playerName);
  };

  onKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      this.onClickEnter();
    }
  };

  onChangePlayerName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value.trim();
    this.setState({
      playerName: name,
      nameErrorMsg: name.length > 0 ? '' : 'empty player name',
    });
  };
}

export default LobbyLoginForm;
