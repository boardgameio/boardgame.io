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
import { DebugMove } from './debug-move';
import { KeyboardShortcut } from './keyboard-shortcut';
import { GameLog } from '../log/log';
import { restore } from '../../core/action-creators';
import './debug.css';

/**
 * Debug
 *
 * Debug pane that displays the game state objects,
 * allows you to dispatch moves,
 * and allows you to save / restore from localStorage.
 */
export class Debug extends React.Component {
  static propTypes = {
    gamestate: PropTypes.shape({
      G: PropTypes.any.isRequired,
      ctx: PropTypes.any.isRequired,
      log: PropTypes.array.isRequired,
      _initial: PropTypes.any.isRequired,
    }),
    gameID: PropTypes.string.isRequired,
    playerID: PropTypes.string,
    moves: PropTypes.any,
    events: PropTypes.any,
    restore: PropTypes.func,
    showLog: PropTypes.bool,
    store: PropTypes.any,
    step: PropTypes.func,
    reset: PropTypes.func,
    reducer: PropTypes.func,
    overrideGameState: PropTypes.func,
    visualizeAI: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.assignShortcuts();
  }

  componentDidMount() {
    Mousetrap.bind('d', e => {
      e.preventDefault();
      this.setState(old => ({ showDebugUI: !old.showDebugUI }));
    });

    Mousetrap.bind('l', e => {
      e.preventDefault();
      this.setState(old => ({ showLog: !old.showLog }));
    });
  }

  componentWillUnmount() {
    Mousetrap.unbind('d');
    Mousetrap.unbind('l');
  }

  state = {
    showDebugUI: true,
    showLog: false,
    help: false,
    AIMetadata: null,
  };

  assignShortcuts() {
    const taken = {
      n: true,
      s: true,
      r: true,
      d: true,
      l: true,
      t: true,
    };
    this.shortcuts = null;

    const events = {};
    for (let name in this.props.moves) {
      events[name] = name;
    }
    for (let name in this.props.events) {
      events[name] = name;
    }

    // Try assigning the first char of each move as the shortcut.
    let t = taken;
    let shortcuts = {};
    let canUseFirstChar = true;
    for (let name in events) {
      let shortcut = name[0];
      if (t[shortcut]) {
        canUseFirstChar = false;
        break;
      }

      t[shortcut] = true;
      shortcuts[name] = shortcut;
    }
    if (canUseFirstChar) {
      this.shortcuts = shortcuts;
    }

    // If those aren't unique, use a-z.
    if (this.shortcuts == null) {
      let t = taken;
      let next = 97;
      let shortcuts = {};
      for (let name in events) {
        let shortcut = String.fromCharCode(next);

        while (t[shortcut]) {
          next++;
          shortcut = String.fromCharCode(next);
        }

        t[shortcut] = true;
        shortcuts[name] = shortcut;
      }

      this.shortcuts = shortcuts;
    }
  }

  saveState = () => {
    const json = JSON.stringify(this.props.gamestate);
    window.localStorage.setItem('gamestate', json);
  };

  restoreState = () => {
    const gamestateJSON = window.localStorage.getItem('gamestate');
    if (gamestateJSON !== null) {
      const gamestate = JSON.parse(gamestateJSON);
      this.props.store.dispatch(restore(gamestate));
    }
  };

  onClickMain = () => {
    this.setState({ showLog: false });
  };

  onClickLog = () => {
    this.setState({ showLog: true });
  };

  toggleHelp = () => {
    this.setState(oldstate => ({ help: !oldstate.help }));
  };

  onLogHover = ({ state, metadata }) => {
    this.setState({ AIMetadata: metadata });
    this.props.overrideGameState(state);
  };

  renderHelp() {
    const display = this.state.help ? 'block' : 'none';

    return (
      <section>
        <KeyboardShortcut value="?" onPress={this.toggleHelp}>
          help
        </KeyboardShortcut>

        <span style={{ display }}>
          <div className="key">
            <div className="key-box">d</div> toggle Debug UI
          </div>

          <div className="key">
            <div className="key-box">l</div> toggle Log
          </div>
        </span>
      </section>
    );
  }

  simulate = (iterations = 10000, sleepTimeout = 100) => {
    const step = () => {
      const action = this.props.step();
      if (action && iterations > 1) {
        iterations--;
        setTimeout(step, sleepTimeout);
      }
    };

    step();
  };

  renderControls() {
    let ai = null;

    if (this.props.step) {
      ai = [
        <KeyboardShortcut key="4" value="4" onPress={this.props.step}>
          step
        </KeyboardShortcut>,

        <KeyboardShortcut key="5" value="5" onPress={this.simulate}>
          simulate
        </KeyboardShortcut>,
      ];
    }

    return (
      <section className="controls">
        <h3>Controls</h3>

        <KeyboardShortcut value="1" onPress={this.props.reset}>
          reset
        </KeyboardShortcut>

        <KeyboardShortcut value="2" onPress={this.saveState}>
          save
        </KeyboardShortcut>

        <KeyboardShortcut value="3" onPress={this.restoreState}>
          restore
        </KeyboardShortcut>

        {ai}
      </section>
    );
  }

  render() {
    if (!this.state.showDebugUI) {
      return null;
    }

    let moves = [];
    for (let name in this.props.moves) {
      const fn = this.props.moves[name];
      const shortcut = this.shortcuts[name];
      moves.push(
        <DebugMove key={name} name={name} fn={fn} shortcut={shortcut} />
      );
    }

    let events = [];
    for (let name in this.props.events) {
      const fn = this.props.events[name];
      const shortcut = this.shortcuts[name];
      events.push(
        <DebugMove key={name} name={name} fn={fn} shortcut={shortcut} />
      );
    }

    let players = [];
    for (let i = 0; i < this.props.gamestate.ctx.numPlayers; i++) {
      let className = 'player active';
      if (i != this.props.gamestate.ctx.currentPlayer) {
        className = 'player';
      }
      players.push(
        <div className={className} key={i}>
          {i}
        </div>
      );
    }

    return (
      <div className="debug-ui">
        {this.state.AIMetadata && (
          <div className="pane" style={{ maxWidth: '3000px' }}>
            {this.props.visualizeAI(this.state.AIMetadata)}
          </div>
        )}

        <div className="pane">
          <div className="menu">
            <div
              className={this.state.showLog ? 'item' : 'item active'}
              onClick={this.onClickMain}
            >
              Main
            </div>
            <div
              className={this.state.showLog ? 'item active' : 'item'}
              onClick={this.onClickLog}
            >
              Log
            </div>
          </div>

          {this.state.showLog || (
            <span>
              <section>
                <div>
                  <strong>Game ID:</strong> {this.props.gameID}
                </div>
              </section>

              {this.renderHelp()}
              {this.renderControls()}

              <h3>Players</h3>
              <div className="player-box">{players}</div>

              <h3>Moves</h3>

              <section>{moves}</section>

              <h3>Events</h3>

              <section>{events}</section>

              <h3>State</h3>

              <section>
                <pre className="json">
                  <strong>ctx</strong>:{' '}
                  {JSON.stringify(this.props.gamestate.ctx, null, 2)}
                </pre>
              </section>

              <section>
                <pre className="json">
                  <strong>G</strong>:{' '}
                  {JSON.stringify(this.props.gamestate.G, null, 2)}
                </pre>
              </section>
            </span>
          )}

          {this.state.showLog && (
            <section>
              <GameLog
                onHover={this.onLogHover}
                reducer={this.props.reducer}
                log={this.props.gamestate.log}
                initialState={this.props.gamestate._initial}
              />
            </section>
          )}
        </div>
      </div>
    );
  }
}
