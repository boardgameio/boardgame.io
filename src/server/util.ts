import { InitializeGame } from '../core/initialize';
import type { Server, State, Game } from '../types';

/**
 * Creates a new match metadata object.
 */
export const createMetadata = ({
  game,
  unlisted,
  setupData,
  numPlayers,
}: {
  game: Game;
  numPlayers: number;
  setupData?: any;
  unlisted?: boolean;
}): Server.MatchData => {
  const metadata: Server.MatchData = {
    gameName: game.name,
    unlisted: !!unlisted,
    players: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  if (setupData !== undefined) metadata.setupData = setupData;

  for (let playerIndex = 0; playerIndex < numPlayers; playerIndex++) {
    metadata.players[playerIndex] = { id: playerIndex };
  }

  return metadata;
};

/**
 * Creates matchID, initial state and metadata for a new match.
 * If the provided `setupData` doesn’t pass the game’s validation,
 * an error object is returned instead.
 */
export const createMatch = ({
  game,
  numPlayers,
  setupData,
  unlisted,
}: {
  game: Game;
  numPlayers: number;
  setupData: any;
  unlisted: boolean;
}):
  | { metadata: Server.MatchData; initialState: State }
  | { setupDataError: string } => {
  if (!numPlayers || typeof numPlayers !== 'number') numPlayers = 2;

  const setupDataError =
    game.validateSetupData && game.validateSetupData(setupData, numPlayers);
  if (setupDataError !== undefined) return { setupDataError };

  const metadata = createMetadata({ game, numPlayers, setupData, unlisted });
  const initialState = InitializeGame({ game, numPlayers, setupData });

  return { metadata, initialState };
};

/**
 * Given players, returns the count of players.
 */
export const getNumPlayers = (players: {
  players: Server.MatchData['players'];
}): number => Object.keys(players).length;

/**
 * Given players, tries to find the first index of player that can be joined. Returns -1 if there's no available index.
 */
export const getFirstAvailablePlayerIndex = (players: {
  [id: number]: Server.PlayerMetadata;
}): number => {
  const numPlayers = getNumPlayers(players);
  let playerID = -1;
  // Try to get the first index available
  for (let i = 0; i < numPlayers; i++) {
    if (typeof players[i].name === 'undefined' || players[i].name === null) {
      return String(i);
    }
  }
};
