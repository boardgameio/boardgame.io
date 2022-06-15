import type { BotExecutionResult, GameMonitorCallback } from './manager';
import { BotManager } from './manager';
import { Client } from '../client/client';
import { GetBotPlayer } from '../client/transport/local';

jest.mock('../core/logger', () => ({
  info: () => {},
  error: () => {},
}));

jest.mock('../client/client', () => ({
  Client: jest.fn(),
}));

jest.mock('../client/transport/local', () => ({
  GetBotPlayer: jest.fn(),
}));

const mockClient = <jest.Mock<any, any>>Client;
const mockGetBotPlayer = <jest.Mock<any, any>>GetBotPlayer;
describe('Bot manager', () => {
  const gameName = 'testGame';
  const game = {
    moves: { A: (G, ctx) => ({ A: ctx.playerID }) },
    name: gameName,
  };
  const mockClientImpl = {
    start: jest.fn(),
    subscribe: jest.fn(),
  };
  const runBot = jest.fn();
  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  it('creates new BotManager instance', () => {
    const botManager = new BotManager([game], runBot);
    expect(botManager).toBeDefined();
  });
  it('adds single bot to game', () => {
    const botManager = new BotManager([game], runBot);
    mockClient.mockReturnValue(mockClientImpl);
    expect(mockClient).not.toBeCalled();
    expect(mockClientImpl.start).not.toBeCalled();
    expect(mockClientImpl.subscribe).not.toBeCalled();
    botManager.addBotToGame(gameName, 'testMatchId', [
      { playerID: 'p1', playerCredentials: 'pc1' },
    ]);
    expect(mockClient).toBeCalled();
    expect(mockClientImpl.start).toBeCalled();
    expect(mockClientImpl.subscribe).toBeCalled();
  });
  it('adds multiple bots to game', () => {
    const botManager = new BotManager([game], runBot);
    mockClient.mockReturnValue(mockClientImpl);
    expect(mockClient).not.toBeCalled();
    expect(mockClientImpl.start).not.toBeCalled();
    expect(mockClientImpl.subscribe).not.toBeCalled();
    botManager.addBotToGame(gameName, 'testMatchId', [
      { playerID: 'p1', playerCredentials: 'pc1' },
      { playerID: 'p2', playerCredentials: 'pc2' },
      { playerID: 'p3', playerCredentials: 'pc3' },
    ]);
    expect(mockClient).toBeCalled();
    expect(mockClientImpl.start).toBeCalledTimes(3);
    expect(mockClientImpl.subscribe).toBeCalledTimes(3);
  });
  it('calls runBot when its bots turn', async () => {
    const moveName = 'testMove';
    const moveArgs = { arg1: 1 };
    const executionResult: BotExecutionResult = { moveName, moveArgs };
    runBot.mockResolvedValueOnce(executionResult);
    const botManager = new BotManager([game], runBot);
    const clientP1 = {
      start: jest.fn(),
      subscribe: jest.fn(),
    };
    const clientP2 = {
      name: 'client2',
      start: jest.fn(),
      subscribe: jest.fn(),
      moves: {
        [moveName]: jest.fn(),
      },
    };
    const clientP3 = {
      start: jest.fn(),
      subscribe: jest.fn(),
    };
    mockClient
      .mockReturnValueOnce(clientP1)
      .mockReturnValueOnce(clientP2)
      .mockReturnValueOnce(clientP3);

    botManager.addBotToGame(gameName, 'testMatchId', [
      { playerID: 'p1', playerCredentials: 'pc1' },
      { playerID: 'p2', playerCredentials: 'pc2' },
      { playerID: 'p3', playerCredentials: 'pc3' },
    ]);
    const gameMonitor: GameMonitorCallback =
      clientP2.subscribe.mock.calls[0][0];

    mockGetBotPlayer.mockReturnValue('p2');

    // fake a game state update
    const state = { data: 'testData' };
    await gameMonitor(state as any);

    expect(runBot).toBeCalledWith(state);
    expect(clientP2.moves[moveName]).toBeCalledWith(moveArgs);
  });
});
