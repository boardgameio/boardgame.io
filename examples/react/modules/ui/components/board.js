/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { UI, Card, Deck } from 'boardgame.io/ui';

function handler(type, fn) {
  return arg => {
    console.log(type + ': ' + JSON.stringify(arg));
    if (fn) fn(arg);
  };
}

class Board extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      deck1: [1, 2, 3],
      deck2: [],
      free: [4],
    };
  }

  deck1Drop = arg => {
    this.setState(s => ({
      free: s.free.filter(t => t != arg),
      deck2: s.deck2.filter(t => t != arg),
      deck1: [...s.deck1.filter(t => t != arg), arg],
    }));
  };

  deck2Drop = arg => {
    this.setState(s => ({
      free: s.free.filter(t => t != arg),
      deck1: s.deck1.filter(t => t != arg),
      deck2: [...s.deck2.filter(t => t != arg), arg],
    }));
  };

  render() {
    return (
      <UI sandboxMode={true}>
        <Deck
          onDrop={handler('deck1 onDrop', this.deck1Drop)}
          onClick={handler('deck1 onClick')}
          onRemove={handler('deck1 onRemove', this.deck1Remove)}
        >
          {this.state.deck1.map(c => (
            <Card key={c} data={c} back={c} onClick={handler(c + ' onClick')} />
          ))}
        </Deck>

        <Deck
          onDrop={handler('deck2 onDrop', this.deck2Drop)}
          onClick={handler('deck2 onClick')}
          onRemove={handler('deck2 onRemove', this.deck2Remove)}
        >
          {this.state.deck2.map(c => (
            <Card key={c} data={c} back={c} onClick={handler(c + ' onClick')} />
          ))}
        </Deck>

        <div>
          {this.state.free.map(c => (
            <Card key={c} data={c} back={c} onClick={handler(c + ' onClick')} />
          ))}
        </div>
      </UI>
    );
  }
}

export default Board;
