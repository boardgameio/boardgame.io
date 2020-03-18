import { Object } from 'ts-toolbelt';
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
 * Data that can be retrieved from a database fetch query
 */
export interface FetchFields {
  state: State;
  log: LogEntry[];
  metadata: Server.GameMetadata;
}

/**
 * The result of the fetch operation.
 */
export type FetchResult<O extends FetchOpts> = Object.Pick<
  FetchFields,
  Object.SelectKeys<O, true>
>;

export interface ListGamesOpts {
  gameName?: string;
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
   * Update the game metadata.
   */
  abstract setMetadata(
    gameID: string,
    metadata: Server.GameMetadata
  ): Promise<void>;

  /**
   * Fetch the game state.
   */
  abstract fetch<O extends FetchOpts>(
    gameID: string,
    opts: O
  ): Promise<FetchResult<O>>;

  /**
   * Remove the game state.
   */
  abstract wipe(gameID: string): Promise<void>;

  /**
   * Return all games.
   */
  abstract listGames(opts: ListGamesOpts): Promise<string[]>;
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
   * Update the game metadata.
   */
  abstract setMetadata(gameID: string, metadata: Server.GameMetadata): void;

  /**
   * Fetch the game state.
   */
  abstract fetch<O extends FetchOpts>(gameID: string, opts: O): FetchResult<O>;

  /**
   * Remove the game state.
   */
  abstract wipe(gameID: string): void;

  /**
   * Return all games.
   */
  abstract listGames(opts: ListGamesOpts): string[];
}
