import React from 'react';
import ReactDOM from 'react-dom';
import { Client } from 'boardgame.io/react';

function DrawCard(G, ctx) {
  G.deck--;
  G.hand[ctx.currentPlayer]++;
}

function PlayCard(G, ctx) {
  G.deck++;
  G.hand[ctx.currentPlayer]--;
}

const game = {
  setup: ctx => ({ deck: 6, hand: Array(ctx.numPlayers).fill(0) }),
  phases: {
    draw: {
      moves: { DrawCard },
      endIf: G => G.deck <= 0,
      start: true,
      next: 'play',
    },
    play: {
      moves: { PlayCard },
    },
  },
  turn: { moveLimit: 1 },
};

const Deck = ({ G, ctx }) => (
  <div className="deck">
    <div>{G.deck}</div>
    <div>cards</div>
    <div style={{ fontSize: '1.2em', marginTop: 20, color: '#aaa' }}>
      {ctx.phase}
    </div>
  </div>
);

function Board(props) {
  function drawCard() {
    props.moves.DrawCard();
  }

  function playCard() {
    props.moves.PlayCard();
  }

  const { playerID, isActive } = props;
  if (!playerID) return <Deck {...props} />;
  let c = 'client';
  if (isActive) {
    c += ' active';
  }
  return (
    <div className={c}>
      <li>
        <strong>Player {playerID}</strong>
      </li>
      <li>{props.G.hand[playerID]} cards</li>
      <li>
        <button id="take" onClick={drawCard}>
          Draw Card
        </button>
      </li>
      <li>
        <button id="play" onClick={playCard}>
          Play Card
        </button>
      </li>
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
    <div style={{ width: '100%' }}>
      <Player />
    </div>
    <div className="container">
      <Player playerID="0" />
      <Player playerID="1" />
      <Player playerID="2" />
    </div>
  </div>
);

ReactDOM.render(<App />, document.getElementById('app'));
