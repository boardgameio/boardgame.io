<p align="center">
  <img src="https://raw.githubusercontent.com/google/boardgame.io/master/docs/logo.svg?sanitize=true" alt="boardgame.io" />
</p>

<p align="center">
<a href="https://www.npmjs.com/package/boardgame.io"><img src="https://badge.fury.io/js/boardgame.io.svg" alt="npm version" /></a>
<a href="https://travis-ci.org/google/boardgame.io"><img src="https://img.shields.io/travis/google/boardgame.io/master.svg" alt="Travis" /></a>
<a href="https://coveralls.io/github/google/boardgame.io?branch=master"><img src="https://img.shields.io/coveralls/google/boardgame.io.svg" alt="Coveralls" /></a>
</p>

---

The goal of this framework is to allow a game author to
essentially translate the rules of a game to a series of
simple functions that describe how the game state changes
when a particular move is made, and the framework takes
care of the rest. You will not need to write any
networking or backend code.

### Features

* **State Management**: Game state is managed seamlessly across browser, server and storage automatically.
* **Prototyping**: Debugging interface to simulate moves even before you render the game.
* **Multiplayer**: All browsers connected to the same game are synced in real time with no refreshes required.
* **Logs**: Game logs with the ability to time travel (viewing the board at an earlier state).
* **UI toolkit**: React components for common game elements (cards etc.).

### Installation

```
npm install --save boardgame.io
```

A browser-minified version is also available that you may
include via a `<script>` tag.

```
<script src="//unpkg.com/boardgame.io"></script>
```

### Disclaimer

This is not an official Google product.

### License

MIT
