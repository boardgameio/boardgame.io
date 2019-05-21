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
- `board`: The react component that will render the board.

### Server-side API

The [Server](/api/Server) hosts the Lobby REST API that can be used to create and join games. It is particularly useful when you want to
authenticate clients to prove that they have the right to send
actions on behalf of a player.

Authenticated games are created with server-side tokens for each player. You can create a game with the `create` API call, and join a player to a game with the `join` API call.

A game that is authenticated will not accept moves from a client on behalf of a player without the appropriate credential token.

Use the `create` API call to create a game that requires credential tokens. When you call the `join` API, you can retrieve the credential token for a particular player.

#### Configuration

You can pass configure the Lobby API further during server startup:

```js
server.run({ port: 8000, lobbyConfig });
```

Options are:

- `apiPort`: If specified, runs the Lobby API in a separate Koa server in this port. Otherwise, shares the same Koa server runnning on default boardgame.io `port`.
- `apiCallback`: Called when the Koa server is ready. Only applicable if `apiPort` is specified.
- `shortid`: Function that returns an unique identifier, needed for creating new match codes and user's credentials in matches. If not specified, uses [shortid](https://www.npmjs.com/package/shortid).

#### Creating a game

##### POST `/games/{name}/create`

Creates a new authenticated game for a game named `name`.

Accepts two parameters:

`numPlayers` (required): the number of players.

`setupData` (optional): custom object that is passed to the game `setup` function.

Returns `gameID`, which is the ID of the newly created game instance.

#### Joining a game

##### POST `/games/{name}/{id}/join`

Allows a player to join a particular game instance `id` of a game named `name`.

Accepts two parameters, all required:

`playerID`: the ordinal player in the game that is being joined (0, 1...).

`playerName`: the display name of the player joining the game.

Returns `playerCredentials` which is the token this player will require to authenticate their actions in the future.

#### Leaving a game

##### POST `/games/{name}/{id}/leave`

Leave the game instance `id` of a game named `name` previously joined by the player.

Accepts two parameters, all required:

`playerID`: the ID used by the player in the game (0, 1...).

`playerCredentials`: the authentication token of the player.

#### Listing all instances of a given game

##### GET `/games/{name}`

Returns all instances of the game named `name`.

Returns an array of `rooms`. Each instance has fields:

`gameID`: the ID of the game instance.

`players`: the list of seats and players that have joined the game, if any.

#### Client Authentication

All actions for an authenticated game require an additional payload field `credentials`, which must be the given secret associated with the player.
