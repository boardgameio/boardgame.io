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
    games: [],
    instances: [],
    selectedGame: null,
    selectedInstance: null,
  };

  baseUrl() {
    return 'http://' + this.props.server + ':' + this.props.port + '/games';
  }

  componentDidMount() {
    // fetch list of games
    fetch(this.baseUrl())
      .then(resp => {
        return resp.json();
      })
      .then(json => {
        this.setState({ games: json });
      })
      .catch(ex => {
        console.log('error', ex);
      });
  }

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
    return (
      <div style={{ padding: 50 }}>
        <h1>Select a game and create a new instance:</h1>
        <div id="lists">
          <div id="games">
            <table>
              <tbody>{game_rows}</tbody>
            </table>
            <div className="buttons">
              <button onClick={() => this.onClickCreate()}>Create</button>
            </div>
          </div>
          <div id="instances">
            <table>
              <tbody>{inst_rows}</tbody>
            </table>
            <div className="buttons">
              <button onClick={() => this.onClickJoin()}>Join</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  onClickGame(selected) {
    if (selected == this.state.selectedGame) return;
    // request list of game instances
    fetch(this.baseUrl() + '/' + this.state.games[selected])
      .then(resp => {
        return resp.json();
      })
      .then(json => {
        this.setState({
          ...this.state,
          selectedGame: selected,
          selectedInstance: null,
          instances: json.game_instances,
        });
      })
      .catch(ex => {
        console.log('error', ex);
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
          playerName: 'Toto',
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
      });
  }
}

const LobbyView = () => (
  <div style={{ padding: 50 }}>
    <Lobby server="localhost" port="8001" />
  </div>
);

export default LobbyView;
