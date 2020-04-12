<p align="center">
  <img src="https://raw.githubusercontent.com/nicolodavis/boardgame.io/master/docs/logo-optimized.svg?sanitize=true" alt="boardgame.io" />
</p>

<p align="center">
<a href="https://www.npmjs.com/package/boardgame.io"><img src="https://badge.fury.io/js/boardgame.io.svg" alt="npm version" /></a>
<a href='https://semaphoreci.com/nicolodavis/boardgame-io'> <img src='https://semaphoreci.com/api/v1/nicolodavis/boardgame-io/branches/master/shields_badge.svg' alt='Build Status'></a>
<a href="https://coveralls.io/github/nicolodavis/boardgame.io?branch=master"><img src="https://img.shields.io/coveralls/nicolodavis/boardgame.io.svg" alt="Coveralls" /></a>
<a href="https://gitter.im/boardgame-io"><img src="https://badges.gitter.im/boardgame-io.svg" alt="Gitter" /></a>
</p>

<p align="center">
  <strong>Full Documentation: <a href="https://boardgame.io/documentation/#/">link</a></strong>
</p>

Write simple functions that describe how the game state changes
when a particular move is made. This is automatically converted
into a playable game complete with online multiplayer
features, all without requiring you to write a single line of
networking or storage code.

### Features

- **State Management**: Game state is managed seamlessly across clients, server and storage automatically.
- **Multiplayer**: Game state is kept in sync in realtime and across platforms.
- **AI**: Automatically generated bots that can play your game.
- **Game Phases**: with different game rules and turn orders per phase.
- **Lobby**: Player matchmaking and game creation.
- **Prototyping**: Interface to simulate moves even before you render the game.
- **Extendable**: Plugin system that allows creating new abstractions.
- **View-layer Agnostic**: Use the vanilla JS client or the bindings for React / React Native.
- **Logs**: Game logs with the ability to time travel (viewing the board at an earlier state).

## Usage

### Installation

```
$ npm install --save boardgame.io
```

### Running examples in this repository

```
$ npm install
$ npm run build
$ npm start
```

## Changelog

See [changelog](docs/documentation/CHANGELOG.md).

## Contributing

See the contributing [guidelines](CONTRIBUTING.md). Also take a look at the [roadmap](roadmap.md)
to find things that you could contribute to.

## License

MIT
