import { State, Server } from '../../types';

export abstract class StorageAPI {
  /**
   * Connect.
   */
  abstract connect();

  /**
   * Update the game state.
   */
  abstract setState(gameID: string, state: State): Promise<void>;

  /**
   * Read the latest game state.
   */
  abstract getState(gameID: string): Promise<State>;

  /**
   * Check if a particular game id exists.
   */
  abstract has(gameID: string): Promise<boolean>;

  /**
   * Update the game metadata.
   */
  abstract setMetadata(
    gameID: string,
    metadata: Server.GameMetadata
  ): Promise<void>;

  /**
   * Fetch the game metadata.
   */
  abstract getMetadata(gameID: string): Promise<Server.GameMetadata>;

  /**
   * Remove the game state.
   */
  abstract remove(gameID: string): Promise<void>;

  /**
   * Return all games.
   */
  abstract list(): Promise<string[]>;
}

/**
 * Synchronous version of the above.
 */
export abstract class StorageAPISync {
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
   * Read the latest game state.
   */
  abstract getState(gameID: string): State;

  /**
   * Check if a particular game id exists.
   */
  abstract has(gameID: string): boolean;

  /**
   * Update the game metadata.
   */
  abstract setMetadata(gameID: string, metadata: Server.GameMetadata): void;

  /**
   * Fetch the game metadata.
   */
  abstract getMetadata(gameID: string): Server.GameMetadata;

  /**
   * Remove the game state.
   */
  abstract remove(gameID: string): void;

  /**
   * Return all games.
   */
  abstract list(): Array<string>;
}
