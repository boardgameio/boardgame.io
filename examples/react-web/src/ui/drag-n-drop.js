/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { Client } from 'boardgame.io/react';
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
      deck: [],
      free: true,
    };
  }

  onDrop = arg => {
    this.setState(s => ({
      deck: [...s.deck.filter(t => t != arg), arg],
      free: null,
    }));
  };

  render() {
    return (
      <div>
        <div style={{ marginBottom: 20 }}>Drag the card into the deck</div>
        <UI three={true}>
          <Deck
            onDrop={handler('deck onDrop', this.onDrop)}
            onClick={handler('deck onClick')}
          >
            {this.state.deck.map(c => (
              <Card
                key={c}
                data={c}
                back={c}
                onClick={handler('card onClick')}
              />
            ))}
          </Deck>

          {this.state.free && (
            <Card data={1} back={1} onClick={handler('card1 onClick')} />
          )}
        </UI>
      </div>
    );
  }
}

const App = Client({
  game: {},
  board: Board,
  debug: false,
});

const Singleplayer = () => (
  <div style={{ padding: 50 }}>
    <App gameID="single" />
  </div>
);

export default Singleplayer;
