# How to Contribute

## Issue tracker

Please use the [Issue Tracker](https://github.com/google/boardgame.io/issues) to discuss potential improvements you want to make
before sending a Pull Request. Do not send unsolicited
Pull Requests unless they are small bugfixes.

The Issue Tracker may contain items labelled **help wanted** or **good first issue**
from time to time. This is a good place to look if you want to contribute but aren't sure where to start.

## Pull Requests

We use [Pull Requests](https://help.github.com/articles/about-pull-requests/) for external contributions. Code must be well-tested and not decrease the test coverage significantly.

#### Use a separate branch (not `master`)

Please commit changes to a separate branch in your fork
so that we can work together making changes to it before it
is ready to be merged. Name your branch something like
`<username>/feature`.

Once you are ready, you can create a Pull Request for it to be
merged into the `master` branch in this repo.

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
$ npm run docsify
```

## Contributor License Agreement

Contributions to this project must be accompanied by a Contributor License
Agreement. You (or your employer) retain the copyright to your contribution,
this simply gives us permission to use and redistribute your contributions as
part of the project. Head over to <https://cla.developers.google.com/> to see
your current agreements on file or to sign a new one.

You generally only need to submit a CLA once, so if you've already submitted one
(even if it was for a different project), you probably don't need to do it
again.
