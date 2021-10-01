import type { LobbyAPI } from '../types';

const assertString = (str: unknown, label: string) => {
  if (!str || typeof str !== 'string') {
    throw new Error(`Expected ${label} string, got "${str}".`);
  }
};
const assertGameName = (name?: string) => assertString(name, 'game name');
const assertMatchID = (id?: string) => assertString(id, 'match ID');

type JSType =
  | 'string'
  | 'number'
  | 'bigint'
  | 'object'
  | 'boolean'
  | 'symbol'
  | 'function'
  | 'undefined';

const validateBody = (
  body: { [key: string]: any } | undefined,
  schema: { [key: string]: JSType | JSType[] }
) => {
  if (!body) throw new Error(`Expected body, got “${body}”.`);
  for (const key in schema) {
    const propSchema = schema[key];
    const types = Array.isArray(propSchema) ? propSchema : [propSchema];
    const received = body[key];
    if (!types.includes(typeof received)) {
      const union = types.join('|');
      throw new TypeError(
        `Expected body.${key} to be of type ${union}, got “${received}”.`
      );
    }
  }
};

export class LobbyClientError extends Error {
  readonly details: any;

  constructor(message: string, details: any) {
    super(message);
    this.details = details;
  }
}

/**
 * Create a boardgame.io Lobby API client.
 * @param server The API’s base URL, e.g. `http://localhost:8000`.
 */
export class LobbyClient {
  private server: string;

  constructor({ server = '' }: { server?: string } = {}) {
    // strip trailing slash if passed
    this.server = server.replace(/\/$/, '');
  }

  private async request(route: string, init?: RequestInit) {
    const response = await fetch(this.server + route, init);

    if (!response.ok) {
      let details: any;

      try {
        details = await response.clone().json();
      } catch {
        try {
          details = await response.text();
        } catch (error) {
          details = error.message;
        }
      }

      throw new LobbyClientError(`HTTP status ${response.status}`, details);
    }

    return response.json();
  }

  private async post(route: string, opts: { body?: any; init?: RequestInit }) {
    let init: RequestInit = {
      method: 'post',
      body: JSON.stringify(opts.body),
      headers: { 'Content-Type': 'application/json' },
    };
    if (opts.init)
      init = {
        ...init,
        ...opts.init,
        headers: { ...init.headers, ...opts.init.headers },
      };
    return this.request(route, init);
  }

  /**
   * Get a list of the game names available on this server.
   * @param  init Optional RequestInit interface to override defaults.
   * @return Array of game names.
   *
   * @example
   * lobbyClient.listGames()
   *   .then(console.log); // => ['chess', 'tic-tac-toe']
   */
  async listGames(init?: RequestInit): Promise<string[]> {
    return this.request('/games', init);
  }

  /**
   * Get a list of the matches for a specific game type on the server.
   * @param  gameName The game to list for, e.g. 'tic-tac-toe'.
   * @param  where    Options to filter matches by update time or gameover state
   * @param  init     Optional RequestInit interface to override defaults.
   * @return Array of match metadata objects.
   *
   * @example
   * lobbyClient.listMatches('tic-tac-toe', where: { isGameover: false })
   *   .then(data => console.log(data.matches));
   * // => [
   * //   {
   * //     matchID: 'xyz',
   * //     gameName: 'tic-tac-toe',
   * //     players: [{ id: 0, name: 'Alice' }, { id: 1 }]
   * //   },
   * //   ...
   * // ]
   */
  async listMatches(
    gameName: string,
    where?: {
      /**
       * If true, only games that have ended will be returned.
       * If false, only games that have not yet ended will be returned.
       * Leave undefined to receive both finished and unfinished games.
       */
      isGameover?: boolean;
      /**
       * List matches last updated before a specific time.
       * Value should be a timestamp in milliseconds after January 1, 1970.
       */
      updatedBefore?: number;
      /**
       * List matches last updated after a specific time.
       * Value should be a timestamp in milliseconds after January 1, 1970.
       */
      updatedAfter?: number;
    },
    init?: RequestInit
  ): Promise<LobbyAPI.MatchList> {
    assertGameName(gameName);
    let query = '';
    if (where) {
      const queries = [];
      const { isGameover, updatedBefore, updatedAfter } = where;
      if (isGameover !== undefined) queries.push(`isGameover=${isGameover}`);
      if (updatedBefore) queries.push(`updatedBefore=${updatedBefore}`);
      if (updatedAfter) queries.push(`updatedAfter=${updatedAfter}`);
      if (queries.length > 0) query = '?' + queries.join('&');
    }
    return this.request(`/games/${gameName}${query}`, init);
  }

  /**
   * Get metadata for a specific match.
   * @param  gameName The match’s game type, e.g. 'tic-tac-toe'.
   * @param  matchID  Match ID for the match to fetch.
   * @param  init     Optional RequestInit interface to override defaults.
   * @return A match metadata object.
   *
   * @example
   * lobbyClient.getMatch('tic-tac-toe', 'xyz').then(console.log);
   * // => {
   * //   matchID: 'xyz',
   * //   gameName: 'tic-tac-toe',
   * //   players: [{ id: 0, name: 'Alice' }, { id: 1 }]
   * // }
   */
  async getMatch(
    gameName: string,
    matchID: string,
    init?: RequestInit
  ): Promise<LobbyAPI.Match> {
    assertGameName(gameName);
    assertMatchID(matchID);
    return this.request(`/games/${gameName}/${matchID}`, init);
  }

  /**
   * Create a new match for a specific game type.
   * @param  gameName The game to create a match for, e.g. 'tic-tac-toe'.
   * @param  body     Options required to configure match creation.
   * @param  init     Optional RequestInit interface to override defaults.
   * @return An object containing the created `matchID`.
   *
   * @example
   * lobbyClient.createMatch('tic-tac-toe', { numPlayers: 2 })
   *   .then(console.log);
   * // => { matchID: 'xyz' }
   */
  async createMatch(
    gameName: string,
    body: {
      numPlayers: number;
      setupData?: any;
      unlisted?: boolean;
      [key: string]: any;
    },
    init?: RequestInit
  ): Promise<LobbyAPI.CreatedMatch> {
    assertGameName(gameName);
    validateBody(body, { numPlayers: 'number' });
    return this.post(`/games/${gameName}/create`, { body, init });
  }

  /**
   * Join a match using its matchID.
   * @param  gameName The match’s game type, e.g. 'tic-tac-toe'.
   * @param  matchID  Match ID for the match to join.
   * @param  body     Options required to join match.
   * @param  init     Optional RequestInit interface to override defaults.
   * @return Object containing `playerCredentials` for the player who joined.
   *
   * @example
   * lobbyClient.joinMatch('tic-tac-toe', 'xyz', {
   *   playerID: '1',
   *   playerName: 'Bob',
   * }).then(console.log);
   * // => { playerCredentials: 'random-string' }
   */
  async joinMatch(
    gameName: string,
    matchID: string,
    body: {
      playerID: string;
      playerName: string;
      data?: any;
      [key: string]: any;
    },
    init?: RequestInit
  ): Promise<LobbyAPI.JoinedMatch> {
    assertGameName(gameName);
    assertMatchID(matchID);
    validateBody(body, { playerID: 'string', playerName: 'string' });
    return this.post(`/games/${gameName}/${matchID}/join`, { body, init });
  }

  /**
   * Leave a previously joined match.
   * @param  gameName The match’s game type, e.g. 'tic-tac-toe'.
   * @param  matchID  Match ID for the match to leave.
   * @param  body     Options required to leave match.
   * @param  init     Optional RequestInit interface to override defaults.
   * @return Promise resolves if successful.
   *
   * @example
   * lobbyClient.leaveMatch('tic-tac-toe', 'xyz', {
   *   playerID: '1',
   *   credentials: 'credentials-returned-when-joining',
   * })
   *   .then(() => console.log('Left match.'))
   *   .catch(error => console.error('Error leaving match', error));
   */
  async leaveMatch(
    gameName: string,
    matchID: string,
    body: {
      playerID: string;
      credentials: string;
      [key: string]: any;
    },
    init?: RequestInit
  ): Promise<void> {
    assertGameName(gameName);
    assertMatchID(matchID);
    validateBody(body, { playerID: 'string', credentials: 'string' });
    await this.post(`/games/${gameName}/${matchID}/leave`, { body, init });
  }

  /**
   * Update a player’s name or custom metadata.
   * @param  gameName The match’s game type, e.g. 'tic-tac-toe'.
   * @param  matchID  Match ID for the match to update.
   * @param  body     Options required to update player.
   * @param  init     Optional RequestInit interface to override defaults.
   * @return Promise resolves if successful.
   *
   * @example
   * lobbyClient.updatePlayer('tic-tac-toe', 'xyz', {
   *   playerID: '0',
   *   credentials: 'credentials-returned-when-joining',
   *   newName: 'Al',
   * })
   *   .then(() => console.log('Updated player data.'))
   *   .catch(error => console.error('Error updating data', error));
   */
  async updatePlayer(
    gameName: string,
    matchID: string,
    body: {
      playerID: string;
      credentials: string;
      newName?: string;
      data?: any;
      [key: string]: any;
    },
    init?: RequestInit
  ): Promise<void> {
    assertGameName(gameName);
    assertMatchID(matchID);
    validateBody(body, { playerID: 'string', credentials: 'string' });
    await this.post(`/games/${gameName}/${matchID}/update`, { body, init });
  }

  /**
   * Create a new match based on the configuration of the current match.
   * @param  gameName The match’s game type, e.g. 'tic-tac-toe'.
   * @param  matchID  Match ID for the match to play again.
   * @param  body     Options required to configure match.
   * @param  init     Optional RequestInit interface to override defaults.
   * @return Object containing `nextMatchID`.
   *
   * @example
   * lobbyClient.playAgain('tic-tac-toe', 'xyz', {
   *   playerID: '0',
   *   credentials: 'credentials-returned-when-joining',
   * })
   *   .then(({ nextMatchID }) => {
   *     return lobbyClient.joinMatch('tic-tac-toe', nextMatchID, {
   *       playerID: '0',
   *       playerName: 'Al',
   *     })
   *   })
   *   .then({ playerCredentials } => {
   *     console.log(playerCredentials);
   *   })
   *   .catch(console.error);
   */
  async playAgain(
    gameName: string,
    matchID: string,
    body: {
      playerID: string;
      credentials: string;
      unlisted?: boolean;
      [key: string]: any;
    },
    init?: RequestInit
  ): Promise<LobbyAPI.NextMatch> {
    assertGameName(gameName);
    assertMatchID(matchID);
    validateBody(body, { playerID: 'string', credentials: 'string' });
    return this.post(`/games/${gameName}/${matchID}/playAgain`, { body, init });
  }
}
