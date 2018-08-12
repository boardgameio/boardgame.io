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
    selected: null,
    instances: [],
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
      if (this.state.selected === i) {
        className = 'active';
      }
      game_rows.push(
        <tr key={'gline-' + i}>
          <td
            key={'gcell-' + i}
            className={className}
            onClick={() => this.onSelectGame(i)}
          >
            {this.state.games[i]}
          </td>
        </tr>
      );
    }
    // list of game instances
    let inst_rows = [];
    for (let i = 0; i < this.state.instances.length; i++) {
      inst_rows.push(
        <tr key={'iline-' + i}>
          <td key={'icell-' + i}>{this.state.instances[i]}</td>
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
              <button onClick={() => this.onCreateGame()}>Create</button>
            </div>
          </div>
          <div id="instances">
            <table>
              <tbody>{inst_rows}</tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  onSelectGame(selected) {
    // request list of game instances
    fetch(this.baseUrl() + '/' + this.state.games[selected])
      .then(resp => {
        return resp.json();
      })
      .then(json => {
        this.setState({
          ...this.state,
          selected: selected,
          instances: json.game_instances.map(i => {
            return i.game_id + ':' + i.players.length + ' players';
          }),
        });
      })
      .catch(ex => {
        console.log('error', ex);
      });
  }

  onCreateGame() {
    if (this.state.selected == null) return;
    // request new game instance
    fetch(
      this.baseUrl() + '/' + this.state.games[this.state.selected] + '/create',
      {
        method: 'POST',
        body: { numPlayers: 2 },
      }
    )
      .then(resp => {
        return resp.json();
      })
      .then(() => {
        // update list of instances
        this.onSelectGame(this.state.selected);
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
