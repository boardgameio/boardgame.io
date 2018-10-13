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

The goal of this framework is to allow a game developer to
translate the rules of a game into a series of simple functions
that describe how the game state changes when a particular move is made,
and the framework takes care of the rest. You get a fully multiplayer
implementation without having to write any networking or storage layer code.

## Features

* **State Management**: Game state is managed seamlessly across clients, server and storage automatically.
* **Cross-platform Multiplayer**: All clients (Web / Android / iOS) connected to the game are synced in real time.
* **AI Framework**: Create bots that are highly customizable and debuggable.
* **Game Phases**: with different game rules (including custom turn orders) per phase.
* **Secret State**: Secret information (like the opponent's cards) can be hidden from the client.
* **Prototyping**: Debugging interface to simulate moves even before you render the game.
* **Logs**: Game logs with the ability to time travel (viewing the board at an earlier state).
* **UI Agnostic**: Vanilla JS client with bindings for React / React Native.
* **Component Toolkit**: Components for hex grids, cards, tokens.

The framework is modular and made up of pluggable adapters, so you can swap out any part
of it with your own custom implementation. For example, you can connect it to any storage
backend, or change the underlying websocket layer to a different implementation. Even though
bindings are provided for React, you can use the vanilla JS client to connect
it to any client-side framework (see the examples in this repository for how to use threejs).

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
