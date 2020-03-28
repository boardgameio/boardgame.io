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
  initialState?: boolean;
}

/**
 * Data that can be retrieved from a database fetch query
 */
export interface FetchFields {
  state: State;
  log: LogEntry[];
  metadata: Server.GameMetadata;
  initialState: State;
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

/**
 * Options passed when creating a new game.
 */
export interface CreateGameOpts {
  initialState: State;
  metadata: Server.GameMetadata;
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
   * Create a new game.
   *
   * This might just need to call setState and setMetadata in
   * most implementations.
   *
   * However, it exists as a separate call so that the
   * implementation can provision things differently when
   * a game is created.  For example, it might stow away the
   * initial game state in a separate field for easier retrieval.
   */
  abstract createGame(gameID: string, opts: CreateGameOpts): Promise<void>;

  /**
   * Update the game state.
   *
   * If passed a deltalog array, setState should append its contents to the
   * existing log for this game.
   */
  abstract setState(
    gameID: string,
    state: State,
    deltalog?: LogEntry[]
  ): Promise<void>;

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
  abstract listGames(opts?: ListGamesOpts): Promise<string[]>;
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
   * Create a new game.
   *
   * This might just need to call setState and setMetadata in
   * most implementations.
   *
   * However, it exists as a separate call so that the
   * implementation can provision things differently when
   * a game is created.  For example, it might stow away the
   * initial game state in a separate field for easier retrieval.
   */
  abstract createGame(gameID: string, opts: CreateGameOpts): void;

  /**
   * Update the game state.
   *
   * If passed a deltalog array, setState should append its contents to the
   * existing log for this game.
   */
  abstract setState(gameID: string, state: State, deltalog?: LogEntry[]): void;

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
  abstract listGames(opts?: ListGamesOpts): string[];
}
