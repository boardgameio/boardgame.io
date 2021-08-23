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

#### Use a separate branch (not `main`)

Please commit changes to a separate branch in your fork
so that we can work together making changes to it before it
is ready to be merged. Name your branch something like
`<username>/feature`.

Once you are ready, you can create a Pull Request for it to be
merged into the `main` branch in this repo.

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

## VS Code remote dev container support

For minimal effort, the repository is configured to run in a remote dev container from VS Code.

- No need to install Node.js or any other project-specific tooling and dependencies
- No risk of your local machine environment getting in the way
- Consistent development environment no matter what OS is used
- Useful extensions preinstalled in the container, independent of your local VS Code settings

### Prerequisites

- [VS Code](https://code.visualstudio.com/) + [Remote Development](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack) extension
- [git](https://git-scm.com/)
- [Docker](https://www.docker.com/)

### Getting started

- Launch VS Code
- Click the Remote Development icon in the bottom left corner of the UI, then "Clone repository in Container Volume..."
- Paste `https://github.com/boardgameio/boardgame.io` or use your own fork, any branch, or a pull request
- The container will start up and install all required dependencies automatically
- Terminal output will cease when everything is set up and ready to go

### Running the examples from the VS Code Explorer

- Open "NPM Scripts" panel in the sidebar
- Click on `package.json > start`

If the NPM scripts panel is not visible in the Explorer sidebar, open the Explorer settings (3 dots) and check "NPM Scripts".
