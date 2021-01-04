import type { Object } from 'ts-toolbelt';
import type { State, Server, LogEntry } from '../../types';

export enum Type {
  SYNC = 0,
  ASYNC = 1,
}

/**
 * Type guard that checks if a storage implementation is synchronous.
 */
export function isSynchronous(storageAPI: Sync | Async): storageAPI is Sync {
  return storageAPI.type() === Type.SYNC;
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
  metadata: Server.MatchData;
  initialState: State;
}

/**
 * The result of the fetch operation.
 */
export type FetchResult<O extends FetchOpts> = Object.Pick<
  FetchFields,
  Object.SelectKeys<O, true>
>;

/**
 * Options passed when listing matches.
 */
export interface ListMatchesOpts {
  gameName?: string;
  where?: {
    isGameover?: boolean;
    updatedBefore?: number;
    updatedAfter?: number;
  };
}

/**
 * @deprecated Use ListMatchesOpts instead
 */
export interface ListGamesOpts {
  gameName?: string;
  where?: {
    isGameover?: boolean;
    updatedBefore?: number;
    updatedAfter?: number;
  };
}

/**
 * Options passed when creating a new match.
 */
export interface CreateMatchOpts {
  initialState: State;
  metadata: Server.MatchData;
}

/**
 * @deprecated Use CreateMatchOpts instead
 */
export interface CreateGameOpts {
  initialState: State;
  metadata: Server.MatchData;
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
   * Create a new match.
   *
   * This might just need to call setState and setMetadata in
   * most implementations.
   *
   * However, it exists as a separate call so that the
   * implementation can provision things differently when
   * a match is created.  For example, it might stow away the
   * initial match state in a separate field for easier retrieval.
   */
  /* istanbul ignore next */
  async createMatch(matchID: string, opts: CreateMatchOpts): Promise<void> {
    if (this.createGame) {
      console.warn(
        'The database connector does not implement a createMatch method.',
        '\nUsing the deprecated createGame method instead.'
      );
      return this.createGame(matchID, opts);
    } else {
      console.error(
        'The database connector does not implement a createMatch method.'
      );
    }
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
   *
   * @deprecated Use createMatch instead, if implemented
   */
  async createGame?(matchID: string, opts: CreateGameOpts): Promise<void>;

  /**
   * Update the game state.
   *
   * If passed a deltalog array, setState should append its contents to the
   * existing log for this game.
   */
  abstract setState(
    matchID: string,
    state: State,
    deltalog?: LogEntry[]
  ): Promise<void>;

  /**
   * Update the game metadata.
   */
  abstract setMetadata(
    matchID: string,
    metadata: Server.MatchData
  ): Promise<void>;

  /**
   * Fetch the game state.
   */
  abstract fetch<O extends FetchOpts>(
    matchID: string,
    opts: O
  ): Promise<FetchResult<O>>;

  /**
   * Remove the game state.
   */
  abstract wipe(matchID: string): Promise<void>;

  /**
   * Return all matches.
   */
  /* istanbul ignore next */
  async listMatches(opts?: ListMatchesOpts): Promise<string[]> {
    if (this.listGames) {
      console.warn(
        'The database connector does not implement a listMatches method.',
        '\nUsing the deprecated listGames method instead.'
      );
      return this.listGames(opts);
    } else {
      console.error(
        'The database connector does not implement a listMatches method.'
      );
    }
  }

  /**
   * Return all games.
   *
   * @deprecated Use listMatches instead, if implemented
   */
  async listGames?(opts?: ListGamesOpts): Promise<string[]>;
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
   * Create a new match.
   *
   * This might just need to call setState and setMetadata in
   * most implementations.
   *
   * However, it exists as a separate call so that the
   * implementation can provision things differently when
   * a match is created.  For example, it might stow away the
   * initial match state in a separate field for easier retrieval.
   */
  /* istanbul ignore next */
  createMatch(matchID: string, opts: CreateMatchOpts): void {
    if (this.createGame) {
      console.warn(
        'The database connector does not implement a createMatch method.',
        '\nUsing the deprecated createGame method instead.'
      );
      return this.createGame(matchID, opts);
    } else {
      console.error(
        'The database connector does not implement a createMatch method.'
      );
    }
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
   *
   * @deprecated Use createMatch instead, if implemented
   */
  createGame?(matchID: string, opts: CreateGameOpts): void;

  /**
   * Update the match state.
   *
   * If passed a deltalog array, setState should append its contents to the
   * existing log for this match.
   */
  abstract setState(matchID: string, state: State, deltalog?: LogEntry[]): void;

  /**
   * Update the match metadata.
   */
  abstract setMetadata(matchID: string, metadata: Server.MatchData): void;

  /**
   * Fetch the match state.
   */
  abstract fetch<O extends FetchOpts>(matchID: string, opts: O): FetchResult<O>;

  /**
   * Remove the match state.
   */
  abstract wipe(matchID: string): void;

  /**
   * Return all matches.
   */
  /* istanbul ignore next */
  listMatches(opts?: ListMatchesOpts): string[] {
    if (this.listGames) {
      console.warn(
        'The database connector does not implement a listMatches method.',
        '\nUsing the deprecated listGames method instead.'
      );
      return this.listGames(opts);
    } else {
      console.error(
        'The database connector does not implement a listMatches method.'
      );
    }
  }

  /**
   * Return all games.
   *
   * @deprecated Use listMatches instead, if implemented
   */
  listGames?(opts?: ListGamesOpts): string[];
}
