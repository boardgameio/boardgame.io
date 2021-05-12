# Chat

The boardgame.io client provides a basic API for sending chat messages between players in a match using the [multiplayer server](multiplayer?id=remote-master).

The [plain JS client](api/Client?id=properties) and the [React client](api/Client?id=board-props) (via board props) both provide the following properties:

- `sendChatMessage(message)`: Function that sends a chat message to other players. The message argument can be a string or you can send objects to include more metadata. For example, you might decide to include a timestamp along with message text:

    ```js
    sendChatMessage({ message: 'Hello', time: Date.now() });
    ```

- `chatMessages`: An array containing chat messages this client has received. Each message is an object with the following properties:

    - `id`: a unique message ID string
    - `sender`: the `playerID` of the message’s sender
    - `payload`: the value of the `message` argument passed to `sendChatMessage`

  Example `chatMessages` array:

  ```js
  [
      { id: 'foo', sender: '0', payload: 'Ready to play?' },
      { id: 'bar', sender: '1', payload: 'Let’s go!' },
  ]
  ```

### Notes

- **Chat messages are ephemeral and are not stored by the boardgame.io server.** A client only receives messages sent while it is connected to the server. If messages are sent amongst players before another player has connected, the new player will not receive those prior messages. Similarly, if the page is refreshed, any previously received messages will be lost.

- **Only players can send chat messages.** Assuming the match is authenticated via [the Lobby server](api/Lobby), only players are permitted to send messages, which are authenticated using the same logic as other game actions. Spectator clients can receive and view chat messages, but not send messages of their own.
