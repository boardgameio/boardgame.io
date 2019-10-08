import React from 'react';
import ReactDOM from 'react-dom';
import { Client } from 'boardgame.io/react';

function militia(G, ctx) {
  ctx.events.setActivePlayers({ others: 'discard', moveLimit: 1 });
}

function discard(G, ctx) {}

const game = {
  moves: { militia },
  turn: {
    stages: {
      discard: {
        moves: { discard },
      },
    },
  },
};

function Board(props) {
  const { playerID, isActive, ctx } = props;
  let c = 'client';
  if (isActive) {
    c += ' active';
  }

  let move = null;
  let endTurn = null;

  if (isActive) {
    move = (
      <li>
        <button onClick={props.moves.militia}>
          Play Card
        </button>
      </li>
    );

    endTurn = (
      <li>
        <button onClick={() => props.events.endTurn()}>
          End Turn
        </button>
      </li>
    );

    if (ctx.activePlayers && ctx.activePlayers[playerID] == 'discard') {
      move = (
        <li>
          <button onClick={props.moves.discard}>
            Discard
          </button>
        </li>
      );

      endTurn = null;
    }
  }

  return (
    <div className={c}>
      <li>
        <strong>Player {playerID}</strong>
      </li>
      {move}
      {endTurn}
    </div>
  );
}

const Player = Client({
  game,
  board: Board,
  debug: false,
  numPlayers: 3,
  multiplayer: { local: true },
});

const App = () => (
  <div>
    <div className="container">
      <Player playerID="0" />
      <Player playerID="1" />
      <Player playerID="2" />
    </div>
  </div>
);

ReactDOM.render(<App />, document.getElementById('app'));
