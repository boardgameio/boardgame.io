/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import type { Game } from '../types';
import type { GameComponent } from './connection';

type CreateMatchProps = {
  games: GameComponent[];
  createMatch: (gameName: string, numPlayers: number) => Promise<void>;
};

type CreateMatchState = {
  selectedGame: number;
  numPlayers: number;
};

class LobbyCreateMatchForm extends React.Component<
  CreateMatchProps,
  CreateMatchState
> {
  state = {
    selectedGame: 0,
    numPlayers: 2,
  };

  constructor(props: CreateMatchProps) {
    super(props);
    /* fix min and max number of players */
    for (const game of props.games) {
      const matchDetails = game.game;
      if (!matchDetails.minPlayers) {
        matchDetails.minPlayers = 1;
      }
      if (!matchDetails.maxPlayers) {
        matchDetails.maxPlayers = 4;
      }
      console.assert(matchDetails.maxPlayers >= matchDetails.minPlayers);
    }
    this.state = {
      selectedGame: 0,
      numPlayers: props.games[0].game.minPlayers,
    };
  }

  _createGameNameOption = (game: GameComponent, idx: number) => {
    return (
      <option key={'name-option-' + idx} value={idx}>
        {game.game.name}
      </option>
    );
  };

  _createNumPlayersOption = (idx: number) => {
    return (
      <option key={'num-option-' + idx} value={idx}>
        {idx}
      </option>
    );
  };

  _createNumPlayersRange = (game: Game) => {
    return Array.from({ length: game.maxPlayers + 1 })
      .map((_, i) => i)
      .slice(game.minPlayers);
  };

  render() {
    return (
      <div>
        <select
          value={this.state.selectedGame}
          onChange={(evt) => this.onChangeSelectedGame(evt)}
        >
          {this.props.games.map((game, index) =>
            this._createGameNameOption(game, index)
          )}
        </select>
        <span>Players:</span>
        <select
          value={this.state.numPlayers}
          onChange={this.onChangeNumPlayers}
        >
          {this._createNumPlayersRange(
            this.props.games[this.state.selectedGame].game
          ).map((number) => this._createNumPlayersOption(number))}
        </select>
        <span className="buttons">
          <button onClick={this.onClickCreate}>Create</button>
        </span>
      </div>
    );
  }

  onChangeNumPlayers = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({
      numPlayers: Number.parseInt(event.target.value),
    });
  };

  onChangeSelectedGame = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = Number.parseInt(event.target.value);
    this.setState({
      selectedGame: idx,
      numPlayers: this.props.games[idx].game.minPlayers,
    });
  };

  onClickCreate = () => {
    this.props.createMatch(
      this.props.games[this.state.selectedGame].game.name,
      this.state.numPlayers
    );
  };
}

export default LobbyCreateMatchForm;
