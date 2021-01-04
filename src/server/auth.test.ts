import {
  extractPlayerMetadata,
  doesMatchRequireAuthentication,
  areCredentialsAuthentic,
  Auth,
} from './auth';

import type { Server } from '../types';

describe('extractPlayerMetadata', () => {
  describe('when metadata is not found', () => {
    test('then playerMetadata is undefined', () => {
      expect(extractPlayerMetadata(undefined, '0')).toBeUndefined();
    });
  });

  describe('when metadata does not contain players field', () => {
    test('then playerMetadata is undefined', () => {
      expect(
        extractPlayerMetadata({} as Server.MatchData, '0')
      ).toBeUndefined();
    });
  });

  describe('when metadata does not contain playerID', () => {
    test('then playerMetadata is undefined', () => {
      expect(
        extractPlayerMetadata(
          {
            gameName: '',
            setupData: {},
            players: { '1': { id: 1 } },
            createdAt: 0,
            updatedAt: 0,
          },
          '0'
        )
      ).toBeUndefined();
    });
  });

  describe('when metadata contains playerID', () => {
    test('then playerMetadata is returned', () => {
      const playerMetadata = { id: 0, credentials: 'SECRET' };
      const result = extractPlayerMetadata(
        {
          gameName: '',
          setupData: {},
          players: { '0': playerMetadata },
          createdAt: 0,
          updatedAt: 0,
        },
        '0'
      );
      expect(result).toBe(playerMetadata);
    });
  });
});

describe('doesMatchRequireAuthentication', () => {
  describe('when game metadata is not found', () => {
    test('then authentication is not required', () => {
      const result = doesMatchRequireAuthentication();
      expect(result).toBe(false);
    });
  });

  describe('when match has no credentials', () => {
    test('then authentication is not required', () => {
      const matchData = {
        gameName: '',
        setupData: {},
        players: {
          '0': { id: 1 },
        },
        createdAt: 0,
        updatedAt: 0,
      };
      const result = doesMatchRequireAuthentication(matchData);
      expect(result).toBe(false);
    });
  });

  describe('when match has credentials', () => {
    test('then authentication is required', () => {
      const matchData = {
        gameName: '',
        setupData: {},
        players: {
          '0': {
            id: 0,
            credentials: 'SECRET',
          },
        },
        createdAt: 0,
        updatedAt: 0,
      };
      const result = doesMatchRequireAuthentication(matchData);
      expect(result).toBe(true);
    });
  });
});

describe('areCredentialsAuthentic', () => {
  let action;
  let playerID;
  let matchData;
  let credentials;
  let playerMetadata;

  beforeEach(() => {
    playerID = '0';

    action = {
      payload: { credentials: 'SECRET' },
    };

    matchData = {
      players: {
        '0': { credentials: 'SECRET' },
      },
    };

    playerMetadata = matchData.players[playerID];
    ({ credentials } = action.payload || {});
  });

  describe('when game has credentials', () => {
    describe('when action contains no payload', () => {
      beforeEach(() => {
        action = {};
        ({ credentials } = action.payload || {});
      });

      test('the action is not authentic', async () => {
        const result = areCredentialsAuthentic(credentials, playerMetadata);
        expect(result).toBe(false);
      });
    });

    describe('when action contains no credentials', () => {
      beforeEach(() => {
        action = {
          payload: { someStuff: 'foo' },
        };
        ({ credentials } = action.payload || {});
      });

      test('then action is not authentic', async () => {
        const result = areCredentialsAuthentic(credentials, playerMetadata);
        expect(result).toBe(false);
      });
    });

    describe('when action credentials do not match game credentials', () => {
      beforeEach(() => {
        action = {
          payload: { credentials: 'WRONG' },
        };
        ({ credentials } = action.payload || {});
      });
      test('then action is not authentic', async () => {
        const result = areCredentialsAuthentic(credentials, playerMetadata);
        expect(result).toBe(false);
      });
    });

    describe('when playerMetadata is not found', () => {
      test('then action is not authentic', () => {
        const result = areCredentialsAuthentic(credentials, undefined);
        expect(result).toBe(false);
      });
    });

    describe('when action credentials do match game credentials', () => {
      test('then action is authentic', async () => {
        const result = areCredentialsAuthentic(credentials, playerMetadata);
        expect(result).toBe(true);
      });
    });
  });
});

describe('Auth', () => {
  const credentials = 'credentials';
  const playerData = { id: 0, credentials };
  const metadata = {
    gameName: '',
    players: { '0': playerData },
    createdAt: 0,
    updatedAt: 0,
  };

  describe('defaults', () => {
    const auth = new Auth();

    test('generateCredentials', () => {
      expect(typeof auth.generateCredentials({})).toBe('string');
    });

    test('authenticateCredentials', () => {
      expect(
        auth.authenticateCredentials({ playerID: '0', metadata, credentials })
      ).toBe(true);
    });
  });

  describe('ignores bad options', () => {
    const auth = new Auth({
      generateCredentials: 'foo',
      authenticateCredentials: 'bar',
    } as any);

    test('generateCredentials', () => {
      expect(typeof auth.generateCredentials({})).toBe('string');
    });

    test('authenticateCredentials', () => {
      expect(
        auth.authenticateCredentials({ playerID: '0', metadata, credentials })
      ).toBe(true);
    });
  });

  describe('custom methods', () => {
    const generateCredentials = jest.fn(() => credentials);
    const authenticateCredentials = jest.fn(() => true);
    const auth = new Auth({ generateCredentials, authenticateCredentials });

    test('generateCredentials', () => {
      const ctx = {};
      expect(auth.generateCredentials(ctx)).toBe(credentials);
      expect(generateCredentials).toHaveBeenCalledWith(ctx);
    });

    test('authenticateCredentials', () => {
      expect(
        auth.authenticateCredentials({ playerID: '0', metadata, credentials })
      ).toBe(true);
      expect(authenticateCredentials).toHaveBeenCalledWith(
        credentials,
        playerData
      );
    });
  });

  describe('async', () => {
    const generateCredentials = jest.fn(async () => credentials);
    const authenticateCredentials = jest.fn(async () => true);
    const auth = new Auth({ generateCredentials, authenticateCredentials });

    test('generateCredentials', async () => {
      const ctx = {};
      const promise = auth.generateCredentials(ctx);
      expect(promise).toBeInstanceOf(Promise);
      expect(generateCredentials).toHaveBeenCalledWith(ctx);
      expect(await promise).toBe(credentials);
    });

    test('authenticateCredentials', async () => {
      const promise = auth.authenticateCredentials({
        playerID: '0',
        metadata,
        credentials,
      });

      expect(promise).toBeInstanceOf(Promise);
      expect(authenticateCredentials).toHaveBeenCalledWith(
        credentials,
        playerData
      );
      expect(await promise).toBe(true);
    });
  });
});
