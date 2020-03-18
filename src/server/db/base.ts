import { State, Server, LogEntry } from '../../types';

export enum Type {
  SYNC = 0,
  ASYNC = 1,
}

/**
 * Indicates which fields the fetch operation should return.
 */
export interface FetchOpts {
  state?: boolean;
  log?: boolean;
  metadata?: boolean;
}

/**
 * The result of the fetch operation.
 */
export interface FetchResult {
  state?: State;
  log?: LogEntry[];
  metadata?: Server.GameMetadata;
}

export abstract class Async {
  /* istanbul ignore next */
  type() {
    /* istanbul ignore next */
    return Type.ASYNC;
  }

  /**
   * Connect.
   */
  abstract connect();

  /**
   * Update the game state.
   */
  abstract setState(gameID: string, state: State): Promise<void>;

  /**
   * Fetch the game state.
   */
  abstract fetch(gameID: string, opts: FetchOpts): Promise<FetchResult>;

  /**
   * Update the game metadata.
   */
  abstract setMetadata(
    gameID: string,
    metadata: Server.GameMetadata
  ): Promise<void>;

  /**
   * Remove the game state.
   */
  abstract remove(gameID: string): Promise<void>;

  /**
   * Return all games.
   */
  abstract listGames(gameName?: string): Promise<string[]>;
}

export abstract class Sync {
  type() {
    return Type.SYNC;
  }

  /**
   * Connect.
   */
  connect() {
    return;
  }

  /**
   * Update the game state.
   */
  abstract setState(gameID: string, state: State): void;

  /**
   * Fetch the game state.
   */
  abstract fetch(gameID: string, opts: FetchOpts): FetchResult;

  /**
   * Update the game metadata.
   */
  abstract setMetadata(gameID: string, metadata: Server.GameMetadata): void;

  /**
   * Remove the game state.
   */
  abstract remove(gameID: string): void;

  /**
   * Return all games.
   */
  abstract listGames(gameName?: string): Array<string>;
}
