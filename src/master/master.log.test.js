import Game from '../core/game';
import * as ActionCreators from '../core/action-creators';
import { InMemory } from '../server/db/inmemory';
import { FlowWithPhases } from '../core/flow';

function TransportAPI(send = jest.fn(), sendAll = jest.fn()) {
  return { send, sendAll };
}

describe('master log', () => {
  console.log = jest.fn();
  const { GameMaster } = require('./master');

  const game = Game({
    seed: 0,
    flow: FlowWithPhases({ setActionPlayers: true }),
  });
  const storage = new InMemory();
  const master = new GameMaster(game, storage, TransportAPI());

  beforeAll(async () => {
    await master.onSync('gameID', '0');
  });

  const endTurnEvent = ActionCreators.gameEvent('endTurn');

  beforeAll(async () => {
    // create game called "gameID"
    await master.onSync('gameID');
  });

  test('writes log when gameID not found', async () => {
    await master.onUpdate(endTurnEvent, 1, 'unknown', '0');
    expect(console.log).toHaveBeenCalledWith(
      `ERROR: game not found, gameID=[unknown]`
    );
  });

  test('writes log on an invalid stateID', async () => {
    await master.onUpdate(endTurnEvent, 100, 'gameID', '0');
    expect(console.log).toHaveBeenCalledWith(
      `ERROR: invalid stateID, was=[100], expected=[0]`
    );
  });

  test('writes log when a player is not on turn', async () => {
    await master.onUpdate(endTurnEvent, 0, 'gameID', '100');
    expect(console.log).toHaveBeenCalledWith(
      `ERROR: event not processed - invalid playerID=[100]`
    );
  });

  test('writes log when player is not an action player', async () => {
    const setActionPlayersEvent = ActionCreators.gameEvent('setActionPlayers', [
      '1',
    ]);
    await master.onUpdate(setActionPlayersEvent, 0, 'gameID', '0');

    const move = ActionCreators.makeMove('move');
    await master.onUpdate(move, 1, 'gameID', '0');
    expect(console.log).toHaveBeenCalledWith(
      `ERROR: move not processed - canPlayerMakeMove=false, playerID=[0]`
    );
  });
});
