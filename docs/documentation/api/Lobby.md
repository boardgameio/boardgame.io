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

The [Server](/api/Server) hosts the Lobby REST API that can be used to create and join rooms. It is particularly useful when you want to
authenticate clients to prove that they have the right to send
actions on behalf of a player.

Authenticated games are created with server-side tokens for each player. You can create a room with the `create` API call, and join a player to a room with the `join` API call.

A game that is authenticated will not accept moves from a client on behalf of a player without the appropriate credential token.

Use the `create` API call to create a room that requires credential tokens. When you call the `join` API, you can retrieve the credential token for a particular player.

#### Configuration

You can pass `lobbyConfig` to configure the Lobby API
during server startup:

```js
server.run({ port: 8000, lobbyConfig });
```

Options are:

- `apiPort`: If specified, it runs the Lobby API in a separate Koa server on this port. Otherwise, it shares the same Koa server runnning on the default boardgame.io `port`.
- `apiCallback`: Called when the Koa server is ready. Only applicable if `apiPort` is specified.
- `uuid`: Function that returns an unique identifier, needed for creating new game ID codes. If not specified, uses [shortid](https://www.npmjs.com/package/shortid).

#### Creating a room

##### POST `/games/{name}/create`

Creates a new authenticated room for a game named `name`.

Accepts two parameters:

`numPlayers` (required): the number of players.

`setupData` (optional): custom object that is passed to the game `setup` function.

Returns `roomID`, which is the ID of the newly created game instance.

#### Joining a game

##### POST `/games/{name}/{id}/join`

Allows a player to join a particular room instance `id` of a game named `name`.

Accepts two parameters, all required:

`playerID`: the ordinal player in the game that is being joined (0, 1...).

`playerName`: the display name of the player joining the game.

Returns `playerCredentials` which is the token this player will require to authenticate their actions in the future.

#### Renaming a player

##### POST `/games/{name}/{id}/rename`

Rename a user in the room instance `id` of a game named `name` previously joined by the player.

Accepts three parameters, all required:

`playerID`: the ID used by the player in the game (0, 1...).

`credentials`: the authentication token of the player.

`newName`: the new name of the player.

#### Leaving a room

##### POST `/games/{name}/{id}/leave`

Leave the room instance `id` of a game named `name` previously joined by the player.

Accepts two parameters, all required:

`playerID`: the ID used by the player in the game (0, 1...).

`credentials`: the authentication token of the player.

#### Listing all room instances of a given game

##### GET `/games/{name}`

Returns all room instances of the game named `name`.

Returns an array of `rooms`. Each instance has fields:

`roomID`: the ID of the room instance.

`players`: the list of seats and players that have joined the game, if any.

`setupData` (optional): custom object that was passed to the game `setup` function.

#### Getting specific instance of a room by its ID

##### GET `/games/{name}/{id}`

Returns a room instance given its roomID.

Returns a room instance. Each instance has fields:

`roomID`: the ID of the room instance.

`players`: the list of seats and players that have joined the game, if any.

`setupData` (optional): custom object that was passed to the game `setup` function.

#### Client Authentication

All actions for an authenticated game require an additional payload field `credentials`, which must be the given secret associated with the player.
