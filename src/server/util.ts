import { InitializeGame } from '../core/initialize';
import type { Server, State, Game } from '../types';
import type { Auth } from './auth';

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
 * Creates initial state and metadata for a new match.
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
export const getNumPlayers = (players: Server.MatchData['players']): number =>
  Object.keys(players).length;

/**
 * Given players, tries to find the ID of the first player that can be joined.
 * Returns `undefined` if there’s no available ID.
 */
export const getFirstAvailablePlayerID = (
  players: Server.MatchData['players']
): string | undefined => {
  const numPlayers = getNumPlayers(players);
  // Try to get the first index available
  for (let i = 0; i < numPlayers; i++) {
    if (typeof players[i].name === 'undefined' || players[i].name === null) {
      return String(i);
    }
  }
};

/**
 * Add player to a game
 *
 */
export const addPlayerToGame = async (
  ctx,
  playerID: string,
  metadata: Server.MatchData,
  matchID: string,
  data: any,
  auth: Auth,
  playerName?: string
): Promise<{
  metadata: Server.MatchData;
  playerCredentials: string;
  playerID: string;
}> => {
  if (typeof playerID === 'undefined' || playerID === null) {
    playerID = getFirstAvailablePlayerID(metadata.players);
    if (playerID === undefined) {
      const numPlayers = getNumPlayers(metadata.players);
      ctx.throw(
        409,
        `Match ${matchID} reached maximum number of players (${numPlayers})`
      );
    }
  }

  if (!metadata.players[playerID]) {
    ctx.throw(404, 'Player ' + playerID + ' not found');
  }
  if (metadata.players[playerID].name) {
    ctx.throw(409, 'Player ' + playerID + ' not available');
  }

  if (data) {
    metadata.players[playerID].data = data;
  }

  if (playerName) {
    metadata.players[playerID].name = playerName;
  }

  const playerCredentials = await auth.generateCredentials(ctx);
  metadata.players[playerID].credentials = playerCredentials;

  return { metadata, playerCredentials, playerID };
};
