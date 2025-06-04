/*
 * UNO游戏入口 - 中文界面版本
 *
 * 此文件包含游戏配置和大厅设置
 */

import React from 'react';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { Local } from 'boardgame.io/multiplayer';
import UnoGame from './game';
import UnoBoard from './board';

// Local game client (for testing)
const UnoClient = Client({
  game: UnoGame,
  board: UnoBoard,
  multiplayer: Local(),
  debug: true,
});

// Online multiplayer client
const UnoMultiplayerClient = Client({
  game: UnoGame,
  board: UnoBoard,
  multiplayer: SocketIO({ server: 'localhost:8000' }),
  debug: false,
});

// UNO游戏大厅组件 - 中文界面
class UnoLobby extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gameMode: 'local', // 'local' 本地游戏 或 'online' 在线游戏
      numPlayers: 2,
      playerID: '0',
      gameID: 'uno-game',
      playerName: '',
      isInGame: false,
      matchID: null,
      playerCredentials: null,
    };
  }

  handleGameModeChange = (mode) => {
    this.setState({ gameMode: mode, isInGame: false });
  };

  handleNumPlayersChange = (num) => {
    this.setState({ numPlayers: parseInt(num) });
  };

  handlePlayerIDChange = (id) => {
    this.setState({ playerID: id });
  };

  handlePlayerNameChange = (name) => {
    this.setState({ playerName: name });
  };

  startLocalGame = () => {
    this.setState({ isInGame: true });
  };

  joinOnlineGame = async () => {
    // In a real implementation, you would connect to a lobby server
    // For now, we'll just start the game directly
    this.setState({ 
      isInGame: true,
      matchID: this.state.gameID,
      playerCredentials: 'dummy-credentials'
    });
  };

  leaveGame = () => {
    this.setState({ isInGame: false });
  };

  render() {
    const { gameMode, numPlayers, playerID, isInGame, matchID, playerCredentials } = this.state;

    if (isInGame) {
      if (gameMode === 'local') {
        return (
          <div style={{ fontFamily: "'Noto Sans SC', 'Microsoft YaHei', sans-serif" }}>
            <button
              onClick={this.leaveGame}
              style={{
                margin: '10px',
                padding: '10px 20px',
                backgroundColor: '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              🚪 退出游戏
            </button>
            <UnoClient
              playerID={playerID}
              numPlayers={numPlayers}
            />
          </div>
        );
      } else {
        return (
          <div style={{ fontFamily: "'Noto Sans SC', 'Microsoft YaHei', sans-serif" }}>
            <button
              onClick={this.leaveGame}
              style={{
                margin: '10px',
                padding: '10px 20px',
                backgroundColor: '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              🚪 退出游戏
            </button>
            <UnoMultiplayerClient
              playerID={playerID}
              matchID={matchID}
              credentials={playerCredentials}
            />
          </div>
        );
      }
    }

    return (
      <div style={{
        padding: '20px',
        maxWidth: '700px',
        margin: '0 auto',
        fontFamily: "'Noto Sans SC', 'Microsoft YaHei', sans-serif",
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        color: '#333'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <h1 style={{
            textAlign: 'center',
            color: '#333',
            fontSize: '2.5em',
            fontWeight: '700',
            margin: '0 0 30px 0',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: 'none'
          }}>
            🎮 UNO游戏大厅
          </h1>
        
          <div style={{
            background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
            padding: '25px',
            borderRadius: '15px',
            marginBottom: '25px',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              color: '#495057',
              fontSize: '1.3em',
              fontWeight: '600'
            }}>
              🎯 游戏模式
            </h3>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                marginRight: '25px',
                display: 'inline-flex',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: '1.1em',
                fontWeight: '500'
              }}>
                <input
                  type="radio"
                  value="local"
                  checked={gameMode === 'local'}
                  onChange={() => this.handleGameModeChange('local')}
                  style={{
                    marginRight: '8px',
                    transform: 'scale(1.2)'
                  }}
                />
                🏠 本地游戏 (热座模式)
              </label>
              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: '1.1em',
                fontWeight: '500'
              }}>
                <input
                  type="radio"
                  value="online"
                  checked={gameMode === 'online'}
                  onChange={() => this.handleGameModeChange('online')}
                  style={{
                    marginRight: '8px',
                    transform: 'scale(1.2)'
                  }}
                />
                🌐 在线多人游戏
              </label>
            </div>

            <h3 style={{
              margin: '0 0 20px 0',
              color: '#495057',
              fontSize: '1.3em',
              fontWeight: '600'
            }}>
              ⚙️ 游戏设置
            </h3>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '15px',
                fontSize: '1.1em',
                fontWeight: '500',
                color: '#495057'
              }}>
                👥 玩家数量:
                <select
                  value={numPlayers}
                  onChange={(e) => this.handleNumPlayersChange(e.target.value)}
                  style={{
                    marginLeft: '15px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '2px solid #dee2e6',
                    fontSize: '1em',
                    fontWeight: '500',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option value={2}>2 名玩家</option>
                  <option value={3}>3 名玩家</option>
                  <option value={4}>4 名玩家</option>
                  <option value={5}>5 名玩家</option>
                  <option value={6}>6 名玩家</option>
                  <option value={7}>7 名玩家</option>
                  <option value={8}>8 名玩家</option>
                  <option value={9}>9 名玩家</option>
                  <option value={10}>10 名玩家</option>
                </select>
              </label>

              <label style={{
                display: 'block',
                marginBottom: '15px',
                fontSize: '1.1em',
                fontWeight: '500',
                color: '#495057'
              }}>
                🎭 你的玩家ID:
                <select
                  value={playerID}
                  onChange={(e) => this.handlePlayerIDChange(e.target.value)}
                  style={{
                    marginLeft: '15px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '2px solid #dee2e6',
                    fontSize: '1em',
                    fontWeight: '500',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                >
                  {Array.from({ length: numPlayers }, (_, i) => (
                    <option key={i} value={i.toString()}>玩家 {i}</option>
                  ))}
                </select>
              </label>

              {gameMode === 'online' && (
                <label style={{
                  display: 'block',
                  marginBottom: '15px',
                  fontSize: '1.1em',
                  fontWeight: '500',
                  color: '#495057'
                }}>
                  📝 玩家昵称:
                  <input
                    type="text"
                    value={this.state.playerName}
                    onChange={(e) => this.handlePlayerNameChange(e.target.value)}
                    placeholder="请输入你的昵称"
                    style={{
                      marginLeft: '15px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '2px solid #dee2e6',
                      fontSize: '1em',
                      fontWeight: '500',
                      backgroundColor: 'white',
                      minWidth: '200px'
                    }}
                  />
                </label>
              )}
            </div>

            <div style={{ textAlign: 'center' }}>
              {gameMode === 'local' ? (
                <button
                  onClick={this.startLocalGame}
                  style={{
                    background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                    color: 'white',
                    padding: '18px 40px',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1.2em',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(76, 175, 80, 0.3)',
                    transition: 'all 0.3s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(76, 175, 80, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.3)';
                  }}
                >
                  🚀 开始本地游戏
                </button>
              ) : (
                <button
                  onClick={this.joinOnlineGame}
                  disabled={!this.state.playerName.trim()}
                  style={{
                    background: this.state.playerName.trim()
                      ? 'linear-gradient(135deg, #2196F3, #1976D2)'
                      : '#ccc',
                    color: 'white',
                    padding: '18px 40px',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1.2em',
                    fontWeight: '600',
                    cursor: this.state.playerName.trim() ? 'pointer' : 'not-allowed',
                    boxShadow: this.state.playerName.trim()
                      ? '0 6px 20px rgba(33, 150, 243, 0.3)'
                      : 'none',
                    transition: 'all 0.3s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    opacity: this.state.playerName.trim() ? 1 : 0.6
                  }}
                  onMouseOver={(e) => {
                    if (this.state.playerName.trim()) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(33, 150, 243, 0.4)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (this.state.playerName.trim()) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.3)';
                    }
                  }}
                >
                  🌐 加入在线游戏
                </button>
              )}
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
            padding: '25px',
            borderRadius: '15px',
            fontSize: '15px',
            marginTop: '25px',
            border: '1px solid rgba(33, 150, 243, 0.2)',
            boxShadow: '0 4px 15px rgba(33, 150, 243, 0.1)'
          }}>
            <h4 style={{
              margin: '0 0 15px 0',
              color: '#1976D2',
              fontSize: '1.3em',
              fontWeight: '600'
            }}>
              📖 UNO游戏规则:
            </h4>
            <ul style={{
              margin: '0',
              paddingLeft: '25px',
              lineHeight: '1.8',
              color: '#424242'
            }}>
              <li><strong>🎯 基本规则:</strong> 出牌必须与顶牌的颜色或数字/符号匹配</li>
              <li><strong>🌈 万能牌:</strong> 可以随时出牌，并可以选择下一张牌的颜色</li>
              <li><strong>⚡ 功能牌:</strong> 跳过 (⊘)、反转 (⇄)、罚抽2张 (+2)</li>
              <li><strong>🎯 UNO规则:</strong> 剩余一张牌时必须喊"UNO"！</li>
              <li><strong>📢 指出UNO:</strong> 其他玩家可以指出忘记喊UNO的玩家</li>
              <li><strong>🏆 获胜条件:</strong> 第一个出完所有牌的玩家获胜！</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

// Simple singleplayer component
const UnoSingleplayer = () => (
  <UnoClient playerID="0" numPlayers={2} />
);

// Simple multiplayer component
const UnoMultiplayer = () => (
  <UnoMultiplayerClient playerID="0" />
);

// Routes configuration for the main app
const routes = [
  {
    path: '/',
    text: 'Lobby',
    component: UnoLobby,
  },
  {
    path: '/singleplayer',
    text: 'Singleplayer',
    component: UnoSingleplayer,
  },
  {
    path: '/multiplayer',
    text: 'Multiplayer',
    component: UnoMultiplayer,
  },
];

// Export components for use in other parts of the app
export default { routes };
export { UnoLobby, UnoClient, UnoMultiplayerClient, UnoGame, UnoBoard };
