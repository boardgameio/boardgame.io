/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import 'whatwg-fetch';
import React from 'react';
import PropTypes from 'prop-types';
import './lobby.css';

class Lobby extends React.Component {
  static propTypes = {
    server: PropTypes.string.isRequired,
    port: PropTypes.string.isRequired,
  };

  state = {
    phase: 'enter', // may be 'enter','join','play'
    playerName: '',
    nameErrorMsg: 'empty player name',
    games: [],
    selectedGame: null,
    gamesErrorMsg: 'no game selected',
    instances: [],
    selectedInstance: null,
    instancesErrorMsg: ' ',
  };

  baseUrl() {
    return 'http://' + this.props.server + ':' + this.props.port + '/games';
  }

  componentDidMount() {}

  render() {
    // list of games
    let game_rows = [];
    for (let i = 0; i < this.state.games.length; i++) {
      let className = '';
      if (this.state.selectedGame === i) {
        className = 'active';
      }
      game_rows.push(
        <tr key={'gline-' + i}>
          <td
            key={'gcell-' + i}
            className={className}
            onClick={() => this.onClickGame(i)}
          >
            {this.state.games[i]}
          </td>
        </tr>
      );
    }
    // list of game instances
    let inst_rows = [];
    for (let i = 0; i < this.state.instances.length; i++) {
      let className = '';
      if (this.state.selectedInstance === i) {
        className = 'active';
      }
      const inst = this.state.instances[i];
      inst_rows.push(
        <tr key={'iline-' + i}>
          <td
            key={'icell-' + i}
            className={className}
            onClick={() => this.onClickInstance(i)}
          >{`[${inst.game_id}] ${inst.players.length} players`}</td>
        </tr>
      );
    }

    const getPhaseVisibility = phase => {
      return this.state.phase !== phase ? 'hidden' : 'phase';
    };
    return (
      <div id="lobby-view" style={{ padding: 50 }}>
        <h1>Lobby</h1>
        <div id="name" className={getPhaseVisibility('enter')}>
          <p className="phase-title">Choose a player name:</p>
          <input
            type="Text"
            value={this.state.playerName}
            onChange={evt => this.onChangePlayerName(evt)}
            onKeyPress={evt => this.onKeyPress(evt)}
          />
          <span className="buttons">
            <button className="buttons" onClick={() => this.onClickEnter()}>
              Enter
            </button>
          </span>
          <p id="name-error" className="error-msg">
            {this.state.nameErrorMsg}
          </p>
        </div>
        <div id="games" className={getPhaseVisibility('join')}>
          <p className="phase-title">Select a game:</p>
          <table>
            <tbody>{game_rows}</tbody>
          </table>
          <p id="games-error" className="error-msg">
            {this.state.gamesErrorMsg}
          </p>
        </div>
        <div id="instances" className={getPhaseVisibility('join')}>
          <p className="phase-title">Select or create an instance:</p>
          <div id="instances-table">
            <table>
              <tbody>{inst_rows}</tbody>
            </table>
          </div>
          <div className="buttons">
            <button onClick={() => this.onClickJoin()}>Join</button>
            <button onClick={() => this.onClickCreate()}>Create</button>
          </div>
          <p id="instances-error" className="error-msg">
            {this.state.instancesErrorMsg}
          </p>
        </div>
        <div id="board" className={getPhaseVisibility('play')} />
      </div>
    );
  }

  onKeyPress(event) {
    if (this.state.phase === 'enter' && event.key === 'Enter') {
      this.onClickEnter();
    }
  }

  onChangePlayerName(event) {
    const name = event.target.value.trim();
    this.setState({
      ...this.state,
      playerName: name,
      nameErrorMsg: name.length ? ' ' : 'empty name',
    });
  }

  onClickEnter() {
    if (this.state.playerName === '') return;
    // fetch list of games
    fetch(this.baseUrl())
      .then(resp => {
        return resp.json();
      })
      .then(json => {
        this.setState({
          ...this.state,
          games: json,
          phase: 'join',
        });
      })
      .catch(ex => {
        console.log('error', ex);
        this.setState({
          ...this.state,
          nameErrorMsg: 'failed to retrieve list of games (' + ex + ')',
        });
      });
  }

  onClickGame(selected) {
    // request list of game instances
    fetch(this.baseUrl() + '/' + this.state.games[selected])
      .then(resp => {
        return resp.json();
      })
      .then(json => {
        this.setState({
          ...this.state,
          selectedGame: selected,
          gamesErrorMsg: selected === null ? 'no game selected' : ' ',
          selectedInstance: null,
          instances: json.game_instances,
          instancesErrorMsg: json.game_instances.length
            ? ' '
            : 'no instance for this game',
        });
      })
      .catch(ex => {
        console.log('error', ex);
        this.setState({
          ...this.state,
          gamesErrorMsg: 'failed to retrieve instances (' + ex + ')',
        });
      });
  }

  onClickInstance(selected) {
    if (selected == this.state.selectedInstance) return;
    this.setState({
      ...this.state,
      selectedInstance: selected,
    });
  }

  onClickCreate() {
    if (this.state.selectedGame == null) return;
    // request new game instance
    fetch(
      this.baseUrl() +
        '/' +
        this.state.games[this.state.selectedGame] +
        '/create',
      {
        method: 'POST',
        body: JSON.stringify({ numPlayers: 2 }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
      .then(resp => {
        return resp.json();
      })
      .then(() => {
        // update list of instances
        this.onClickGame(this.state.selectedGame);
      })
      .catch(ex => {
        console.log('error', ex);
      });
  }

  onClickJoin() {
    if (this.state.selectedInstance == null) return;
    // join game instance
    fetch(
      this.baseUrl() +
        '/' +
        this.state.games[this.state.selectedGame] +
        '/' +
        this.state.instances[this.state.selectedInstance].game_id +
        '/join',
      {
        method: 'POST',
        body: JSON.stringify({
          playerID: '0',
          playerName: this.state.playerName,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
      .then(resp => {
        return resp.json();
      })
      .then(json => {
        // credentials
        console.log(json.credentials);
      })
      .catch(ex => {
        console.log('error', ex);
        this.setState({
          ...this.state,
          instancesErrorMsg: 'failed to join game (' + ex + ')',
        });
      });
  }
}

const LobbyView = () => (
  <div style={{ padding: 50 }}>
    <Lobby server="localhost" port="8001" />
  </div>
);

export default LobbyView;
