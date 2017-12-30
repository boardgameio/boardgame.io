/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import ReactJson from 'react-json-view';
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
    fn: PropTypes.func.isRequired,
    active: PropTypes.bool,
    activate: PropTypes.func,
    deactivate: PropTypes.func
  }

  state = {
    error: ''
  }

  onClick = () => {
    this.props.activate();
  }

  getArg(arg) {
    try {
      return new Function('return ' + arg)();
    } catch (e) {
      return undefined;
    }
  }

  onSubmit = () => {
    let argArray = [];
    const value = this.span.innerText;

    if (value && value.length) {
      const args = value.split(",");
      for (const arg of args) {
        argArray.push(this.getArg(arg));
      }
    }

    this.props.fn.apply(this, argArray);

    this.setState({
      error: '',
      focus: false,
      enterArg: false
    });

    this.span.innerText = '';

    if (this.props.deactivate) {
      this.props.deactivate();
    }
  }

  onKeyDown = (e) => {
    if (e.key == 'Enter') {
      e.preventDefault();
      this.onSubmit();
    }

    if (e.key == 'Escape') {
      e.preventDefault();
      this.props.deactivate();
    }
  }

  componentDidUpdate() {
    if (this.props.active) {
      this.span.focus();
    } else {
      this.span.blur();
    }
  }

  render() {
    let className = 'move';
    if (this.props.active) className += ' active';
    return (
      <div className={className} onClick={this.onClick}>
        {this.props.name}
        (<span ref={r => { this.span = r }}
               className='arg-field'
               onBlur={() => this.props.deactivate()}
               onKeyDown={this.onKeyDown}
               contentEditable></span>)
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
    onPress: PropTypes.func
  }

  state = {
    active: false
  }

  deactivate = () => {
    this.setState({ active: false });
  }

  activate = () => {
    this.setState({ active: true });
    if (this.props.onPress) {
      this.props.onPress();
      this.setState({ active: false });
    }
  }

  componentDidMount() {
    Mousetrap.bind(this.props.value, (e) => {
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
      child = React.cloneElement(
          this.props.children, {
            active: this.state.active,
            deactivate: this.deactivate,
            activate: this.activate
          });
    }

    let className = 'key';
    if (this.state.active) {
      className += ' active';
    }

    return (
      <div className={className}>
        <div className='key-box' onClick={this.activate}>
          {this.props.value}
        </div>
        <div className='key-child'>
        {child}
        </div>
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
  static contextTypes = {
    store: PropTypes.any,
  }

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
    game: PropTypes.any,
    restore: PropTypes.func,
    showLog: PropTypes.bool,
  }

  constructor(props) {
    super(props);
    this.assignShortcuts();
  }

  componentDidMount() {
    Mousetrap.bind('d', (e) => {
      e.preventDefault();
      this.setState(old => ({ showDebugUI: !old.showDebugUI }));
    });

    Mousetrap.bind('l', (e) => {
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
  }

  assignShortcuts() {
    const taken = {
      's': true,
      'r': true,
      'd': true,
      'l': true,
    };
    this.shortcuts = null;

    const events = {};
    for (let name in this.props.moves) {
      events[name] = name;
    }
    for (let name in this.props.game) {
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
  }

  restoreState = () => {
    const gamestateJSON =
        window.localStorage.getItem('gamestate');
    if (gamestateJSON !== null) {
      const gamestate = JSON.parse(gamestateJSON);
      this.context.store.dispatch(restore(gamestate));
    }
  }

  onClickMain = () => {
    this.setState({ showLog: false });
  }

  onClickLog = () => {
    this.setState({ showLog: true });
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
        <KeyboardShortcut key={name} value={shortcut}>
          <DebugMove name={name} fn={fn} />
        </KeyboardShortcut>
      );
    }

    let events = [];
    for (let name in this.props.game) {
      const fn = this.props.game[name];
      const shortcut = this.shortcuts[name];
      events.push(
        <KeyboardShortcut key={name} value={shortcut}>
          <DebugMove name={name} fn={fn} />
        </KeyboardShortcut>
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
      <div className='debug-ui'>

      <div className='menu'>
        <div className={this.state.showLog ? 'item' : 'item active'} onClick={this.onClickMain}>Main</div>
        <div className={this.state.showLog ? 'item active' : 'item'} onClick={this.onClickLog}>Log</div>
      </div>

      {this.state.showLog ||
        <span>
        <section>
        <div><strong>Game ID:</strong> {this.props.gameID}</div>
        </section>

        <section>
          <div className='key'>
          <div className='key-box'>d</div> toggle Debug UI
          </div>

          <div className='key'>
          <div className='key-box'>l</div> toggle Log
          </div>

          <KeyboardShortcut value='s' onPress={this.saveState}>
            save localStorage
          </KeyboardShortcut>

          <KeyboardShortcut value='r' onPress={this.restoreState}>
            restore localStorage
          </KeyboardShortcut>
        </section>

        <h3>players</h3>
        <div className='player-box'>
        {players}
        </div>

        <h3>actions</h3>

        <section>
        {moves}
        {events}
        </section>

        <h3>state</h3>

        <section>
        <ReactJson src={this.props.gamestate.G}
                   name="G"
                   enableClipboard={false}
                   displayDataTypes={false} />
        </section>

        <section>
        <ReactJson src={this.props.gamestate.ctx}
                   name="ctx"
                   enableClipboard={false}
                   displayDataTypes={false} />
        </section>
        </span>
      }

      {this.state.showLog &&
        <section>
        <GameLog log={this.props.gamestate.log} initialState={this.props.gamestate._initial} />
        </section>
      }

      </div>
    );
  }
}
