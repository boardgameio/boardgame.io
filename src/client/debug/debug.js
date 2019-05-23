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
import { AssignShortcuts } from './assign-shortcuts';
import { GameInfo } from './gameinfo';
import { Controls } from './controls';
import { PlayerInfo } from './playerinfo';
import { DebugMove } from './debug-move';
import { GameLog } from '../log/log';
import { sync } from '../../core/action-creators';
import { parse, stringify } from 'flatted';
import './debug.css';

/**
 * Removes all the keys in ctx that begin with a _.
 */
function SanitizeCtx(ctx) {
  let r = {};
  for (const key in ctx) {
    if (!key.startsWith('_')) {
      r[key] = ctx[key];
    }
  }
  return r;
}

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
      isActive: PropTypes.bool,
      isConnected: PropTypes.bool,
      _initial: PropTypes.any.isRequired,
    }),
    gameID: PropTypes.string.isRequired,
    playerID: PropTypes.string,
    isMultiplayer: PropTypes.bool,
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
    updateGameID: PropTypes.func,
    updatePlayerID: PropTypes.func,
    updateCredentials: PropTypes.func,
    showGameInfo: PropTypes.bool,
    dockControls: PropTypes.bool,
  };

  static defaultProps = {
    showGameInfo: true,
    dockControls: false,
  };

  constructor(props) {
    super(props);
    this.shortcuts = AssignShortcuts(props.moves, props.events, 'dlit');

    this.state = {
      showDebugUI: true,
      showLog: false,
      showGameInfo: props.showGameInfo,
      dockControls: props.dockControls,
      help: false,
      AIMetadata: null,
    };
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

    Mousetrap.bind('i', e => {
      e.preventDefault();
      this.setState(old => ({ showGameInfo: !old.showGameInfo }));
    });

    Mousetrap.bind('t', e => {
      e.preventDefault();
      this.setState(old => ({ dockControls: !old.dockControls }));
    });
  }

  componentWillUnmount() {
    Mousetrap.unbind('d');
    Mousetrap.unbind('l');
  }

  saveState = () => {
    const json = stringify(this.props.gamestate);
    window.localStorage.setItem('gamestate', json);
  };

  restoreState = () => {
    const gamestateJSON = window.localStorage.getItem('gamestate');
    if (gamestateJSON !== null) {
      const gamestate = parse(gamestateJSON);
      this.props.store.dispatch(sync(gamestate));
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

  simulate = (iterations = 10000, sleepTimeout = 100) => {
    const step = async () => {
      for (let i = 0; i < iterations; i++) {
        const action = await this.props.step();
        if (!action) break;
        await new Promise(resolve => setTimeout(resolve, sleepTimeout));
      }
    };

    return step();
  };

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

    const visualizeAI = this.state.AIMetadata && this.props.visualizeAI;
    let className = 'debug-ui';

    if (this.state.dockControls) {
      className += ' docktop';
    }

    return (
      <div className={className}>
        {visualizeAI && (
          <div className="ai-visualization">
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
              {this.state.showGameInfo && (
                <GameInfo
                  gameID={this.props.gameID}
                  playerID={this.props.playerID}
                  isActive={this.props.gamestate.isActive}
                  isConnected={this.props.gamestate.isConnected}
                  isMultiplayer={this.props.isMultiplayer}
                />
              )}

              <Controls
                dockTop={this.state.dockControls}
                help={this.state.help}
                toggleHelp={this.toggleHelp}
                step={this.props.step}
                simulate={this.simulate}
                reset={this.props.reset}
                save={this.saveState}
                restore={this.restoreState}
              />

              <h3>Players</h3>
              <PlayerInfo
                ctx={this.props.gamestate.ctx}
                playerID={this.props.playerID}
                onClick={this.props.updatePlayerID}
              />

              <h3>Moves</h3>

              <section>{moves}</section>

              <h3>Events</h3>

              <section>{events}</section>

              <section>
                <pre className="json">
                  <strong>G</strong>:{' '}
                  {JSON.stringify(this.props.gamestate.G, null, 2)}
                </pre>
              </section>

              <section>
                <pre className="json">
                  <strong>ctx</strong>:{' '}
                  {JSON.stringify(
                    SanitizeCtx(this.props.gamestate.ctx),
                    null,
                    2
                  )}
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
