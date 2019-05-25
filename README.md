<p align="center">
  <img src="https://raw.githubusercontent.com/nicolodavis/boardgame.io/master/docs/logo.svg?sanitize=true" alt="boardgame.io" />
</p>

<p align="center">
<a href="https://www.npmjs.com/package/boardgame.io"><img src="https://badge.fury.io/js/boardgame.io.svg" alt="npm version" /></a>
<a href='https://semaphoreci.com/nicolodavis/boardgame-io'> <img src='https://semaphoreci.com/api/v1/nicolodavis/boardgame-io/branches/master/shields_badge.svg' alt='Build Status'></a>
<a href="https://coveralls.io/github/nicolodavis/boardgame.io?branch=master"><img src="https://img.shields.io/coveralls/nicolodavis/boardgame.io.svg" alt="Coveralls" /></a>
<a href="https://gitter.im/boardgame-io"><img src="https://badges.gitter.im/boardgame-io.svg" alt="Gitter" /></a>
</p>

<p align="center">
  <strong>Full Documentation: <a href="https://nicolodavis.github.io/boardgame.io">link</a></strong>
</p>

Write simple functions that describe how the game state changes
when a particular move is made. This is automatically converted
into a working game complete with online multiplayer
features, all without requiring you to write a single line of
networking or database handling code.

### Features

- **State Management**: Game state is managed seamlessly across clients, server and storage automatically.
- **Cross-platform Multiplayer**: All clients (Web / Android / iOS) are kept in sync in realtime.
- **Automatic AI**: MCTS-based bots with options to customize.
- **Game Phases**: with different game rules (including custom turn orders) per phase.
- **Prototyping**: Debugging interface to simulate moves even before you render the game.
- **Logs**: Game logs with the ability to time travel (viewing the board at an earlier state).
- **View-layer Agnostic**: Vanilla JS client with bindings for React / React Native.
- **Component Toolkit**: Components for hex grids, cards, tokens.
- **Extendable**: Subsystems (storage, networking etc.) can be replaced with custom implementations.

## Usage

### Installation

```
$ npm install --save boardgame.io
```

### Running examples in this repository

```
$ npm install
$ npm start
```

## Changelog

See [changelog](docs/CHANGELOG.md).

## Contributing

See the contributing [guidelines](CONTRIBUTING.md). Also take a look at the [roadmap](docs/roadmap.md)
to find things that you could contribute to.

## License

MIT
