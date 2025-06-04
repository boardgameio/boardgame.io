/*
 * UNO游戏实现 - 基于boardgame.io框架
 *
 * 此文件包含UNO卡牌游戏的核心逻辑
 */

// 卡牌类型和颜色定义
const COLORS = ['red', 'blue', 'green', 'yellow'];
const COLOR_NAMES = {
  red: '红色',
  blue: '蓝色',
  green: '绿色',
  yellow: '黄色'
};

const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const ACTION_CARDS = ['skip', 'reverse', 'draw2'];
const ACTION_NAMES = {
  skip: '跳过',
  reverse: '反转',
  draw2: '罚抽2张'
};

const WILD_CARDS = ['wild', 'wild_draw4'];
const WILD_NAMES = {
  wild: '万能牌',
  wild_draw4: '万能+4'
};

// Create a standard UNO deck (108 cards)
function createDeck() {
  const deck = [];
  
  // Number cards (76 cards)
  COLORS.forEach(color => {
    // One 0 card per color
    deck.push({ color, type: 'number', value: 0 });
    
    // Two of each number 1-9 per color
    for (let i = 1; i <= 9; i++) {
      deck.push({ color, type: 'number', value: i });
      deck.push({ color, type: 'number', value: i });
    }
  });
  
  // Action cards (24 cards - 2 of each action per color)
  COLORS.forEach(color => {
    ACTION_CARDS.forEach(action => {
      deck.push({ color, type: 'action', value: action });
      deck.push({ color, type: 'action', value: action });
    });
  });
  
  // Wild cards (8 cards - 4 wild, 4 wild draw4)
  for (let i = 0; i < 4; i++) {
    deck.push({ color: null, type: 'wild', value: 'wild' });
    deck.push({ color: null, type: 'wild', value: 'wild_draw4' });
  }
  
  return deck;
}

// Shuffle array using Fisher-Yates algorithm
function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Check if a card can be played on top of another card
function canPlayCard(card, topCard, currentColor) {
  // Wild cards can always be played
  if (card.type === 'wild') {
    return true;
  }
  
  // Must match color or value/type
  return card.color === currentColor || 
         card.value === topCard.value ||
         (card.type === topCard.type && card.type === 'action');
}

// Get valid moves for current player
function getValidMoves(hand, topCard, currentColor) {
  return hand
    .map((card, index) => ({ card, index }))
    .filter(({ card }) => canPlayCard(card, topCard, currentColor));
}

const UnoGame = {
  name: 'uno',
  
  setup: ({ ctx, random }) => {
    const deck = shuffleDeck(createDeck());
    const players = {};
    
    // Deal 7 cards to each player
    let deckIndex = 0;
    for (let i = 0; i < ctx.numPlayers; i++) {
      players[i] = {
        hand: deck.slice(deckIndex, deckIndex + 7),
        saidUno: false,
        canCallUno: false
      };
      deckIndex += 7;
    }
    
    // Set up discard pile with first card (must not be wild or action)
    let discardCard;
    do {
      discardCard = deck[deckIndex];
      deckIndex++;
    } while (discardCard.type === 'wild' || discardCard.type === 'action');
    
    return {
      players,
      deck: deck.slice(deckIndex),
      discardPile: [discardCard],
      currentColor: discardCard.color,
      direction: 1, // 1 for clockwise, -1 for counter-clockwise
      drawCount: 0, // For stacking +2/+4 cards
      mustChooseColor: false,
      lastPlayedCard: null
    };
  },

  moves: {
    // Play a card from hand
    playCard: ({ G, ctx, playerID }, cardIndex) => {
      const player = G.players[playerID];
      const card = player.hand[cardIndex];
      const topCard = G.discardPile[G.discardPile.length - 1];
      
      // Check if card can be played
      if (!canPlayCard(card, topCard, G.currentColor)) {
        return;
      }
      
      // Remove card from hand
      const newHand = [...player.hand];
      newHand.splice(cardIndex, 1);
      
      // Update game state
      const newG = {
        ...G,
        players: {
          ...G.players,
          [playerID]: {
            ...player,
            hand: newHand,
            saidUno: newHand.length === 1 ? false : player.saidUno,
            canCallUno: false
          }
        },
        discardPile: [...G.discardPile, card],
        lastPlayedCard: card,
        drawCount: 0
      };
      
      // Handle special cards
      if (card.type === 'wild') {
        newG.mustChooseColor = true;
        if (card.value === 'wild_draw4') {
          newG.drawCount = 4;
        }
      } else {
        newG.currentColor = card.color;
        
        if (card.type === 'action') {
          switch (card.value) {
            case 'draw2':
              newG.drawCount = 2;
              break;
            case 'reverse':
              newG.direction *= -1;
              break;
            case 'skip':
              // Skip will be handled by turn order
              break;
          }
        }
      }
      
      // Check if player needs to say UNO
      if (newHand.length === 1) {
        // Mark other players as able to call UNO on this player
        Object.keys(newG.players).forEach(pid => {
          if (pid !== playerID) {
            newG.players[pid].canCallUno = true;
          }
        });
      }
      
      return newG;
    },

    // Choose color for wild card
    chooseColor: ({ G, ctx, playerID }, color) => {
      if (!G.mustChooseColor || !COLORS.includes(color)) {
        return;
      }

      return {
        ...G,
        currentColor: color,
        mustChooseColor: false
      };
    },

    // Draw card from deck
    drawCard: ({ G, ctx, playerID }) => {
      const player = G.players[playerID];

      // If deck is empty, shuffle discard pile (except top card) back into deck
      let newDeck = [...G.deck];
      if (newDeck.length === 0) {
        const topCard = G.discardPile[G.discardPile.length - 1];
        newDeck = shuffleDeck(G.discardPile.slice(0, -1));
        G.discardPile = [topCard];
      }

      // Draw cards based on draw count or just 1
      const cardsToDraw = Math.max(1, G.drawCount);
      const drawnCards = newDeck.splice(0, cardsToDraw);

      return {
        ...G,
        players: {
          ...G.players,
          [playerID]: {
            ...player,
            hand: [...player.hand, ...drawnCards],
            canCallUno: false
          }
        },
        deck: newDeck,
        drawCount: 0
      };
    },

    // Say UNO when player has one card
    sayUno: ({ G, ctx, playerID }) => {
      const player = G.players[playerID];

      if (player.hand.length !== 1) {
        return;
      }

      return {
        ...G,
        players: {
          ...G.players,
          [playerID]: {
            ...player,
            saidUno: true
          }
        }
      };
    },

    // Call UNO on another player who forgot to say it
    callUno: ({ G, ctx, playerID }, targetPlayerID) => {
      const targetPlayer = G.players[targetPlayerID];
      const callingPlayer = G.players[playerID];

      // Can only call UNO if target has 1 card, hasn't said UNO, and calling player can call
      if (targetPlayer.hand.length !== 1 ||
          targetPlayer.saidUno ||
          !callingPlayer.canCallUno) {
        return;
      }

      // Target player draws 2 cards as penalty
      let newDeck = [...G.deck];
      if (newDeck.length < 2) {
        const topCard = G.discardPile[G.discardPile.length - 1];
        newDeck = [...newDeck, ...shuffleDeck(G.discardPile.slice(0, -1))];
        G.discardPile = [topCard];
      }

      const penaltyCards = newDeck.splice(0, 2);

      // Reset all canCallUno flags
      const newPlayers = { ...G.players };
      Object.keys(newPlayers).forEach(pid => {
        newPlayers[pid] = {
          ...newPlayers[pid],
          canCallUno: false
        };
      });

      newPlayers[targetPlayerID] = {
        ...targetPlayer,
        hand: [...targetPlayer.hand, ...penaltyCards],
        canCallUno: false
      };

      return {
        ...G,
        players: newPlayers,
        deck: newDeck
      };
    }
  },

  turn: {
    order: {
      // Custom turn order that respects direction and skip effects
      first: () => 0,
      next: ({ ctx, G }) => {
        let nextPlayer = ctx.currentPlayer;
        const numPlayers = ctx.numPlayers;

        // Handle skip effect
        if (G.lastPlayedCard && G.lastPlayedCard.value === 'skip') {
          // Skip one player
          nextPlayer = (nextPlayer + G.direction + numPlayers) % numPlayers;
        }

        // Move to next player
        nextPlayer = (nextPlayer + G.direction + numPlayers) % numPlayers;

        return nextPlayer;
      }
    },

    // Player must draw cards if drawCount > 0, or choose color if mustChooseColor
    onBegin: ({ G, ctx, events }) => {
      if (G.drawCount > 0) {
        // Force player to draw cards
        events.setActivePlayers({ currentPlayer: 'drawPhase' });
      } else if (G.mustChooseColor) {
        // Force player to choose color
        events.setActivePlayers({ currentPlayer: 'colorPhase' });
      }
    }
  },

  endIf: ({ G, ctx }) => {
    // Check if any player has no cards left
    for (let playerID of Object.keys(G.players)) {
      if (G.players[playerID].hand.length === 0) {
        return { winner: playerID };
      }
    }
  },

  playerView: ({ G, ctx, playerID }) => {
    // Hide other players' hands
    const players = {};
    Object.keys(G.players).forEach(pid => {
      if (pid === playerID) {
        players[pid] = G.players[pid];
      } else {
        players[pid] = {
          ...G.players[pid],
          hand: new Array(G.players[pid].hand.length).fill(null) // Hide cards
        };
      }
    });

    return {
      ...G,
      players,
      deck: new Array(G.deck.length).fill(null) // Hide deck contents
    };
  }
};

export default UnoGame;
