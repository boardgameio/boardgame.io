# Roadmap to v1.0

This is a living document capturing the current areas of focus, and what needs to
get done before we are ready for a v1 release.

- _Areas that need help are marked with **[help needed]**._
- _Stuff that [nicolodavis@](https://github.com/nicolodavis) is working on is marked with **[N]**._

The issues below (and some others that are not in this document) are also available on the [v1.0 milestone](https://github.com/boardgameio/boardgame.io/milestone/2) link.

### AI

- [x] MCTS bot ([issue](https://github.com/boardgameio/boardgame.io/issues/7#issuecomment-389453032))
- [x] ability to add priorities and objectives ([issue](https://github.com/boardgameio/boardgame.io/issues/7#issuecomment-389453032))
- [ ] Bots in multiplayer games ([issue](https://github.com/boardgameio/boardgame.io/issues/383)) **[help needed]**

### Lobby

- [x] basic `create` and `join` API
- [x] simple web-based lobby ([issue](https://github.com/boardgameio/boardgame.io/issues/197))
- [ ] Lobby Improvements ([issue](https://github.com/boardgameio/boardgame.io/issues/354)) **[help needed]**
- [ ] Migrate to Svelte ([issue](https://github.com/boardgameio/boardgame.io/issues/432)) **[help needed]**

### Storage

- ##### Databases

  We encourage developers to contribute third-party storage connectors, implementing
  [the `StorageAPI.Async` interface](https://github.com/boardgameio/boardgame.io/blob/master/src/server/db/base.ts).

  See the [Storage docs](https://boardgame.io/documentation/#/storage) for
  examples and details of the backends currently available.

- ##### Size / Performance

  - [ ] Explore MessagePack or other compression scheme

### Core

- [x] phases -> turns -> stages
- [x] turn order improvements ([issue](https://github.com/boardgameio/boardgame.io/issues/154))
- [x] log improvements ([issue](https://github.com/boardgameio/boardgame.io/issues/227))
- [x] add immutability helper (Immer) ([issue](https://github.com/boardgameio/boardgame.io/issues/295))

### Server

- [x] abstract away server component ([issue](https://github.com/boardgameio/boardgame.io/issues/251))
- [ ] server scaling ([issue](https://github.com/boardgameio/boardgame.io/issues/277))

### Documentation

- [ ] recipes for different game scenarios
- [ ] code organization patterns
- [x] deployment tutorial
- [x] tutorial using the vanilla JS client
