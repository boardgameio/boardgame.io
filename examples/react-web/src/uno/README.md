# UNO Game for boardgame.io

A complete implementation of the UNO card game using the boardgame.io framework.

## Features

- **Complete UNO Rules**: All standard UNO rules implemented including special cards
- **Multiplayer Support**: 2-10 players supported
- **UNO Calling**: Players must say "UNO" when they have one card left
- **Special Cards**: Skip, Reverse, Draw Two, Wild, and Wild Draw Four cards
- **Card Matching**: Match by color, number, or action type
- **Turn Management**: Automatic turn progression with direction changes
- **Player View**: Hidden information - players can only see their own cards

## Game Components

### Files Structure
```
uno/
├── game.js      # Core game logic and rules
├── board.js     # React UI components
├── board.css    # Styling for the game interface
├── index.js     # Game entry point and lobby
├── test.js      # Simple test file
└── README.md    # This file
```

### Game Logic (game.js)
- **Card Deck**: 108 cards total (76 number cards, 24 action cards, 8 wild cards)
- **Game Setup**: Deals 7 cards to each player, sets up deck and discard pile
- **Moves**: playCard, chooseColor, drawCard, sayUno, callUno
- **Special Effects**: Automatic handling of skip, reverse, and draw effects
- **Win Condition**: First player to empty their hand wins

### User Interface (board.js)
- **Card Display**: Visual representation of cards with colors and symbols
- **Player Information**: Shows card counts and UNO status for all players
- **Game Controls**: Click to play cards, draw cards, say UNO, call UNO on others
- **Color Selector**: Modal for choosing wild card colors
- **Turn Indicator**: Shows whose turn it is and game direction

### Styling (board.css)
- **Responsive Design**: Works on desktop and mobile devices
- **Card Animations**: Hover effects and selection feedback
- **Color Themes**: Proper UNO colors (red, blue, green, yellow)
- **Game Layout**: Organized layout with player areas and game center

## How to Play

1. **Starting**: Each player gets 7 cards, one card is placed in the discard pile
2. **Playing**: Match the top card by color, number, or action type
3. **Special Cards**:
   - **Skip (⊘)**: Next player loses their turn
   - **Reverse (⇄)**: Changes direction of play
   - **Draw Two (+2)**: Next player draws 2 cards and loses turn
   - **Wild (W)**: Can be played anytime, player chooses new color
   - **Wild Draw Four (+4)**: Like wild but next player draws 4 cards
4. **UNO Rule**: Say "UNO" when you have one card left
5. **Calling UNO**: Other players can call you out if you forget to say UNO
6. **Winning**: First player to play all cards wins

## Game Modes

### Local Game (Hot Seat)
- Multiple players take turns on the same device
- Good for testing and family play
- All players can see the game state

### Online Multiplayer
- Players connect from different devices
- Real-time synchronization
- Hidden information properly maintained

## Usage in boardgame.io App

The UNO game is integrated into the main boardgame.io examples app:

1. Navigate to the UNO section in the app
2. Choose between Lobby, Singleplayer, or Multiplayer
3. Configure game settings (number of players, etc.)
4. Start playing!

## Technical Details

### Game State
```javascript
{
  players: {
    '0': { hand: [...], saidUno: false, canCallUno: false },
    '1': { hand: [...], saidUno: false, canCallUno: false },
    // ...
  },
  deck: [...],           // Remaining cards to draw
  discardPile: [...],    // Played cards
  currentColor: 'red',   // Current active color
  direction: 1,          // 1 = clockwise, -1 = counter-clockwise
  drawCount: 0,          // Pending cards to draw from +2/+4
  mustChooseColor: false,// Waiting for wild card color choice
  lastPlayedCard: null   // Last card played (for skip effects)
}
```

### Card Structure
```javascript
{
  color: 'red' | 'blue' | 'green' | 'yellow' | null,
  type: 'number' | 'action' | 'wild',
  value: 0-9 | 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild_draw4'
}
```

## Development

To test the game logic:
```javascript
import UnoGame from './game.js';
// Run test.js to verify game setup and basic functionality
```

To run the full game:
1. Start the boardgame.io examples server
2. Navigate to the UNO section
3. Choose your preferred game mode

## Future Enhancements

- **Scoring System**: Implement point-based scoring across multiple rounds
- **House Rules**: Optional rules like stacking +2/+4 cards
- **AI Players**: Computer opponents with different difficulty levels
- **Animations**: Card dealing and playing animations
- **Sound Effects**: Audio feedback for game events
- **Statistics**: Track wins, games played, etc.
- **Custom Decks**: Different card designs and themes

## Contributing

Feel free to contribute improvements to the UNO implementation:
- Bug fixes and optimizations
- UI/UX improvements
- Additional features and game modes
- Better mobile responsiveness
- Accessibility improvements
