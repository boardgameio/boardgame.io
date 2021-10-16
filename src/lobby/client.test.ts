// Tell ESLint about additional assertion methods.
/*
eslint jest/expect-expect: [
  "warn",
  { "assertFunctionNames": ["expect", "throwsWith*", "testBasicBody"] }
]
*/

import { LobbyClient } from './client';

const throwsWithoutBody = (fn: (...args: any) => Promise<any>) => async () => {
  await expect(fn('tic-tac-toe')).rejects.toThrow(
    `Expected body, got “undefined”.`
  );
};

const testStringValidation =
  (fn: (arg: any) => Promise<any>, label: string) => async () => {
    await expect(fn(undefined)).rejects.toThrow(
      `Expected ${label} string, got "undefined".`
    );
    await expect(fn(2)).rejects.toThrow(`Expected ${label} string, got "2".`);
    await expect(fn('')).rejects.toThrow(`Expected ${label} string, got "".`);
  };

const throwsWithInvalidGameName = (fn: (...args: any) => Promise<any>) =>
  testStringValidation(fn, 'game name');

const throwsWithInvalidMatchID = (fn: (...args: any) => Promise<any>) =>
  testStringValidation((matchID: string) => fn('chess', matchID), 'match ID');

const testBasicBody = (fn: (...args: any) => Promise<any>) => async () => {
  await expect(
    fn('chess', '1', { playerID: undefined, credentials: 'pwd' })
  ).rejects.toThrow(
    'Expected body.playerID to be of type string, got “undefined”.'
  );

  await expect(
    fn('chess', '2', { playerID: '0', credentials: 0 as unknown as string })
  ).rejects.toThrow('Expected body.credentials to be of type string, got “0”.');
};

describe('LobbyClient', () => {
  let client = new LobbyClient();

  beforeEach(async () => {
    (global as any).fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => {},
    }));
  });

  describe('construction', () => {
    test('basic', async () => {
      await client.listGames();
      expect(fetch).toBeCalledWith(`/games`, undefined);
    });

    test('with server address', async () => {
      const client = new LobbyClient({ server: 'http://api.io' });
      await client.listGames();
      expect(fetch).toBeCalledWith(`http://api.io/games`, undefined);
    });

    test('with server address with trailing slash', async () => {
      const client = new LobbyClient({ server: 'http://api.io/' });
      await client.listGames();
      expect(fetch).toBeCalledWith(`http://api.io/games`, undefined);
    });
  });

  describe('status errors', () => {
    beforeEach(async () => {
      client = new LobbyClient();
    });

    test('404 throws an error', async () => {
      (global as any).fetch = jest.fn(async () => ({
        ok: false,
        status: 404,
        json: async () => {},
      }));

      await expect(client.listGames()).rejects.toThrow('HTTP status 404');
    });

    test('404 throws an error with json details', async () => {
      (global as any).fetch = jest.fn(async () => ({
        ok: false,
        status: 404,
        clone: () => ({
          json: async () => ({ moreInformation: 'some helpful details' }),
        }),
      }));

      await expect(client.listGames()).rejects.toThrow(
        expect.objectContaining({
          message: 'HTTP status 404',
          details: {
            moreInformation: 'some helpful details',
          },
        })
      );
    });

    test('404 throws an error with text details', async () => {
      (global as any).fetch = jest.fn(async () => ({
        ok: false,
        status: 404,
        json: async () => {
          throw new Error('impossible to parse json');
        },
        text: async () =>
          '<moreInformation>some helpful details</moreInformation>',
      }));

      await expect(client.listGames()).rejects.toThrow(
        expect.objectContaining({
          message: 'HTTP status 404',
          details: '<moreInformation>some helpful details</moreInformation>',
        })
      );
    });

    test('404 throws an error without details', async () => {
      (global as any).fetch = jest.fn(async () => ({
        ok: false,
        status: 404,
        json: async () => {
          throw new Error('impossible to parse json');
        },
        text: async () => {
          throw new Error('something went wrong in the connection');
        },
      }));

      await expect(client.listGames()).rejects.toThrow(
        expect.objectContaining({
          message: 'HTTP status 404',
          details: 'something went wrong in the connection',
        })
      );
    });
  });

  describe('listGames', () => {
    test('calls `/games`', async () => {
      await client.listGames();
      expect(fetch).toBeCalledWith('/games', undefined);
    });

    test('init can be customized', async () => {
      await client.listGames({ headers: { Authorization: 'pwd' } });
      expect(fetch).toBeCalledWith('/games', {
        headers: { Authorization: 'pwd' },
      });
    });
  });

  describe('listMatches', () => {
    test('calls `/games/:name`', async () => {
      await client.listMatches('tic-tac-toe');
      expect(fetch).toBeCalledWith(`/games/tic-tac-toe`, undefined);
    });

    test('validates gameName', throwsWithInvalidGameName(client.listMatches));

    describe('builds filter queries', () => {
      test('kitchen sink', async () => {
        await client.listMatches('chess', {
          isGameover: false,
          updatedBefore: 3000,
          updatedAfter: 1000,
        });
        expect(fetch).toBeCalledWith(
          '/games/chess?isGameover=false&updatedBefore=3000&updatedAfter=1000',
          undefined
        );
      });

      test('isGameover', async () => {
        await client.listMatches('chess', { isGameover: undefined });
        expect(fetch).toBeCalledWith('/games/chess', undefined);
        await client.listMatches('chess', { isGameover: false });
        expect(fetch).toBeCalledWith(
          '/games/chess?isGameover=false',
          undefined
        );
        await client.listMatches('chess', { isGameover: true });
        expect(fetch).toBeCalledWith('/games/chess?isGameover=true', undefined);
      });

      test('updatedBefore', async () => {
        const updatedBefore = 1989;
        await client.listMatches('chess', { updatedBefore });
        expect(fetch).toBeCalledWith(
          '/games/chess?updatedBefore=1989',
          undefined
        );
      });

      test('updatedAfter', async () => {
        const updatedAfter = 1970;
        await client.listMatches('chess', { updatedAfter });
        expect(fetch).toBeCalledWith(
          '/games/chess?updatedAfter=1970',
          undefined
        );
      });
    });
  });

  describe('getMatch', () => {
    test('calls `/games/:name/:id`', async () => {
      await client.getMatch('tic-tac-toe', 'xyz');
      expect(fetch).toBeCalledWith(`/games/tic-tac-toe/xyz`, undefined);
    });

    test('validates gameName', throwsWithInvalidGameName(client.getMatch));
    test('validates matchID', throwsWithInvalidMatchID(client.getMatch));
  });

  describe('createMatch', () => {
    test('calls `/games/:name/create`', async () => {
      await client.createMatch('tic-tac-toe', { numPlayers: 2 });
      expect(fetch).toBeCalledWith(`/games/tic-tac-toe/create`, {
        method: 'post',
        body: '{"numPlayers":2}',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    test('validates gameName', throwsWithInvalidGameName(client.createMatch));

    test('throws without body', throwsWithoutBody(client.createMatch));

    test('validates body', async () => {
      await expect(
        client.createMatch('tic-tac-toe', {
          numPlayers: '12' as unknown as number,
        })
      ).rejects.toThrow(
        'Expected body.numPlayers to be of type number, got “12”.'
      );
    });

    test('init can be customized', async () => {
      await client.createMatch(
        'chess',
        { numPlayers: 2 },
        { headers: { Authorization: 'pwd' } }
      );
      expect(fetch).toBeCalledWith(`/games/chess/create`, {
        method: 'post',
        body: '{"numPlayers":2}',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'pwd',
        },
      });
    });
  });

  describe('joinMatch', () => {
    test('calls `/games/:name/:id/join`', async () => {
      await client.joinMatch('tic-tac-toe', 'xyz', {
        playerID: '0',
        playerName: 'Alice',
      });
      expect(fetch).toBeCalledWith(`/games/tic-tac-toe/xyz/join`, {
        method: 'post',
        body: '{"playerID":"0","playerName":"Alice"}',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    test('validates gameName', throwsWithInvalidGameName(client.joinMatch));
    test('validates matchID', throwsWithInvalidMatchID(client.joinMatch));

    test(
      'throws without body',
      throwsWithoutBody(() => client.joinMatch('chess', 'id', undefined))
    );

    test('validates body', async () => {
      await expect(
        client.joinMatch('tic-tac-toe', 'xyz', {
          playerID: 0 as unknown as string,
          playerName: 'Bob',
        })
      ).rejects.toThrow(
        'Expected body.playerID to be of type string|undefined, got “0”.'
      );

      await expect(
        client.joinMatch('tic-tac-toe', 'xyz', {
          playerID: '0',
          playerName: undefined,
        })
      ).rejects.toThrow(
        'Expected body.playerName to be of type string, got “undefined”.'
      );

      // Allows requests that don’t specify `playerID`.
      await expect(
        client.joinMatch('tic-tac-toe', 'xyz', { playerName: 'Bob' })
      ).resolves.not.toThrow();
    });
  });

  describe('leaveMatch', () => {
    test('calls `/games/:name/:id/leave`', async () => {
      await client.leaveMatch('tic-tac-toe', 'xyz', {
        playerID: '0',
        credentials: 'pwd',
      });
      expect(fetch).toBeCalledWith(`/games/tic-tac-toe/xyz/leave`, {
        method: 'post',
        body: '{"playerID":"0","credentials":"pwd"}',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    test('validates gameName', throwsWithInvalidGameName(client.leaveMatch));
    test('validates matchID', throwsWithInvalidMatchID(client.leaveMatch));

    test(
      'throws without body',
      throwsWithoutBody(() => client.leaveMatch('chess', 'id', undefined))
    );

    test('validates body', testBasicBody(client.leaveMatch));
  });

  describe('updatePlayer', () => {
    test('calls `/games/:name/:id/update`', async () => {
      await client.updatePlayer('tic-tac-toe', 'xyz', {
        playerID: '0',
        credentials: 'pwd',
        newName: 'Al',
      });
      expect(fetch).toBeCalledWith(`/games/tic-tac-toe/xyz/update`, {
        method: 'post',
        body: '{"playerID":"0","credentials":"pwd","newName":"Al"}',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    test('validates gameName', throwsWithInvalidGameName(client.updatePlayer));
    test('validates matchID', throwsWithInvalidMatchID(client.updatePlayer));

    test(
      'throws without body',
      throwsWithoutBody(() => client.updatePlayer('chess', 'id', undefined))
    );

    test('validates body', testBasicBody(client.updatePlayer));
  });

  describe('playAgain', () => {
    test('calls `/games/:name/:id/playAgain`', async () => {
      await client.playAgain('tic-tac-toe', 'xyz', {
        playerID: '0',
        credentials: 'pwd',
      });
      expect(fetch).toBeCalledWith(`/games/tic-tac-toe/xyz/playAgain`, {
        method: 'post',
        body: '{"playerID":"0","credentials":"pwd"}',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    test('validates gameName', throwsWithInvalidGameName(client.playAgain));
    test('validates matchID', throwsWithInvalidMatchID(client.playAgain));

    test(
      'throws without body',
      throwsWithoutBody(() => client.playAgain('chess', 'id', undefined))
    );

    test('validates body', testBasicBody(client.playAgain));
  });
});
