import type { ClientState, _ClientImpl } from '../client/client';
import { Client } from '../client/client';
import { GetBotPlayer } from '../client/transport/local';
import { SocketIO } from '../client/transport/socketio';
import type { Game } from '../types';
import type { State } from '../types';
import { BotCreationRequest } from './botserver';

export interface BotExecutionResult {
  moveName: string;
  moveArgs: any;
}

export type BotCallback = (state: State) => Promise<BotExecutionResult>;
export type GameMonitorCallback = (state: State) => Promise<void>;

export class BotManager {
  private clients: Map<string, Map<string, _ClientImpl>>;
  constructor(
    private games: Game[],
    private runBot: BotCallback,
    private masterServerHost: string
  ) {
    this.clients = new Map();
  }

  private saveClient(
    matchID: string,
    playerID: string,
    client: _ClientImpl
  ): void {
    if (!this.clients.has(matchID)) {
      this.clients.set(matchID, new Map());
    }

    this.clients.get(matchID).set(playerID, client);
  }

  private getClient(matchID: string, playerID: string): _ClientImpl {
    if (this.clients.has(matchID)) {
      return this.clients.get(matchID).get(playerID);
    }
  }

  addBotsToGame(params: BotCreationRequest): void {
    const { gameName, matchID, botOptsList } = params;
    const game = this.games.find((game) => game.name === gameName);
    for (const botOpts of botOptsList) {
      const { playerID, playerCredentials } = botOpts;

      const client = Client({
        game,
        multiplayer: SocketIO({
          server: this.masterServerHost,
        }),
        playerID,
        matchID,
        credentials: playerCredentials,
        debug: false,
      });

      client.start();
      client.subscribe(this.buildGameMonitor(matchID, playerID));
      this.saveClient(matchID, playerID, client);
    }
    return;
  }

  buildGameMonitor(matchID: string, playerID: string): GameMonitorCallback {
    return async (state: ClientState): Promise<void> => {
      const botIDs = [...this.clients.get(matchID).keys()];
      const botPlayerID = GetBotPlayer(state, botIDs);
      if (botPlayerID) {
        const { moveName, moveArgs } = await this.runBot(state);
        const client = this.getClient(matchID, playerID);
        client.moves[moveName](moveArgs);
      }
      return Promise.resolve(null);
    };
  }
}
