# How to Contribute

## Finding things to contribute to

Please use the [Issue Tracker](https://github.com/boardgameio/boardgame.io/issues) to discuss
potential improvements you want to make before sending a Pull Request.
The [roadmap](roadmap.md) is probably the best place to find areas where help would
most be appreciated.

The Issue Tracker may contain items labelled [**good first issue**][gfi] or [**help wanted**][hw] from time to time.

[hw]: https://github.com/boardgameio/boardgame.io/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22+
[gfi]: https://github.com/boardgameio/boardgame.io/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22

## Pull Requests

[Pull Requests](https://help.github.com/articles/about-pull-requests/) are used for contributions. Code must be well-tested and not decrease the test coverage significantly.

#### Use a separate branch (not `master`)

Please commit changes to a separate branch in your fork
so that we can work together making changes to it before it
is ready to be merged. Name your branch something like
`<username>/feature`.

Once you are ready, you can create a Pull Request for it to be
merged into the `master` branch in this repo.

#### Testing

The following commands must pass for a Pull Request to be considered:

```
$ npm test
$ npm run lint
```

You can also check the test coverage by running:

```
$ npm run test:coverage
```

#### If you make changes to the docs

Use the following command to preview them:

```
$ npm run docs
```
