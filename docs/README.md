# boardgame.io
[![npm version](https://badge.fury.io/js/boardgame.io.svg)](https://www.npmjs.com/package/boardgame.io)
[![Travis](https://img.shields.io/travis/google/boardgame.io/master.svg)](https://travis-ci.org/google/boardgame.io)
[![Coveralls](https://img.shields.io/coveralls/google/boardgame.io.svg)](https://coveralls.io/github/google/boardgame.io?branch=master)

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
* Debug UI to visualize state and simulate game moves even before you build UI components for your game.
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
