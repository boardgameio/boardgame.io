<p align="center">
  <img src="logo.png" alt="boardgame.io" />
</p>

<p align="center">
<a href="https://www.npmjs.com/package/boardgame.io"><img src="https://badge.fury.io/js/boardgame.io.svg" alt="npm version" /></a>
<a href="https://travis-ci.org/google/boardgame.io"><img src="https://img.shields.io/travis/google/boardgame.io/master.svg" alt="Travis" /></a>
<a href="https://coveralls.io/github/google/boardgame.io?branch=master"><img src="https://img.shields.io/coveralls/google/boardgame.io.svg" alt="Coveralls" /></a>
</p>

---

State management and React libraries for turn based games.

The goal of this framework is to allow a game author to
essentially translate the rules of a game to a series of
simple functions that describe how the game state changes
when a particular move is made, and the framework takes
care of the rest. You will not need to write any
networking or backend code.

### Features

* Seamless game state management across client and server.
* Strong emphasis on ease of prototyping.
* Debug UI to simulate moves even before you render the board.
* Online multiplayer with realtime updates.
* Game logs with ability to rewind to previous state.
* React components for common game elements (cards etc.).

### Installation

```
npm install boardgame.io
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
