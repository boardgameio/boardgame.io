# Roadmap to v1.0

This is a living document capturing the current areas of focus, and what needs to
get done before we are ready for a v1 release. Areas that need help are marked with
**[help needed]**. Stuff that [nicolodavis@](https://github.com/nicolodavis) is working on
are marked with **[N]**.

### AI framework

* ##### Bots

  * [ ] MCTS bot ([link](https://github.com/google/boardgame.io/issues/7#issuecomment-389453032)) **[N]**
  * [ ] ability to add objectives ([link](https://github.com/google/boardgame.io/issues/7#issuecomment-389453032)) **[N]**

* ##### Simulations
  * [ ] ability to log events in the game and get aggregate stats after many simulations
  * [ ] automatically report popular / unpopular moves

### UI framework

* [ ] Drag and Drop **[N]**
* [ ] Sandbox mode (can drag around cards before any rules are coded up) **[N]**

### Lobby

* [x] basic `create` and `join` API
* [ ] simple web-based lobby ([link](https://github.com/google/boardgame.io/issues/197))

### Storage

* ##### Mongo

  * [x] add Mongo support
  * [ ] add error handling **[help needed]**

* ##### Firebase
  * [ ] add Firebase support **[help needed]**

### Core

* [ ] turn order customizations ([link](https://github.com/google/boardgame.io/issues/154)) **[help needed]**
* [ ] log improvements ([link](https://github.com/google/boardgame.io/issues/206))

### Documentation

* [ ] code organization best practices
* [ ] document event API thoroughly (with examples)
* [ ] deployment tutorial
* [ ] generate markdown from jsdoc?
