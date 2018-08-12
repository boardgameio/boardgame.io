/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { KeyboardShortcut } from './keyboard-shortcut';

/**
 * Controls that are triggered by keyboard shortcuts.
 */
export const Controls = props => {
  let ai = null;

  if (props.step) {
    ai = [
      <KeyboardShortcut key="4" value="4" onPress={props.step}>
        step
      </KeyboardShortcut>,

      <KeyboardShortcut key="5" value="5" onPress={props.simulate}>
        simulate
      </KeyboardShortcut>,
    ];
  }

  let style = null;
  let className = 'controls';
  if (props.dockTop) {
    className += ' docktop';
  }
  if (props.help) {
    className += ' help';
  }

  const display = props.help && !props.dockTop ? 'block' : 'none';

  return (
    <section id="debug-controls" style={style} className={className}>
      <KeyboardShortcut value="1" onPress={props.reset}>
        reset
      </KeyboardShortcut>

      <KeyboardShortcut value="2" onPress={props.save}>
        save
      </KeyboardShortcut>

      <KeyboardShortcut value="3" onPress={props.restore}>
        restore
      </KeyboardShortcut>

      {ai}

      {props.dockTop || (
        <KeyboardShortcut value="?" onPress={props.toggleHelp}>
          show more
        </KeyboardShortcut>
      )}

      <div className="key" style={{ display }}>
        <div className="key-box">d</div> show/hide this pane
      </div>

      <div className="key" style={{ display }}>
        <div className="key-box">l</div> show/hide log
      </div>

      <div className="key" style={{ display }}>
        <div className="key-box">i</div> show/hide game info tab
      </div>

      <div className="key" style={{ display }}>
        <div className="key-box">t</div> dock controls
      </div>
    </section>
  );
};

Controls.propTypes = {
  help: PropTypes.bool,
  toggleHelp: PropTypes.func,
  step: PropTypes.func,
  simulate: PropTypes.func,
  reset: PropTypes.func,
  save: PropTypes.func,
  restore: PropTypes.func,
  dockTop: PropTypes.bool,
};
