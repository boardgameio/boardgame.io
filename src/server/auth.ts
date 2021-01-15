import { nanoid } from 'nanoid';
import type { Server, PlayerID } from '../types';

/**
 * Verifies that a match has metadata and is using credentials.
 */
export const doesMatchRequireAuthentication = (
  matchData?: Server.MatchData
) => {
  if (!matchData) return false;
  const { players } = matchData;
  const hasCredentials = Object.values(players).some(
    (player) => !!(player && player.credentials)
  );
  return hasCredentials;
};

/**
 * The default `authenticateCredentials` method.
 * Verifies that the provided credentials match the player’s metadata.
 */
export const areCredentialsAuthentic: Server.AuthenticateCredentials = (
  actionCredentials: string,
  playerMetadata?: Server.PlayerMetadata
) => {
  if (!actionCredentials) return false;
  if (!playerMetadata) return false;
  return actionCredentials === playerMetadata.credentials;
};

/**
 * Extracts a player’s metadata from the match data object.
 */
export const extractPlayerMetadata = (
  matchData: Server.MatchData,
  playerID: PlayerID
): Server.PlayerMetadata => {
  if (matchData && matchData.players) {
    return matchData.players[playerID];
  }
};

/**
 * Class that provides authentication methods to the lobby server & transport.
 */
export class Auth {
  private readonly shouldAuthenticate = doesMatchRequireAuthentication;
  private readonly authenticate = areCredentialsAuthentic;

  /**
   * Generate credentials string from the Koa context.
   */
  public readonly generateCredentials: Server.GenerateCredentials = () =>
    nanoid();

  constructor(
    opts: {
      authenticateCredentials?: Server.AuthenticateCredentials;
      generateCredentials?: Server.GenerateCredentials;
    } = {}
  ) {
    if (typeof opts.authenticateCredentials === 'function') {
      this.authenticate = opts.authenticateCredentials;
      this.shouldAuthenticate = () => true;
    }
    if (typeof opts.generateCredentials === 'function') {
      this.generateCredentials = opts.generateCredentials;
    }
  }

  /**
   * Resolves to true if the provided credentials are valid for the given
   * metadata and player IDs, or if the match does not require authentication.
   */
  public authenticateCredentials({
    playerID,
    credentials,
    metadata,
  }: {
    playerID: string;
    credentials: string | undefined;
    metadata: Server.MatchData;
  }) {
    const playerMetadata = extractPlayerMetadata(metadata, playerID);
    return this.shouldAuthenticate(metadata)
      ? this.authenticate(credentials, playerMetadata)
      : true;
  }
}
