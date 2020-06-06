# Lobby

### React components

You can use the lobby component with the code below:

```js
import { Lobby } from 'boardgame.io/react';

<Lobby
  gameServer={`https://${window.location.hostname}:8000`}
  lobbyServer={`https://${window.location.hostname}:8000`}
  gameComponents={importedGames}
/>;
```

`importedGames` is an array of objects with these fields:

- `game`: The boardgame.io `Game` definition.
- `board`: The React component that will render the board.

### Server-side API

The [Server](/api/Server) hosts the Lobby REST API that can be used to create and join matches. It is particularly useful when you want to
authenticate clients to prove that they have the right to send
actions on behalf of a player.

Authenticated matches are created with server-side tokens for each player. You can create a match with the `create` API call, and join a player to a match with the `join` API call.

A match that is authenticated will not accept moves from a client on behalf of a player without the appropriate credential token.

Use the `create` API call to create a match that requires credential tokens. When you call the `join` API, you can retrieve the credential token for a particular player.

#### Configuration

You can pass `lobbyConfig` to configure the Lobby API
during server startup:

```js
server.run({ port: 8000, lobbyConfig });
```

Options are:

- `apiPort`: If specified, it runs the Lobby API in a separate Koa server on this port. Otherwise, it shares the same Koa server running on the default boardgame.io `port`.
- `apiCallback`: Called when the Koa server is ready. Only applicable if `apiPort` is specified.

#### Creating a match

##### POST `/games/{name}/create`

Creates a new authenticated match for a game named `name`.

Accepts three parameters:

- `numPlayers` (required): the number of players.

- `setupData` (optional): custom object that is passed to the game `setup` function.

- `unlisted` (optional): if set to `true`, the match will be excluded from the public list of match instances.

Returns `matchID`, which is the ID of the newly created game instance.

#### Joining a match

##### POST `/games/{name}/{id}/join`

Allows a player to join a particular match instance `id` of a game named `name`.

Accepts three JSON body parameters:

- `playerID` (required): the ordinal player in the match that is being joined (0, 1...).

- `playerName` (required): the display name of the player joining the match.

- `data` (optional): additional metadata to associate with the player.

Returns `playerCredentials` which is the token this player will require to authenticate their actions in the future.

#### Updating a player’s metadata

##### POST `/games/{name}/{id}/update`

Rename and/or update additional metadata for a player in the match instance `id` of a game named `name` previously joined by the player.

Accepts four parameters, requires at least one of the two optional parameters:

- `playerID` (required): the ID used by the player in the match (0,1...).

- `credentials` (required): the authentication token of the player.

- `newName` (optional): the new name of the player.

- `data` (optional): additional metadata to associate with the player.

#### Leaving a match

##### POST `/games/{name}/{id}/leave`

Leave the match instance `id` of a game named `name` previously joined by the player.

Accepts two parameters, all required:

- `playerID`: the ID used by the player in the match (0, 1...).

- `credentials`: the authentication token of the player.

#### Listing all match instances of a given game

##### GET `/games/{name}`

Returns all match instances of the game named `name`.

Returns an array of `matches`. Each instance has fields:

- `matchID`: the ID of the match instance.

- `players`: the list of seats and players that have joined the game, if any.

- `setupData` (optional): custom object that was passed to the game `setup` function.

#### Getting a specific match by its ID

##### GET `/games/{name}/{id}`

Returns a match instance given its matchID.

Returns a match instance. Each instance has fields:

- `matchID`: the ID of the match instance.

- `players`: the list of seats and players that have joined the match, if any.

- `setupData` (optional): custom object that was passed to the game `setup` function.

#### Playing again

##### POST `/games/{name}/{id}/playAgain`

- `{name}` (required): the name of the game being played again.

- `{id}` (required): the ID of the previous finished match.

Given a previous match, generates a match ID where users should go if they want to play again. Creates this new match if it didn't exist before.

Accepts these parameters:

- `playerID` (required): the player ID of the player in the previous match.

- `credentials` (required): player's credentials.

- `numPlayers` (optional): the number of players. Defaults to the `numPlayers` value of the previous match.

- `setupData` (optional): custom object that was passed to the game `setup` function. Defaults to the `setupData` object of the previous room.

Returns `nextMatchID`, which is the ID of the newly created match that the user should go to play again.
