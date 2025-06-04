/*
 * UNO游戏计分系统
 * 
 * 实现UNO游戏的计分规则和统计功能
 */

// 卡牌分值映射
export const CARD_POINTS = {
  // 数字牌按面值计分
  number: (value) => value,
  
  // 功能牌固定分值
  action: {
    skip: 20,
    reverse: 20,
    draw2: 20
  },
  
  // 万能牌固定分值
  wild: {
    wild: 50,
    wild_draw4: 50
  }
};

// 计分系统类
export class ScoringSystem {
  constructor() {
    this.gameHistory = [];
    this.playerStats = {};
    this.currentRound = 0;
  }

  // 计算单张卡牌分值
  calculateCardPoints(card) {
    switch (card.type) {
      case 'number':
        return CARD_POINTS.number(card.value);
      case 'action':
        return CARD_POINTS.action[card.value] || 0;
      case 'wild':
        return CARD_POINTS.wild[card.value] || 0;
      default:
        return 0;
    }
  }

  // 计算手牌总分值
  calculateHandPoints(hand) {
    return hand.reduce((total, card) => {
      return total + this.calculateCardPoints(card);
    }, 0);
  }

  // 计算回合得分
  calculateRoundScore(gameState, winner) {
    const { G } = gameState;
    let totalPoints = 0;

    // 计算所有其他玩家的手牌分值
    Object.keys(G.players).forEach(playerID => {
      if (playerID !== winner) {
        const player = G.players[playerID];
        totalPoints += this.calculateHandPoints(player.hand);
      }
    });

    return totalPoints;
  }

  // 记录回合结果
  recordRound(gameState, winner, roundScore) {
    this.currentRound++;
    
    const roundData = {
      round: this.currentRound,
      winner,
      score: roundScore,
      timestamp: new Date(),
      playerHands: {},
      gameStats: this.calculateGameStats(gameState)
    };

    // 记录每个玩家的手牌情况
    Object.keys(gameState.G.players).forEach(playerID => {
      const player = gameState.G.players[playerID];
      roundData.playerHands[playerID] = {
        cardCount: player.hand.length,
        handPoints: this.calculateHandPoints(player.hand),
        cards: player.hand.map(card => ({
          type: card.type,
          color: card.color,
          value: card.value,
          points: this.calculateCardPoints(card)
        }))
      };
    });

    this.gameHistory.push(roundData);
    this.updatePlayerStats(gameState, winner, roundScore);
    
    return roundData;
  }

  // 更新玩家统计
  updatePlayerStats(gameState, winner, roundScore) {
    Object.keys(gameState.G.players).forEach(playerID => {
      if (!this.playerStats[playerID]) {
        this.playerStats[playerID] = {
          totalScore: 0,
          roundsWon: 0,
          roundsPlayed: 0,
          averageScore: 0,
          bestRound: 0,
          worstRound: 0,
          cardsPlayed: 0,
          specialCardsPlayed: 0,
          unoCallsCorrect: 0,
          unoCallsMissed: 0,
          timeSpent: 0
        };
      }

      const stats = this.playerStats[playerID];
      stats.roundsPlayed++;

      if (playerID === winner) {
        stats.roundsWon++;
        stats.totalScore += roundScore;
        stats.bestRound = Math.max(stats.bestRound, roundScore);
      } else {
        const handPoints = this.calculateHandPoints(gameState.G.players[playerID].hand);
        stats.worstRound = Math.max(stats.worstRound, handPoints);
      }

      stats.averageScore = stats.totalScore / stats.roundsPlayed;
    });
  }

  // 计算游戏统计
  calculateGameStats(gameState) {
    const { G, ctx } = gameState;
    
    return {
      totalTurns: ctx.turn,
      cardsInDeck: G.deck.length,
      cardsInDiscard: G.discardPile.length,
      currentDirection: G.direction === 1 ? 'clockwise' : 'counterclockwise',
      specialCardsPlayed: this.countSpecialCards(G.discardPile),
      longestTurn: this.calculateLongestTurn(),
      fastestWin: this.calculateFastestWin()
    };
  }

  // 统计特殊牌数量
  countSpecialCards(discardPile) {
    return discardPile.filter(card => 
      card.type === 'action' || card.type === 'wild'
    ).length;
  }

  // 计算最长回合
  calculateLongestTurn() {
    // 这里可以实现回合时长统计
    return 0;
  }

  // 计算最快获胜
  calculateFastestWin() {
    if (this.gameHistory.length === 0) return null;
    
    return this.gameHistory.reduce((fastest, round) => {
      if (!fastest || round.gameStats.totalTurns < fastest.gameStats.totalTurns) {
        return round;
      }
      return fastest;
    }, null);
  }

  // 获取玩家排名
  getPlayerRankings() {
    const rankings = Object.keys(this.playerStats).map(playerID => ({
      playerID,
      ...this.playerStats[playerID],
      winRate: this.playerStats[playerID].roundsWon / this.playerStats[playerID].roundsPlayed
    }));

    return rankings.sort((a, b) => {
      // 首先按总分排序
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      // 然后按胜率排序
      return b.winRate - a.winRate;
    });
  }

  // 获取游戏摘要
  getGameSummary() {
    const rankings = this.getPlayerRankings();
    const totalRounds = this.gameHistory.length;
    
    return {
      totalRounds,
      rankings,
      gameHistory: this.gameHistory,
      champion: rankings[0],
      statistics: {
        averageRoundScore: this.calculateAverageRoundScore(),
        totalCardsPlayed: this.calculateTotalCardsPlayed(),
        mostUsedCard: this.findMostUsedCard(),
        longestGame: this.findLongestGame(),
        shortestGame: this.findShortestGame()
      }
    };
  }

  // 计算平均回合得分
  calculateAverageRoundScore() {
    if (this.gameHistory.length === 0) return 0;
    
    const totalScore = this.gameHistory.reduce((sum, round) => sum + round.score, 0);
    return Math.round(totalScore / this.gameHistory.length);
  }

  // 计算总出牌数
  calculateTotalCardsPlayed() {
    return this.gameHistory.reduce((total, round) => {
      return total + Object.values(round.playerHands).reduce((sum, hand) => {
        return sum + (7 - hand.cardCount); // 假设初始7张牌
      }, 0);
    }, 0);
  }

  // 找出最常用的卡牌
  findMostUsedCard() {
    const cardUsage = {};
    
    this.gameHistory.forEach(round => {
      Object.values(round.playerHands).forEach(hand => {
        hand.cards.forEach(card => {
          const key = `${card.type}-${card.value}`;
          cardUsage[key] = (cardUsage[key] || 0) + 1;
        });
      });
    });

    const mostUsed = Object.keys(cardUsage).reduce((a, b) => 
      cardUsage[a] > cardUsage[b] ? a : b
    );

    return {
      card: mostUsed,
      count: cardUsage[mostUsed] || 0
    };
  }

  // 找出最长游戏
  findLongestGame() {
    return this.gameHistory.reduce((longest, round) => {
      if (!longest || round.gameStats.totalTurns > longest.gameStats.totalTurns) {
        return round;
      }
      return longest;
    }, null);
  }

  // 找出最短游戏
  findShortestGame() {
    return this.gameHistory.reduce((shortest, round) => {
      if (!shortest || round.gameStats.totalTurns < shortest.gameStats.totalTurns) {
        return round;
      }
      return shortest;
    }, null);
  }

  // 重置统计
  reset() {
    this.gameHistory = [];
    this.playerStats = {};
    this.currentRound = 0;
  }

  // 导出数据
  exportData() {
    return {
      gameHistory: this.gameHistory,
      playerStats: this.playerStats,
      currentRound: this.currentRound,
      summary: this.getGameSummary()
    };
  }

  // 导入数据
  importData(data) {
    this.gameHistory = data.gameHistory || [];
    this.playerStats = data.playerStats || {};
    this.currentRound = data.currentRound || 0;
  }

  // 保存到本地存储
  saveToStorage() {
    try {
      const data = this.exportData();
      localStorage.setItem('unoGameStats', JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to save game stats:', e);
      return false;
    }
  }

  // 从本地存储加载
  loadFromStorage() {
    try {
      const data = localStorage.getItem('unoGameStats');
      if (data) {
        this.importData(JSON.parse(data));
        return true;
      }
    } catch (e) {
      console.error('Failed to load game stats:', e);
    }
    return false;
  }
}

// 创建全局计分系统实例
const scoringSystem = new ScoringSystem();

// 导出计分系统
export default scoringSystem;

// 导出便捷方法
export const recordRound = (gameState, winner) => {
  const score = scoringSystem.calculateRoundScore(gameState, winner);
  return scoringSystem.recordRound(gameState, winner, score);
};

export const getPlayerRankings = () => scoringSystem.getPlayerRankings();
export const getGameSummary = () => scoringSystem.getGameSummary();
export const resetStats = () => scoringSystem.reset();
export const saveStats = () => scoringSystem.saveToStorage();
export const loadStats = () => scoringSystem.loadFromStorage();
