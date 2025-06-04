/*
 * UNO游戏设置组件
 * 
 * 提供游戏设置和自定义选项
 */

import React, { useState, useEffect } from 'react';
import { setSoundEnabled, setSoundVolume, isSoundEnabled, getSoundVolume } from './sounds';
import { AI_DIFFICULTY } from './ai';

// 游戏设置组件
const GameSettings = ({ onClose, onApply }) => {
  const [settings, setSettings] = useState({
    // 音效设置
    soundEnabled: isSoundEnabled(),
    soundVolume: getSoundVolume(),
    
    // 游戏规则设置
    drawToMatch: false,        // 抽牌直到能出牌
    stackingRules: false,      // 允许+2/+4叠加
    jumpInRules: false,        // 允许插牌
    sevenZeroRules: false,     // 7和0的特殊规则
    
    // AI设置
    aiDifficulty: AI_DIFFICULTY.MEDIUM,
    aiPersonalities: true,     // AI个性化
    aiThinkingTime: 1000,      // AI思考时间(ms)
    
    // 界面设置
    animationSpeed: 'normal',  // 动画速度
    cardStyle: 'modern',       // 卡牌样式
    theme: 'default',          // 主题
    language: 'zh-CN',         // 语言
    
    // 游戏设置
    timeLimit: 0,              // 回合时间限制(秒，0为无限制)
    autoSort: true,            // 自动排序手牌
    showCardCount: true,       // 显示其他玩家牌数
    
    // 高级设置
    debugMode: false,          // 调试模式
    showAIThinking: false,     // 显示AI思考过程
    logGameEvents: false       // 记录游戏事件
  });

  // 应用设置
  const applySettings = () => {
    // 应用音效设置
    setSoundEnabled(settings.soundEnabled);
    setSoundVolume(settings.soundVolume);
    
    // 保存到本地存储
    localStorage.setItem('unoGameSettings', JSON.stringify(settings));
    
    // 通知父组件
    if (onApply) {
      onApply(settings);
    }
    
    if (onClose) {
      onClose();
    }
  };

  // 重置设置
  const resetSettings = () => {
    const defaultSettings = {
      soundEnabled: true,
      soundVolume: 0.7,
      drawToMatch: false,
      stackingRules: false,
      jumpInRules: false,
      sevenZeroRules: false,
      aiDifficulty: AI_DIFFICULTY.MEDIUM,
      aiPersonalities: true,
      aiThinkingTime: 1000,
      animationSpeed: 'normal',
      cardStyle: 'modern',
      theme: 'default',
      language: 'zh-CN',
      timeLimit: 0,
      autoSort: true,
      showCardCount: true,
      debugMode: false,
      showAIThinking: false,
      logGameEvents: false
    };
    
    setSettings(defaultSettings);
  };

  // 从本地存储加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('unoGameSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.warn('Failed to load settings:', e);
      }
    }
  }, []);

  // 更新设置值
  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>🎮 游戏设置</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="settings-content">
          {/* 音效设置 */}
          <div className="settings-section">
            <h3>🔊 音效设置</h3>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
                />
                启用音效
              </label>
            </div>
            <div className="setting-item">
              <label>
                音量: {Math.round(settings.soundVolume * 100)}%
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.soundVolume}
                  onChange={(e) => updateSetting('soundVolume', parseFloat(e.target.value))}
                  disabled={!settings.soundEnabled}
                />
              </label>
            </div>
          </div>

          {/* 游戏规则设置 */}
          <div className="settings-section">
            <h3>📋 游戏规则</h3>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.drawToMatch}
                  onChange={(e) => updateSetting('drawToMatch', e.target.checked)}
                />
                抽牌直到能出牌
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.stackingRules}
                  onChange={(e) => updateSetting('stackingRules', e.target.checked)}
                />
                允许+2/+4叠加
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.jumpInRules}
                  onChange={(e) => updateSetting('jumpInRules', e.target.checked)}
                />
                允许插牌
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.sevenZeroRules}
                  onChange={(e) => updateSetting('sevenZeroRules', e.target.checked)}
                />
                7和0特殊规则
              </label>
            </div>
          </div>

          {/* AI设置 */}
          <div className="settings-section">
            <h3>🤖 AI设置</h3>
            <div className="setting-item">
              <label>
                AI难度:
                <select
                  value={settings.aiDifficulty}
                  onChange={(e) => updateSetting('aiDifficulty', e.target.value)}
                >
                  <option value={AI_DIFFICULTY.EASY}>简单</option>
                  <option value={AI_DIFFICULTY.MEDIUM}>中等</option>
                  <option value={AI_DIFFICULTY.HARD}>困难</option>
                  <option value={AI_DIFFICULTY.EXPERT}>专家</option>
                </select>
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.aiPersonalities}
                  onChange={(e) => updateSetting('aiPersonalities', e.target.checked)}
                />
                AI个性化
              </label>
            </div>
            <div className="setting-item">
              <label>
                AI思考时间: {settings.aiThinkingTime}ms
                <input
                  type="range"
                  min="500"
                  max="3000"
                  step="100"
                  value={settings.aiThinkingTime}
                  onChange={(e) => updateSetting('aiThinkingTime', parseInt(e.target.value))}
                />
              </label>
            </div>
          </div>

          {/* 界面设置 */}
          <div className="settings-section">
            <h3>🎨 界面设置</h3>
            <div className="setting-item">
              <label>
                动画速度:
                <select
                  value={settings.animationSpeed}
                  onChange={(e) => updateSetting('animationSpeed', e.target.value)}
                >
                  <option value="slow">慢速</option>
                  <option value="normal">正常</option>
                  <option value="fast">快速</option>
                  <option value="none">无动画</option>
                </select>
              </label>
            </div>
            <div className="setting-item">
              <label>
                卡牌样式:
                <select
                  value={settings.cardStyle}
                  onChange={(e) => updateSetting('cardStyle', e.target.value)}
                >
                  <option value="classic">经典</option>
                  <option value="modern">现代</option>
                  <option value="minimal">简约</option>
                </select>
              </label>
            </div>
            <div className="setting-item">
              <label>
                主题:
                <select
                  value={settings.theme}
                  onChange={(e) => updateSetting('theme', e.target.value)}
                >
                  <option value="default">默认</option>
                  <option value="dark">深色</option>
                  <option value="light">浅色</option>
                  <option value="colorful">彩色</option>
                </select>
              </label>
            </div>
          </div>

          {/* 游戏设置 */}
          <div className="settings-section">
            <h3>⚙️ 游戏设置</h3>
            <div className="setting-item">
              <label>
                回合时间限制: {settings.timeLimit === 0 ? '无限制' : `${settings.timeLimit}秒`}
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={settings.timeLimit}
                  onChange={(e) => updateSetting('timeLimit', parseInt(e.target.value))}
                />
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.autoSort}
                  onChange={(e) => updateSetting('autoSort', e.target.checked)}
                />
                自动排序手牌
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.showCardCount}
                  onChange={(e) => updateSetting('showCardCount', e.target.checked)}
                />
                显示其他玩家牌数
              </label>
            </div>
          </div>

          {/* 高级设置 */}
          <div className="settings-section">
            <h3>🔧 高级设置</h3>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.debugMode}
                  onChange={(e) => updateSetting('debugMode', e.target.checked)}
                />
                调试模式
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.showAIThinking}
                  onChange={(e) => updateSetting('showAIThinking', e.target.checked)}
                />
                显示AI思考过程
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.logGameEvents}
                  onChange={(e) => updateSetting('logGameEvents', e.target.checked)}
                />
                记录游戏事件
              </label>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button className="btn btn-secondary" onClick={resetSettings}>
            🔄 重置默认
          </button>
          <button className="btn btn-primary" onClick={applySettings}>
            ✅ 应用设置
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameSettings;
