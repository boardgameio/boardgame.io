# snippets

This directory contains the source code for the embedded demos
found in boardgame.io’s documentation.

To work with the snippets, `cd` to this directory and install
the required dependencies:

```sh
cd examples/snippets
npm install
```

## Available commands

### `npm start`

Run a local development server with each snippet on its own
page.

Each snippet will be available at
`https://localhost:1234/<snippet-name>/index.html`.

### `npm build`

Builds the snippets and installs them at the appropriate places
in the docs. Be careful not to let Prettier "un-minify" the
bundled JS while committing the change.
