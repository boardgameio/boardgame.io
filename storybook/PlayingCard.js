import React from 'react';
import PropTypes from 'prop-types';

const standardDeck = [];
const suits = ['♠', '♦', '♣', '♥'];
const values = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
];

suits.forEach(suit => {
  values.forEach(value => {
    standardDeck.push({
      suit,
      value,
    });
  });
});

const PlayingCard = ({ suit, value }) => (
  <div
    style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: suit === '♥' || suit === '♦' ? 'red' : 'black',
    }}
  >
    <div
      style={{
        position: 'absolute',
        display: 'flex',
        top: '8px',
        left: '8px',
      }}
    >
      <div style={{ position: 'relative' }}>{value}</div>
      <div style={{ position: 'relative' }}>{suit}</div>
    </div>
    <div
      style={{
        display: 'flex',
        fontSize: '64px',
      }}
    >
      {value}
    </div>
    <div
      style={{
        position: 'absolute',
        display: 'flex',
        bottom: '8px',
        right: '8px',
        transform: 'rotate(180deg)',
      }}
    >
      <div style={{ position: 'relative' }}>{value}</div>
      <div style={{ position: 'relative' }}>{suit}</div>
    </div>
    <div
      style={{
        position: 'absolute',
        display: 'flex',
      }}
    >
      <div
        style={{
          position: 'relative',
          fontSize: '128px',
          color: suit === '♥' || suit === '♦' ? 'red' : 'black',
          opacity: '0.2',
        }}
      >
        {suit}
      </div>
    </div>
  </div>
);

PlayingCard.propTypes = {
  suit: PropTypes.string,
  value: PropTypes.string,
};

export { standardDeck, PlayingCard };
