import { Server, Game } from '../types';

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
