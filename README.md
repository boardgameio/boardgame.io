<p align="center">
  <img src="https://raw.githubusercontent.com/google/boardgame.io/master/docs/logo.svg?sanitize=true" alt="boardgame.io" />
</p>

<p align="center">
<a href="https://www.npmjs.com/package/boardgame.io"><img src="https://badge.fury.io/js/boardgame.io.svg" alt="npm version" /></a>
<a href="https://travis-ci.org/google/boardgame.io"><img src="https://img.shields.io/travis/google/boardgame.io/master.svg" alt="Travis" /></a>
<a href="https://coveralls.io/github/google/boardgame.io?branch=master"><img src="https://img.shields.io/coveralls/google/boardgame.io.svg" alt="Coveralls" /></a>
<a href="https://gitter.im/boardgame-io"><img src="https://badges.gitter.im/boardgame-io.svg" alt="Gitter" /></a>
</p>

<p align="center">
  <strong>Full Documentation: <a href="https://google.github.io/boardgame.io">link</a></strong>
</p>

The goal of this framework is to allow a game author to
essentially translate the rules of a game into a series of
simple functions that describe how the game state changes
when a particular move is made, and the framework takes
care of the rest. You will not need to write any
networking or backend code.

## Features

* **State Management**: Game state is managed seamlessly across clients, server and storage automatically.
* **Cross-platform Multiplayer**: All clients (Web / Android / iOS) connected to the same game are synced in real time.
* **UI Agnostic**: Client API for React, React Native or plain JS.
* **Game Phases**: with different game rules (including custom turn orders) per phase.
* **Secret State**: Secret information (like the opponent's cards) can be hidden from the client.
* **Prototyping**: Debugging interface to simulate moves even before you render the game.
* **Logs**: Game logs with the ability to time travel (viewing the board at an earlier state).
* **Component Toolkit**: Components for hex grids, cards, tokens (React only at the moment).

## Usage

### Installation

```
$ npm install --save boardgame.io
```

### Running examples in this repository

```
$ npm install
$ npm run examples
```

## Changelog

See [changelog](docs/CHANGELOG.md).

## Contributing

See the contributing [guidelines](CONTRIBUTING.md).

## Disclaimer

This is not an official Google product. It's a Googler's
hobby project that's supported by contributions from the
community.
