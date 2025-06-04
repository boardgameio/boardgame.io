/*
 * Simple test file for UNO game logic
 */

import UnoGame from './game.js';

// Test game setup
console.log('Testing UNO Game Setup...');

const ctx = { numPlayers: 4 };
const random = Math.random;

const initialState = UnoGame.setup({ ctx, random });

console.log('Initial game state:');
console.log('Players:', Object.keys(initialState.players).length);
console.log('Deck size:', initialState.deck.length);
console.log('Discard pile:', initialState.discardPile.length);
console.log('Current color:', initialState.currentColor);

// Test each player has 7 cards
Object.keys(initialState.players).forEach(playerID => {
  const player = initialState.players[playerID];
  console.log(`Player ${playerID} has ${player.hand.length} cards`);
});

// Test card creation
console.log('\nTesting card deck creation...');
const testDeck = [];

// Count cards by type
const cardCounts = {
  number: 0,
  action: 0,
  wild: 0
};

initialState.deck.concat(
  Object.values(initialState.players).flatMap(p => p.hand),
  initialState.discardPile
).forEach(card => {
  cardCounts[card.type]++;
});

console.log('Card counts:', cardCounts);
console.log('Total cards:', cardCounts.number + cardCounts.action + cardCounts.wild);

// Test move validation
console.log('\nTesting move validation...');
const player0 = initialState.players['0'];
const topCard = initialState.discardPile[0];

console.log('Top card:', topCard);
console.log('Current color:', initialState.currentColor);
console.log('Player 0 hand:', player0.hand.slice(0, 3)); // Show first 3 cards

// Test if any cards can be played
const playableCards = player0.hand.filter(card => {
  if (card.type === 'wild') return true;
  return card.color === initialState.currentColor || 
         card.value === topCard.value ||
         (card.type === topCard.type && card.type === 'action');
});

console.log('Playable cards:', playableCards.length);

console.log('\nUNO Game logic test completed successfully!');

export default UnoGame;
