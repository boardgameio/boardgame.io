/*
 * UNO游戏AI玩家系统
 * 
 * 实现不同难度的AI玩家逻辑
 */

// AI难度等级
export const AI_DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  EXPERT: 'expert'
};

// AI玩家类
export class AIPlayer {
  constructor(playerID, difficulty = AI_DIFFICULTY.MEDIUM) {
    this.playerID = playerID;
    this.difficulty = difficulty;
    this.name = this.generateName();
    this.personality = this.generatePersonality();
  }

  // 生成AI玩家名称
  generateName() {
    const names = [
      '小智', '小红', '小蓝', '小绿', '小黄',
      '阿尔法', '贝塔', '伽马', '德尔塔',
      '机器人1号', '电脑玩家', 'AI助手',
      '智能对手', '虚拟玩家', '数字伙伴'
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  // 生成AI个性特征
  generatePersonality() {
    return {
      aggressive: Math.random(), // 攻击性 (0-1)
      defensive: Math.random(),  // 防御性 (0-1)
      strategic: Math.random(),  // 策略性 (0-1)
      risky: Math.random()       // 冒险性 (0-1)
    };
  }

  // 主要决策方法
  makeMove(gameState, playerHand) {
    const { G, ctx } = gameState;
    const topCard = G.discardPile[G.discardPile.length - 1];
    const currentColor = G.currentColor;

    // 获取可出的牌
    const playableCards = this.getPlayableCards(playerHand, topCard, currentColor);

    if (playableCards.length === 0) {
      // 没有可出的牌，必须抽牌
      return { action: 'drawCard' };
    }

    // 根据难度选择策略
    switch (this.difficulty) {
      case AI_DIFFICULTY.EASY:
        return this.easyStrategy(playableCards, gameState);
      case AI_DIFFICULTY.MEDIUM:
        return this.mediumStrategy(playableCards, gameState);
      case AI_DIFFICULTY.HARD:
        return this.hardStrategy(playableCards, gameState);
      case AI_DIFFICULTY.EXPERT:
        return this.expertStrategy(playableCards, gameState);
      default:
        return this.mediumStrategy(playableCards, gameState);
    }
  }

  // 获取可出的牌
  getPlayableCards(hand, topCard, currentColor) {
    return hand
      .map((card, index) => ({ card, index }))
      .filter(({ card }) => this.canPlayCard(card, topCard, currentColor));
  }

  // 检查是否可以出牌
  canPlayCard(card, topCard, currentColor) {
    if (card.type === 'wild') return true;
    return card.color === currentColor || 
           card.value === topCard.value ||
           (card.type === topCard.type && card.type === 'action');
  }

  // 简单策略 - 随机出牌
  easyStrategy(playableCards, gameState) {
    const randomCard = playableCards[Math.floor(Math.random() * playableCards.length)];
    
    const move = {
      action: 'playCard',
      cardIndex: randomCard.index
    };

    // 如果是万能牌，随机选择颜色
    if (randomCard.card.type === 'wild') {
      const colors = ['red', 'blue', 'green', 'yellow'];
      move.chosenColor = colors[Math.floor(Math.random() * colors.length)];
    }

    return move;
  }

  // 中等策略 - 基本优先级
  mediumStrategy(playableCards, gameState) {
    const { G } = gameState;
    
    // 优先级排序
    const prioritizedCards = this.prioritizeCards(playableCards, gameState);
    const bestCard = prioritizedCards[0];

    const move = {
      action: 'playCard',
      cardIndex: bestCard.index
    };

    // 万能牌颜色选择
    if (bestCard.card.type === 'wild') {
      move.chosenColor = this.chooseWildColor(gameState);
    }

    return move;
  }

  // 困难策略 - 考虑对手
  hardStrategy(playableCards, gameState) {
    const { G, ctx } = gameState;
    
    // 分析对手状态
    const opponentAnalysis = this.analyzeOpponents(gameState);
    
    // 选择最佳卡牌
    const bestCard = this.selectBestCard(playableCards, gameState, opponentAnalysis);

    const move = {
      action: 'playCard',
      cardIndex: bestCard.index
    };

    if (bestCard.card.type === 'wild') {
      move.chosenColor = this.strategicColorChoice(gameState, opponentAnalysis);
    }

    return move;
  }

  // 专家策略 - 深度分析
  expertStrategy(playableCards, gameState) {
    const { G, ctx } = gameState;
    
    // 深度游戏状态分析
    const gameAnalysis = this.deepGameAnalysis(gameState);
    
    // 计算每张牌的价值
    const cardValues = playableCards.map(cardInfo => ({
      ...cardInfo,
      value: this.calculateCardValue(cardInfo, gameState, gameAnalysis)
    }));

    // 选择价值最高的牌
    const bestCard = cardValues.reduce((best, current) => 
      current.value > best.value ? current : best
    );

    const move = {
      action: 'playCard',
      cardIndex: bestCard.index
    };

    if (bestCard.card.type === 'wild') {
      move.chosenColor = this.optimalColorChoice(gameState, gameAnalysis);
    }

    return move;
  }

  // 卡牌优先级排序
  prioritizeCards(playableCards, gameState) {
    return playableCards.sort((a, b) => {
      const scoreA = this.getCardPriority(a.card, gameState);
      const scoreB = this.getCardPriority(b.card, gameState);
      return scoreB - scoreA;
    });
  }

  // 获取卡牌优先级分数
  getCardPriority(card, gameState) {
    let score = 0;

    // 功能牌优先级更高
    if (card.type === 'action') {
      score += 10;
      
      // 特定功能牌的额外分数
      switch (card.value) {
        case 'skip': score += 5; break;
        case 'reverse': score += 3; break;
        case 'draw2': score += 8; break;
      }
    }

    // 万能牌最高优先级
    if (card.type === 'wild') {
      score += 15;
      if (card.value === 'wild_draw4') {
        score += 5;
      }
    }

    // 数字牌按数值给分
    if (card.type === 'number') {
      score += card.value;
    }

    return score;
  }

  // 选择万能牌颜色
  chooseWildColor(gameState) {
    const { G } = gameState;
    const colors = ['red', 'blue', 'green', 'yellow'];
    
    // 简单策略：选择手牌中最多的颜色
    const colorCounts = { red: 0, blue: 0, green: 0, yellow: 0 };
    
    // 这里需要访问AI的手牌，在实际实现中需要传入
    // 暂时随机选择
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // 分析对手状态
  analyzeOpponents(gameState) {
    const { G, ctx } = gameState;
    const analysis = {};

    Object.keys(G.players).forEach(playerID => {
      if (playerID !== this.playerID) {
        const player = G.players[playerID];
        analysis[playerID] = {
          cardCount: player.hand.length,
          hasUno: player.hand.length === 1,
          saidUno: player.saidUno,
          threat: this.calculateThreatLevel(player)
        };
      }
    });

    return analysis;
  }

  // 计算威胁等级
  calculateThreatLevel(player) {
    let threat = 0;
    
    if (player.hand.length === 1) threat += 10;
    if (player.hand.length <= 3) threat += 5;
    if (player.saidUno) threat += 3;
    
    return threat;
  }

  // 选择最佳卡牌
  selectBestCard(playableCards, gameState, opponentAnalysis) {
    // 如果有对手即将获胜，优先使用攻击性卡牌
    const hasUrgentThreat = Object.values(opponentAnalysis).some(analysis => 
      analysis.hasUno && analysis.saidUno
    );

    if (hasUrgentThreat) {
      // 优先选择+2或+4牌
      const attackCards = playableCards.filter(({ card }) => 
        card.value === 'draw2' || card.value === 'wild_draw4'
      );
      
      if (attackCards.length > 0) {
        return attackCards[0];
      }
    }

    // 否则使用常规优先级
    return this.prioritizeCards(playableCards, gameState)[0];
  }

  // 策略性颜色选择
  strategicColorChoice(gameState, opponentAnalysis) {
    const colors = ['red', 'blue', 'green', 'yellow'];
    
    // 基于个性特征选择
    if (this.personality.aggressive > 0.7) {
      // 攻击性强的AI可能选择不常见的颜色
      return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // 默认选择
    return colors[0];
  }

  // 深度游戏分析
  deepGameAnalysis(gameState) {
    const { G, ctx } = gameState;
    
    return {
      gamePhase: this.determineGamePhase(gameState),
      playerPositions: this.analyzePlayerPositions(gameState),
      cardDistribution: this.analyzeCardDistribution(gameState),
      optimalStrategy: this.determineOptimalStrategy(gameState)
    };
  }

  // 确定游戏阶段
  determineGamePhase(gameState) {
    const { G } = gameState;
    const totalCards = Object.values(G.players).reduce((sum, player) => 
      sum + player.hand.length, 0
    );
    
    if (totalCards > 20) return 'early';
    if (totalCards > 10) return 'middle';
    return 'late';
  }

  // 分析玩家位置
  analyzePlayerPositions(gameState) {
    const { G } = gameState;
    const positions = {};
    
    Object.keys(G.players).forEach(playerID => {
      const player = G.players[playerID];
      positions[playerID] = {
        cardCount: player.hand.length,
        position: this.getPlayerPosition(player.hand.length)
      };
    });
    
    return positions;
  }

  // 获取玩家位置评估
  getPlayerPosition(cardCount) {
    if (cardCount <= 2) return 'winning';
    if (cardCount <= 5) return 'good';
    if (cardCount <= 8) return 'average';
    return 'behind';
  }

  // 分析卡牌分布
  analyzeCardDistribution(gameState) {
    // 这里可以分析已出的牌来推测剩余牌的分布
    return {
      remainingColors: { red: 25, blue: 25, green: 25, yellow: 25 },
      remainingSpecials: 8,
      deckSize: gameState.G.deck.length
    };
  }

  // 确定最优策略
  determineOptimalStrategy(gameState) {
    const phase = this.determineGamePhase(gameState);
    
    switch (phase) {
      case 'early':
        return 'conservative'; // 保守策略
      case 'middle':
        return 'balanced';     // 平衡策略
      case 'late':
        return 'aggressive';   // 激进策略
      default:
        return 'balanced';
    }
  }

  // 计算卡牌价值
  calculateCardValue(cardInfo, gameState, gameAnalysis) {
    let value = this.getCardPriority(cardInfo.card, gameState);
    
    // 根据游戏阶段调整价值
    if (gameAnalysis.gamePhase === 'late') {
      // 后期更重视攻击性卡牌
      if (cardInfo.card.type === 'action') {
        value *= 1.5;
      }
    }
    
    // 根据策略调整
    if (gameAnalysis.optimalStrategy === 'aggressive') {
      if (cardInfo.card.value === 'draw2' || cardInfo.card.value === 'wild_draw4') {
        value *= 2;
      }
    }
    
    return value;
  }

  // 最优颜色选择
  optimalColorChoice(gameState, gameAnalysis) {
    const colors = ['red', 'blue', 'green', 'yellow'];
    
    // 基于卡牌分布选择最有利的颜色
    const distribution = gameAnalysis.cardDistribution.remainingColors;
    const mostCommonColor = Object.keys(distribution).reduce((a, b) => 
      distribution[a] > distribution[b] ? a : b
    );
    
    return mostCommonColor;
  }

  // 是否应该喊UNO
  shouldSayUno(handSize) {
    if (handSize !== 1) return false;
    
    // 根据难度决定是否会忘记喊UNO
    const forgetChance = {
      [AI_DIFFICULTY.EASY]: 0.3,
      [AI_DIFFICULTY.MEDIUM]: 0.1,
      [AI_DIFFICULTY.HARD]: 0.05,
      [AI_DIFFICULTY.EXPERT]: 0.01
    };
    
    return Math.random() > (forgetChance[this.difficulty] || 0.1);
  }

  // 是否应该指出其他玩家的UNO
  shouldCallUno(targetPlayer) {
    if (targetPlayer.hand.length !== 1 || targetPlayer.saidUno) {
      return false;
    }
    
    // 根据个性和难度决定
    const callChance = {
      [AI_DIFFICULTY.EASY]: 0.2,
      [AI_DIFFICULTY.MEDIUM]: 0.5,
      [AI_DIFFICULTY.HARD]: 0.8,
      [AI_DIFFICULTY.EXPERT]: 0.95
    };
    
    const baseChance = callChance[this.difficulty] || 0.5;
    const personalityModifier = this.personality.aggressive * 0.3;
    
    return Math.random() < (baseChance + personalityModifier);
  }
}

// 创建AI玩家工厂
export function createAIPlayer(playerID, difficulty) {
  return new AIPlayer(playerID, difficulty);
}

// 导出AI难度常量
export { AI_DIFFICULTY as default };
