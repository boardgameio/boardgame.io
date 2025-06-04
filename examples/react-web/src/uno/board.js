/*
 * UNO游戏界面组件 - 基于boardgame.io框架
 *
 * 此文件包含UNO游戏的React用户界面组件
 */

import React from 'react';
import PropTypes from 'prop-types';
import './board.css';

// 中文翻译映射
const TRANSLATIONS = {
  colors: {
    red: '红色',
    blue: '蓝色',
    green: '绿色',
    yellow: '黄色'
  },
  actions: {
    skip: '跳过',
    reverse: '反转',
    draw2: '+2'
  },
  wilds: {
    wild: '万能',
    wild_draw4: '+4'
  },
  ui: {
    yourTurn: '轮到你了！',
    playerTurn: '玩家 {0} 的回合',
    gameOver: '游戏结束！',
    winner: '玩家 {0} 获胜！',
    cards: '张牌',
    draw: '抽牌',
    sayUno: '喊UNO！',
    callUno: '指出UNO！',
    chooseColor: '选择颜色：',
    disconnected: '连接断开！',
    loading: '加载中...'
  }
};

// 卡牌组件 - 增强版中文界面
const Card = ({ card, onClick, isPlayable, isSelected, size = 'normal' }) => {
  if (!card) {
    return (
      <div className={`card card-back ${size}`} onClick={onClick}>
        <div className="card-back-content">
          <div className="card-back-logo">UNO</div>
          <div className="card-back-pattern"></div>
        </div>
      </div>
    );
  }

  const getCardClass = () => {
    let classes = [`card`, `card-${size}`];

    if (card.color) {
      classes.push(`card-${card.color}`);
    } else {
      classes.push('card-wild');
    }

    if (isPlayable) {
      classes.push('card-playable');
    }

    if (isSelected) {
      classes.push('card-selected');
    }

    return classes.join(' ');
  };

  const getCardContent = () => {
    if (card.type === 'number') {
      return {
        main: card.value,
        sub: null,
        symbol: card.value
      };
    } else if (card.type === 'action') {
      switch (card.value) {
        case 'skip':
          return { main: '⊘', sub: '跳过', symbol: '⊘' };
        case 'reverse':
          return { main: '⇄', sub: '反转', symbol: '⇄' };
        case 'draw2':
          return { main: '+2', sub: '罚抽', symbol: '+2' };
        default:
          return { main: card.value, sub: null, symbol: card.value };
      }
    } else if (card.type === 'wild') {
      if (card.value === 'wild_draw4') {
        return { main: '+4', sub: '万能', symbol: '🌈' };
      } else {
        return { main: 'W', sub: '万能', symbol: '🌈' };
      }
    }
    return { main: '', sub: null, symbol: '' };
  };

  const content = getCardContent();

  return (
    <div className={getCardClass()} onClick={onClick}>
      <div className="card-content">
        <div className="card-corner top-left">
          <div className="card-value">{content.main}</div>
          <div className="card-symbol">{content.symbol}</div>
        </div>

        <div className="card-center">
          <div className="card-main-value">{content.main}</div>
          {content.sub && <div className="card-sub-text">{content.sub}</div>}
        </div>

        <div className="card-corner bottom-right">
          <div className="card-value rotated">{content.main}</div>
          <div className="card-symbol rotated">{content.symbol}</div>
        </div>
      </div>

      {isPlayable && <div className="card-glow"></div>}
    </div>
  );
};

// 颜色选择器组件 - 增强版中文界面
const ColorSelector = ({ onColorSelect, visible }) => {
  const colors = [
    { value: 'red', name: '红色', emoji: '🔴' },
    { value: 'blue', name: '蓝色', emoji: '🔵' },
    { value: 'green', name: '绿色', emoji: '🟢' },
    { value: 'yellow', name: '黄色', emoji: '🟡' }
  ];

  if (!visible) return null;

  return (
    <div className="color-selector-overlay">
      <div className="color-selector">
        <div className="color-selector-header">
          <h3>🌈 选择颜色</h3>
          <p>请为万能牌选择一个颜色</p>
        </div>
        <div className="color-options">
          {colors.map(color => (
            <button
              key={color.value}
              className={`color-button color-${color.value}`}
              onClick={() => onColorSelect(color.value)}
            >
              <div className="color-emoji">{color.emoji}</div>
              <div className="color-name">{color.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// 玩家信息组件 - 增强版中文界面
const PlayerInfo = ({ playerID, player, isCurrentPlayer, isYou, onCallUno }) => {
  const getPlayerAvatar = (id) => {
    const avatars = ['👤', '🧑', '👩', '🧔', '👨', '👱', '🧓', '👴', '👵', '🧒'];
    return avatars[parseInt(id)] || '👤';
  };

  return (
    <div className={`player-info ${isCurrentPlayer ? 'current-player' : ''} ${isYou ? 'you' : ''}`}>
      <div className="player-header">
        <div className="player-avatar">{getPlayerAvatar(playerID)}</div>
        <div className="player-details">
          <div className="player-name">
            玩家 {playerID} {isYou && '(你)'}
            {isCurrentPlayer && <span className="current-indicator"> ⭐</span>}
          </div>
          <div className="player-status">
            <span className="card-count">{player.hand.length} 张牌</span>
            {player.saidUno && <span className="uno-indicator"> 🎯 UNO!</span>}
          </div>
        </div>
      </div>

      {!isYou && player.hand.length === 1 && !player.saidUno && (
        <button className="call-uno-btn" onClick={() => onCallUno(playerID)}>
          <span className="btn-icon">📢</span>
          <span className="btn-text">指出UNO!</span>
        </button>
      )}

      {isCurrentPlayer && (
        <div className="turn-indicator">
          <div className="turn-pulse"></div>
        </div>
      )}
    </div>
  );
};

// Main board component
class UnoBoard extends React.Component {
  static propTypes = {
    G: PropTypes.any.isRequired,
    ctx: PropTypes.any.isRequired,
    moves: PropTypes.any.isRequired,
    playerID: PropTypes.string,
    isActive: PropTypes.bool,
    isMultiplayer: PropTypes.bool,
    isConnected: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedCardIndex: null,
    };
  }

  onCardClick = (cardIndex) => {
    const { G, moves, playerID, isActive } = this.props;
    
    if (!isActive || !playerID) return;
    
    const player = G.players[playerID];
    const card = player.hand[cardIndex];
    const topCard = G.discardPile[G.discardPile.length - 1];
    
    // Check if card can be played
    if (this.canPlayCard(card, topCard, G.currentColor)) {
      moves.playCard(cardIndex);
      this.setState({ selectedCardIndex: null });
    } else {
      // Just select the card to show it's not playable
      this.setState({ selectedCardIndex: cardIndex });
    }
  };

  canPlayCard = (card, topCard, currentColor) => {
    if (card.type === 'wild') return true;
    return card.color === currentColor || 
           card.value === topCard.value ||
           (card.type === topCard.type && card.type === 'action');
  };

  onDrawCard = () => {
    const { moves, isActive } = this.props;
    if (isActive) {
      moves.drawCard();
    }
  };

  onSayUno = () => {
    const { moves, playerID, G } = this.props;
    const player = G.players[playerID];
    if (player && player.hand.length === 1 && !player.saidUno) {
      moves.sayUno();
    }
  };

  onCallUno = (targetPlayerID) => {
    const { moves } = this.props;
    moves.callUno(targetPlayerID);
  };

  onColorSelect = (color) => {
    const { moves } = this.props;
    moves.chooseColor(color);
  };

  render() {
    const { G, ctx, playerID, isActive, isMultiplayer, isConnected } = this.props;
    
    if (!playerID) {
      return (
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <div className="loading-text">🎮 加载游戏中...</div>
        </div>
      );
    }

    const currentPlayer = G.players[playerID];
    const topCard = G.discardPile[G.discardPile.length - 1];

    // 连接状态
    let connectionStatus = null;
    if (isMultiplayer && !isConnected) {
      connectionStatus = (
        <div className="connection-status">
          <span className="status-icon">⚠️</span>
          <span className="status-text">连接断开！</span>
        </div>
      );
    }

    // 游戏结束状态
    let gameOverStatus = null;
    if (ctx.gameover) {
      const winner = ctx.gameover.winner;
      gameOverStatus = (
        <div className="game-over">
          <div className="game-over-content">
            <h2>🎉 游戏结束！</h2>
            <p className="winner-text">🏆 玩家 {winner} 获胜！</p>
            <div className="celebration">🎊🎈🎉</div>
          </div>
        </div>
      );
    }

    // Current turn indicator
    const turnIndicator = (
      <div className="turn-indicator">
        {isActive ? "Your turn!" : `Player ${ctx.currentPlayer}'s turn`}
        {G.direction === -1 && <span className="reverse-indicator"> ↺</span>}
      </div>
    );

    return (
      <div className="uno-board">
        {connectionStatus}
        {gameOverStatus}
        
        <div className="game-area">
          {/* Other players */}
          <div className="other-players">
            {Object.keys(G.players).map(pid => {
              if (pid === playerID) return null;
              return (
                <PlayerInfo
                  key={pid}
                  playerID={pid}
                  player={G.players[pid]}
                  isCurrentPlayer={ctx.currentPlayer === pid}
                  isYou={false}
                  onCallUno={this.onCallUno}
                />
              );
            })}
          </div>

          {/* 游戏中心区域 */}
          <div className="game-center">
            <div className="deck-area">
              <Card
                card={null}
                onClick={this.onDrawCard}
                size="large"
              />
              <div className="deck-info">
                <div className="deck-label">🎴 抽牌堆</div>
                <div className="deck-count">剩余 {G.deck.length} 张</div>
              </div>
            </div>

            <div className="game-status">
              <div className="turn-info">
                <div className="turn-text">
                  {isActive ? "🎯 轮到你了！" : `⏳ 玩家 ${ctx.currentPlayer} 的回合`}
                </div>
                <div className="direction-indicator">
                  {G.direction === 1 ? '🔄 顺时针' : '🔃 逆时针'}
                </div>
              </div>
            </div>

            <div className="discard-area">
              <Card
                card={topCard}
                size="large"
              />
              <div className="discard-info">
                <div className="discard-label">🗂️ 弃牌堆</div>
                <div className="current-color-info">
                  <span className="color-label">当前颜色:</span>
                  <div className="current-color" style={{backgroundColor: G.currentColor}}>
                    {TRANSLATIONS.colors[G.currentColor]}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {turnIndicator}

          {/* Current player hand */}
          <div className="player-hand">
            <PlayerInfo
              playerID={playerID}
              player={currentPlayer}
              isCurrentPlayer={ctx.currentPlayer === playerID}
              isYou={true}
              onCallUno={this.onCallUno}
            />
            
            <div className="hand-cards">
              {currentPlayer.hand.map((card, index) => (
                <Card
                  key={index}
                  card={card}
                  onClick={() => this.onCardClick(index)}
                  isPlayable={isActive && this.canPlayCard(card, topCard, G.currentColor)}
                  isSelected={this.state.selectedCardIndex === index}
                />
              ))}
            </div>
            
            {currentPlayer.hand.length === 1 && !currentPlayer.saidUno && (
              <button className="uno-button" onClick={this.onSayUno}>
                <span className="uno-icon">🎯</span>
                <span className="uno-text">喊 UNO!</span>
                <div className="uno-pulse"></div>
              </button>
            )}
          </div>
        </div>

        {/* Color selector overlay */}
        <ColorSelector
          visible={G.mustChooseColor && isActive}
          onColorSelect={this.onColorSelect}
        />
      </div>
    );
  }
}

export default UnoBoard;
