# How to Contribute

## Finding things to contribute to

Please use the [Issue Tracker](https://github.com/nicolodavis/boardgame.io/issues) to discuss
potential improvements you want to make before sending a Pull Request.
The [roadmap](docs/roadmap.md) is probably the best place to find areas where help would
most be appreciated.

The Issue Tracker may contain items labelled **help wanted** or **good first issue**
from time to time.

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
