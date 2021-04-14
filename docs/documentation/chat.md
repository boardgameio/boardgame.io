# Chat

The game client comes with a chat API. These two properties are included on the [vanilla JS client](api/Client?id=properties), and in the [React Board Props](api/Client?id=board-props) received by your `Board` component.

- `sendChatMessage(message)` : Function that sends a chat message to other players. The message argument can be a string or you can send objects to include more metadata.
- `chatMessages` : An array containing chat messages this client has received. Each message is an object with the following properties:
    - `id`: a unique ID string
    - `sender`: the playerID of the sender
    - `payload`: the value passed to sendChatMessage

Example:

```js
[
    { id: 'foo', sender: '0', payload: 'Ready to play?' },
    { id: 'bar', sender: '1', payload: 'Let’s go!' },
]
```
