# Lobby

The [Server](/api/Server) hosts the Lobby REST API that can be used to create
and join matches. It is particularly useful when you want to
authenticate clients to prove that they have the right to send
actions on behalf of a player.

Authenticated matches are created with server-side tokens for each player.
You can create a match with the `create` API call, and join a player to a
match with the `join` API call.

A match that is authenticated will not accept moves from a client on behalf
of a player without the appropriate credential token.

Use the `create` API call to create a match that requires credential tokens.
When you call the `join` API, you can retrieve the credential token for a
particular player.

## Clients

<!-- tabs:start -->
### **Plain JS**

boardgame.io provides a lightweight wrapper around the Fetch API to simplify
using a Lobby API server from the client.


```js
import { LobbyClient } from 'boardgame.io/client';

const lobbyClient = new LobbyClient({ server: 'http://localhost:8000' });

lobbyClient.listGames()
  .then(console.log) // => ['chess', 'tic-tac-toe']
  .catch(console.error);
```

### **React**

The React lobby component provides a more high-level client, including UI
for listing, joining, and creating matches.

```js
import { Lobby } from 'boardgame.io/react';
import { TicTacToe } from './Game';
import { TicTacToeBoard } from './Board';

<Lobby
  gameServer={`https://${window.location.hostname}:8000`}
  lobbyServer={`https://${window.location.hostname}:8000`}
  gameComponents={[
    { game: TicTacToe, board: TicTacToeBoard }
  ]}
/>;
```

`gameComponents` expects an array of objects with these fields:

- `game`: A boardgame.io `Game` definition.
- `board`: The React component that will render the board.

<!-- tabs:end -->

## REST API

### Listing available game types

#### GET `/games`

Returns an array of names for the games this server is running.

#### Using a LobbyClient instance

```js
const games = await lobbyClient.listGames();
```

### Listing all matches for a given game

#### GET `/games/{name}`

Returns all match instances of the game named `name`.

Returns an array of `matches`. Each instance has fields:

- `matchID`: the ID of the match instance.

- `players`: the list of seats and players that have joined the game, if any.

- `setupData` (optional): custom object that was passed to the game `setup` function.

#### Using a LobbyClient instance

```js
const { matches } = await lobbyClient.listMatches('tic-tac-toe');
```

### Getting a specific match by its ID

#### GET `/games/{name}/{id}`

Returns a match instance given its matchID.

Returns a match instance. Each instance has fields:

- `matchID`: the ID of the match instance.

- `players`: the list of seats and players that have joined the match, if any.

- `setupData` (optional): custom object that was passed to the game `setup` function.

#### Using a LobbyClient instance

```js
const match = await lobbyClient.getMatch('tic-tac-toe', 'matchID');
```

### Creating a match

#### POST `/games/{name}/create`

Creates a new authenticated match for a game named `name`.

Accepts three parameters:

- `numPlayers` (required): the number of players.

- `setupData` (optional): custom object that is passed to the game `setup` function.

- `unlisted` (optional): if set to `true`, the match will be excluded from the public list of match instances.

Returns `matchID`, which is the ID of the newly created game instance.

#### Using a LobbyClient instance

```js
const { matchID } = await lobbyClient.createMatch('tic-tac-toe', {
  numPlayers: 2
});
```

### Joining a match

#### POST `/games/{name}/{id}/join`

Allows a player to join a particular match instance `id` of a game named `name`.

Accepts three JSON body parameters:

- `playerID` (optional): the ordinal player in the match that is being joined (`'0'`, `'1'`...).  
If not sent, will be automatically assigned to the first available ordinal.

- `playerName` (required): the display name of the player joining the match.

- `data` (optional): additional metadata to associate with the player.

Returns `playerCredentials` which is the token this player will require to authenticate their actions in the future.

#### Using a LobbyClient instance

```js
const { playerCredentials } = await lobbyClient.joinMatch(
  'tic-tac-toe',
  'matchID',
  {
    playerID: '0',
    playerName: 'Alice',
  }
);
```

### Updating a player’s metadata

#### POST `/games/{name}/{id}/update`

Rename and/or update additional metadata for a player in the match instance `id` of a game named `name` previously joined by the player.

Accepts four JSON body parameters, requires at least one of the two optional parameters:

- `playerID` (required): the ID used by the player in the match (0,1...).

- `credentials` (required): the authentication token of the player.

- `newName` (optional): the new name of the player.

- `data` (optional): additional metadata to associate with the player.

#### Using a LobbyClient instance

```js
await lobbyClient.updatePlayer('tic-tac-toe', 'matchID', {
  playerID: '0',
  credentials: 'playerCredentials',
  newName: 'Al',
});
```

### Leaving a match

#### POST `/games/{name}/{id}/leave`

Leave the match instance `id` of a game named `name` previously joined by the player.

Accepts two JSON body parameters, all required:

- `playerID`: the ID used by the player in the match (0, 1...).

- `credentials`: the authentication token of the player.

#### Using a LobbyClient instance

```js
await lobbyClient.leaveMatch('tic-tac-toe', 'matchID', {
  playerID: '0',
  credentials: 'playerCredentials',
});
```

### Playing again

#### POST `/games/{name}/{id}/playAgain`

- `{name}` (required): the name of the game being played again.

- `{id}` (required): the ID of the previous finished match.

Given a previous match, generates a match ID where users should go if they want to play again. Creates this new match if it didn't exist before.

Accepts these parameters:

- `playerID` (required): the player ID of the player in the previous match.

- `credentials` (required): player's credentials.

- `numPlayers` (optional): the number of players. Defaults to the `numPlayers` value of the previous match.

- `setupData` (optional): custom object that was passed to the game `setup` function. Defaults to the `setupData` object of the previous room.

Returns `nextMatchID`, which is the ID of the newly created match that the user should go to play again.

#### Using a LobbyClient instance

```js
const { nextMatchID } = await lobbyClient.playAgain('tic-tac-toe', 'matchID', {
  playerID: '0',
  credentials: 'playerCredentials',
});
```
