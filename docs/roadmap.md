# Roadmap to v1.0

This is a living document capturing the current areas of focus, and what needs to
get done before we are ready for a v1 release.

* _Areas that need help are marked with **[help needed]**._
* _Stuff that [nicolodavis@](https://github.com/nicolodavis) is working on is marked with **[N]**._

### AI framework

* [x] MCTS bot ([issue](https://github.com/nicolodavis/boardgame.io/issues/7#issuecomment-389453032))
* [ ] ability to add priorities and objectives ([issue](https://github.com/nicolodavis/boardgame.io/issues/7#issuecomment-389453032)) **[N]**

### UI framework

* [x] Drag and Drop (cards and decks).
* [ ] Drag and Drop (tokens and grids).
* [ ] 3D components ([issue](https://github.com/nicolodavis/boardgame.io/issues/282))

### Lobby

* [x] basic `create` and `join` API
* [ ] simple web-based lobby ([issue](https://github.com/nicolodavis/boardgame.io/issues/197)) **[help needed]**

### Storage

* ##### Mongo

  * [x] add Mongo support
  * [ ] add error handling **[help needed]**

* ##### Firebase / Other

  * [x] add support for one more backend (Firebase?)

### Core

* [ ] turn order improvements ([issue](https://github.com/nicolodavis/boardgame.io/issues/154))
* [ ] log improvements ([issue](https://github.com/nicolodavis/boardgame.io/issues/227))

### Server

* [x] abstract away server component ([issue](https://github.com/nicolodavis/boardgame.io/issues/251))
* [ ] server scaling ([issue](https://github.com/nicolodavis/boardgame.io/issues/277))

### Documentation

* [ ] code organization best practices
* [ ] document event API thoroughly (with examples)
* [ ] deployment tutorial
* [ ] generate markdown from jsdoc?
