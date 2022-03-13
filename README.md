[![SWUbanner](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/banner2-direct.svg)](https://github.com/vshymanskyy/StandWithUkraine/blob/main/docs/Donate.md)

<p align="center">
  <a href="https://boardgame.io/">
    <img src="https://raw.githubusercontent.com/boardgameio/boardgame.io/main/docs/logo-optimized.svg?sanitize=true" alt="boardgame.io" />
  </a>
</p>

<p align="center">
<a href="https://www.npmjs.com/package/boardgame.io"><img src="https://badge.fury.io/js/boardgame.io.svg" alt="npm version" /></a>
<a href="https://github.com/boardgameio/boardgame.io/actions?query=workflow%3ATests"> <img src="https://github.com/boardgameio/boardgame.io/workflows/Tests/badge.svg" alt='Build Status'></a>
<a href='https://coveralls.io/github/boardgameio/boardgame.io?branch=main'><img src='https://coveralls.io/repos/github/boardgameio/boardgame.io/badge.svg?branch=main' alt='Coverage Status' /></a>
<a href="https://gitter.im/boardgame-io"><img src="https://badges.gitter.im/boardgame-io.svg" alt="Gitter" /></a>
</p>

<p align="center">
<a href="#readme"><img src="https://img.shields.io/badge/Support_Us:-fff?style=flat-square" alt="Support us:" /></a>
<a href="https://opencollective.com/boardgameio#support"><img src="https://img.shields.io/badge/Open_Collective-fff?logo=open-collective" alt="Open Collective" /></a>
<a href="https://github.com/sponsors/boardgameio"><img src="https://img.shields.io/badge/GitHub_Sponsors-fff?logo=github-sponsors" alt="GitHub Sponsors" /></a>
</p>

<p align="center">
  <strong><a href="https://boardgame.io/documentation/#/">Read the Documentation</a></strong>
</p>

<p align="center">
  <strong>boardgame.io</strong> is an engine for creating turn-based games using JavaScript.
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

```sh
npm install boardgame.io
```

### Documentation

Read our [Full Documentation](https://boardgame.io/documentation/) to learn how to
use boardgame.io, and join the [community on gitter](https://gitter.im/boardgame-io/General)
to ask your questions!

### Running examples in this repository

```sh
npm install
npm start
```

The examples can be found in the [examples](examples/) folder.

#### Using VS Code?

This repository is ready to run in a dev container in VS Code. See [the contributing guidelines for details](CONTRIBUTING.md).

## Changelog

See [changelog](docs/documentation/CHANGELOG.md).

## Get involved

We welcome contributions of all kinds!
Please take a moment to review our [Code of Conduct](CODE_OF_CONDUCT.md).

🐛 **Found a bug?**  
Let us know by [creating an issue][new-issue].

❓ **Have a question?**  
Our [Gitter channel][gitter] and [GitHub Discussions][discussions]
are good places to start.

⚙️ **Interested in fixing a [bug][bugs] or adding a [feature][features]?**  
Check out the [contributing guidelines](CONTRIBUTING.md)
and the [project roadmap](roadmap.md).

📖 **Can we improve [our documentation][docs]?**  
Pull requests even for small changes can be helpful. Each page in the
docs can be edited by clicking the “Edit on GitHub” link at the top right.

💸 **Want to support the project financially?**  
We accept donations via [GitHub Sponsors][sponsors] and on [Open Collective][collective].

[new-issue]: https://github.com/boardgameio/boardgame.io/issues/new/choose
[gitter]: https://gitter.im/boardgame-io/General
[discussions]: https://github.com/boardgameio/boardgame.io/discussions
[bugs]: https://github.com/boardgameio/boardgame.io/issues?q=is%3Aissue+is%3Aopen+label%3Abug
[features]: https://github.com/boardgameio/boardgame.io/issues?q=is%3Aissue+is%3Aopen+label%3Afeature
[docs]: https://boardgame.io/documentation/
[sponsors]: https://github.com/sponsors/boardgameio
[collective]: https://opencollective.com/boardgameio#support

## License

[MIT](LICENSE)
