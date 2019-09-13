# Roadmap to v1.0

This is a living document capturing the current areas of focus, and what needs to
get done before we are ready for a v1 release.

- _Areas that need help are marked with **[help needed]**._
- _Stuff that [nicolodavis@](https://github.com/nicolodavis) is working on is marked with **[N]**._

### AI

- [x] MCTS bot ([issue](https://github.com/nicolodavis/boardgame.io/issues/7#issuecomment-389453032))
- [ ] ability to add priorities and objectives ([issue](https://github.com/nicolodavis/boardgame.io/issues/7#issuecomment-389453032))
- [ ] run bots in multiplayer games

### UI

- [x] Drag and Drop (cards and decks)
- [ ] Migrate to Svelte ([issue](https://github.com/nicolodavis/boardgame.io/issues/432))
- [ ] Game Object API ([issue](https://github.com/nicolodavis/boardgame.io/issues/455))

### Lobby

- [x] basic `create` and `join` API
- [x] simple web-based lobby ([issue](https://github.com/nicolodavis/boardgame.io/issues/197))

### Storage

- ##### Databases

  - [x] add Mongo support
  - [x] add Firebase support
  - [ ] add Postgres support

- ##### Size / Performance

  - [ ] Explore MessagePack or other compression scheme

### Core

- [x] phases -> turns -> stages
- [ ] turn order improvements ([issue](https://github.com/nicolodavis/boardgame.io/issues/154))
- [ ] log improvements ([issue](https://github.com/nicolodavis/boardgame.io/issues/227))
- [x] add immutability helper (Immer) ([issue](https://github.com/nicolodavis/boardgame.io/issues/295))

### Server

- [x] abstract away server component ([issue](https://github.com/nicolodavis/boardgame.io/issues/251))
- [ ] server scaling ([issue](https://github.com/nicolodavis/boardgame.io/issues/277))

### Documentation

- [ ] code organization best practices
- [ ] deployment tutorial
- [ ] generate markdown from jsdoc?
