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
import { GameLog } from '../log/log';
import { restore } from '../../core/action-creators';
import './debug.css';

/*
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

/*
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
  };

  assignShortcuts() {
    const taken = {
      s: true,
      r: true,
      d: true,
      l: true,
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

          <KeyboardShortcut value="s" onPress={this.saveState}>
            save localStorage
          </KeyboardShortcut>

          <KeyboardShortcut value="r" onPress={this.restoreState}>
            restore localStorage
          </KeyboardShortcut>
        </span>
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

            <h3>players</h3>
            <div className="player-box">{players}</div>

            <h3>moves</h3>

            <section>{moves}</section>

            <h3>events</h3>

            <section>{events}</section>

            <h3>state</h3>

            <section>
              <pre>
                <strong>G</strong>:{' '}
                {JSON.stringify(this.props.gamestate.G, null, 2)}
              </pre>
            </section>

            <section>
              <pre>
                <strong>ctx</strong>:{' '}
                {JSON.stringify(this.props.gamestate.ctx, null, 2)}
              </pre>
            </section>
          </span>
        )}

        {this.state.showLog && (
          <section>
            <GameLog store={this.props.store} />
          </section>
        )}
      </div>
    );
  }
}
