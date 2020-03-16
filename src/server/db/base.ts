import { State, Server } from '../../types';

abstract class StorageAPI {
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

export default StorageAPI;
