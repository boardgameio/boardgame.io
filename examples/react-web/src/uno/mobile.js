/*
 * UNO游戏移动端优化组件
 * 
 * 专为移动设备优化的界面和交互
 */

import React, { useState, useEffect } from 'react';
import './mobile.css';

// 移动端检测
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth <= 768;
};

// 触摸手势处理
export const useTouchGestures = (onSwipeLeft, onSwipeRight, onTap, onLongPress) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [longPressTimer, setLongPressTimer] = useState(null);

  const minSwipeDistance = 50;
  const longPressDelay = 500;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    
    // 长按检测
    const timer = setTimeout(() => {
      if (onLongPress) onLongPress(e);
    }, longPressDelay);
    setLongPressTimer(timer);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
    
    // 取消长按
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const onTouchEndHandler = (e) => {
    // 取消长按
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    if (!touchStart || !touchEnd) {
      // 单击
      if (onTap) onTap(e);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft(e);
    } else if (isRightSwipe && onSwipeRight) {
      onSwipeRight(e);
    } else if (onTap) {
      onTap(e);
    }
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd: onTouchEndHandler
  };
};

// 移动端卡牌组件
export const MobileCard = ({ 
  card, 
  onClick, 
  isPlayable, 
  isSelected, 
  size = 'normal',
  showTooltip = false 
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const touchGestures = useTouchGestures(
    null, // onSwipeLeft
    null, // onSwipeRight
    onClick, // onTap
    () => setShowDetails(true) // onLongPress
  );

  const getCardClass = () => {
    let classes = [`mobile-card`, `mobile-card-${size}`];
    
    if (card) {
      if (card.color) {
        classes.push(`mobile-card-${card.color}`);
      } else {
        classes.push('mobile-card-wild');
      }
    } else {
      classes.push('mobile-card-back');
    }
    
    if (isPlayable) {
      classes.push('mobile-card-playable');
    }
    
    if (isSelected) {
      classes.push('mobile-card-selected');
    }
    
    return classes.join(' ');
  };

  const getCardContent = () => {
    if (!card) return 'UNO';
    
    if (card.type === 'number') {
      return card.value;
    } else if (card.type === 'action') {
      switch (card.value) {
        case 'skip': return '⊘';
        case 'reverse': return '⇄';
        case 'draw2': return '+2';
        default: return card.value;
      }
    } else if (card.type === 'wild') {
      return card.value === 'wild_draw4' ? '+4' : 'W';
    }
    return '';
  };

  const getCardName = () => {
    if (!card) return '抽牌堆';
    
    const colorNames = {
      red: '红色',
      blue: '蓝色',
      green: '绿色',
      yellow: '黄色'
    };
    
    const actionNames = {
      skip: '跳过',
      reverse: '反转',
      draw2: '罚抽2张'
    };
    
    if (card.type === 'number') {
      return `${colorNames[card.color]}${card.value}`;
    } else if (card.type === 'action') {
      return `${colorNames[card.color]}${actionNames[card.value]}`;
    } else if (card.type === 'wild') {
      return card.value === 'wild_draw4' ? '万能+4' : '万能牌';
    }
    
    return '';
  };

  return (
    <div className="mobile-card-container">
      <div 
        className={getCardClass()}
        {...touchGestures}
      >
        <div className="mobile-card-content">
          {getCardContent()}
        </div>
        
        {isPlayable && (
          <div className="mobile-card-indicator">✓</div>
        )}
      </div>
      
      {showDetails && (
        <div className="mobile-card-tooltip">
          <div className="tooltip-content">
            <div className="tooltip-title">{getCardName()}</div>
            {isPlayable && <div className="tooltip-action">点击出牌</div>}
          </div>
          <button 
            className="tooltip-close"
            onClick={() => setShowDetails(false)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

// 移动端玩家手牌组件
export const MobileHand = ({ 
  cards, 
  onCardClick, 
  playableCards = [],
  selectedCard = null,
  onSort 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sortBy, setSortBy] = useState('color'); // 'color', 'type', 'value'

  const sortCards = (cards, sortBy) => {
    const sorted = [...cards];
    
    switch (sortBy) {
      case 'color':
        return sorted.sort((a, b) => {
          if (a.color === b.color) {
            return a.value - b.value;
          }
          const colorOrder = { red: 0, blue: 1, green: 2, yellow: 3, null: 4 };
          return (colorOrder[a.color] || 4) - (colorOrder[b.color] || 4);
        });
      case 'type':
        return sorted.sort((a, b) => {
          if (a.type === b.type) {
            return a.value - b.value;
          }
          const typeOrder = { number: 0, action: 1, wild: 2 };
          return typeOrder[a.type] - typeOrder[b.type];
        });
      case 'value':
        return sorted.sort((a, b) => {
          if (typeof a.value === 'number' && typeof b.value === 'number') {
            return a.value - b.value;
          }
          return String(a.value).localeCompare(String(b.value));
        });
      default:
        return sorted;
    }
  };

  const sortedCards = sortCards(cards, sortBy);

  return (
    <div className="mobile-hand">
      <div className="mobile-hand-header">
        <div className="hand-info">
          <span className="hand-count">{cards.length} 张牌</span>
          {cards.length === 1 && (
            <span className="uno-warning">记得喊UNO!</span>
          )}
        </div>
        
        <div className="hand-controls">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="color">按颜色</option>
            <option value="type">按类型</option>
            <option value="value">按数值</option>
          </select>
          
          <button 
            className="expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '收起' : '展开'}
          </button>
        </div>
      </div>
      
      <div className={`mobile-hand-cards ${isExpanded ? 'expanded' : ''}`}>
        {sortedCards.map((card, index) => (
          <MobileCard
            key={index}
            card={card}
            onClick={() => onCardClick(index)}
            isPlayable={playableCards.includes(index)}
            isSelected={selectedCard === index}
            size="small"
          />
        ))}
      </div>
    </div>
  );
};

// 移动端游戏状态栏
export const MobileStatusBar = ({ 
  currentPlayer, 
  direction, 
  currentColor, 
  deckCount,
  gamePhase 
}) => {
  return (
    <div className="mobile-status-bar">
      <div className="status-item">
        <span className="status-icon">👤</span>
        <span className="status-text">玩家{currentPlayer}</span>
      </div>
      
      <div className="status-item">
        <span className="status-icon">{direction === 1 ? '🔄' : '🔃'}</span>
        <span className="status-text">{direction === 1 ? '顺时针' : '逆时针'}</span>
      </div>
      
      <div className="status-item">
        <div 
          className="color-indicator"
          style={{ backgroundColor: currentColor }}
        ></div>
        <span className="status-text">{currentColor}</span>
      </div>
      
      <div className="status-item">
        <span className="status-icon">🎴</span>
        <span className="status-text">{deckCount}</span>
      </div>
    </div>
  );
};

// 移动端快捷操作面板
export const MobileActionPanel = ({ 
  onDrawCard, 
  onSayUno, 
  onCallUno, 
  onSettings,
  canSayUno = false,
  canCallUno = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mobile-action-panel">
      <button 
        className="action-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? '收起' : '操作'}
      </button>
      
      {isExpanded && (
        <div className="action-buttons">
          <button 
            className="action-btn draw-btn"
            onClick={onDrawCard}
          >
            🎴 抽牌
          </button>
          
          {canSayUno && (
            <button 
              className="action-btn uno-btn"
              onClick={onSayUno}
            >
              🎯 UNO!
            </button>
          )}
          
          {canCallUno && (
            <button 
              className="action-btn call-btn"
              onClick={onCallUno}
            >
              📢 指出UNO
            </button>
          )}
          
          <button 
            className="action-btn settings-btn"
            onClick={onSettings}
          >
            ⚙️ 设置
          </button>
        </div>
      )}
    </div>
  );
};

// 移动端振动反馈
export const useHapticFeedback = () => {
  const vibrate = (pattern = [100]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const lightTap = () => vibrate([50]);
  const mediumTap = () => vibrate([100]);
  const heavyTap = () => vibrate([200]);
  const doubleTap = () => vibrate([100, 50, 100]);
  const errorTap = () => vibrate([300, 100, 300]);

  return {
    vibrate,
    lightTap,
    mediumTap,
    heavyTap,
    doubleTap,
    errorTap
  };
};

// 移动端屏幕方向检测
export const useOrientation = () => {
  const [orientation, setOrientation] = useState(
    window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  );

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      );
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return orientation;
};

// 移动端性能优化Hook
export const useMobileOptimization = () => {
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  useEffect(() => {
    // 检测设备性能
    const checkPerformance = () => {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      const isSlowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
      const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
      const isLowMemory = navigator.deviceMemory && navigator.deviceMemory <= 2;

      setIsLowPerformance(isSlowConnection || isLowEndDevice || isLowMemory);
    };

    checkPerformance();
  }, []);

  return {
    isLowPerformance,
    shouldReduceAnimations: isLowPerformance,
    shouldReduceEffects: isLowPerformance,
    shouldOptimizeImages: isLowPerformance
  };
};

export default {
  isMobile,
  useTouchGestures,
  MobileCard,
  MobileHand,
  MobileStatusBar,
  MobileActionPanel,
  useHapticFeedback,
  useOrientation,
  useMobileOptimization
};
