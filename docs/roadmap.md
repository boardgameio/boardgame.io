# Roadmap to v1.0

This is a living document capturing the current areas of focus, and what needs to
get done before we are ready for a v1 release.

* _Areas that need help are marked with **[help needed]**._
* _Stuff that [nicolodavis@](https://github.com/nicolodavis) is working on is marked with **[N]**._

### AI framework

* [x] MCTS bot ([issue](https://github.com/google/boardgame.io/issues/7#issuecomment-389453032))
* [ ] ability to add priorities and objectives ([issue](https://github.com/google/boardgame.io/issues/7#issuecomment-389453032)) **[N]**

### UI framework

* [ ] Drag and Drop **[N]**
* [ ] Sandbox mode (can drag around cards before any rules are coded up) **[N]**

### Lobby

* [x] basic `create` and `join` API
* [ ] simple web-based lobby ([issue](https://github.com/google/boardgame.io/issues/197))

### Storage

* ##### Mongo

  * [x] add Mongo support
  * [ ] add error handling **[help needed]**

* ##### Firebase / Other

  * [x] add support for one more backend (Firebase?)

### Core

* [ ] turn order customizations ([issue](https://github.com/google/boardgame.io/issues/154)) **[help needed]**
* [ ] log improvements ([issue](https://github.com/google/boardgame.io/issues/227))

### Documentation

* [ ] code organization best practices
* [ ] document event API thoroughly (with examples)
* [ ] deployment tutorial
* [ ] generate markdown from jsdoc?
