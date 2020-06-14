/**
 * @jest-environment node
 */

import React from 'react';
import { Client } from './react';
import ReactDOMServer from 'react-dom/server';

class TestBoard extends React.Component {
  render() {
    return <div id="my-board">Board</div>;
  }
}

test('board is rendered - ssr', () => {
  const Board = Client({
    game: {},
    board: TestBoard,
  });
  let ssrRender = ReactDOMServer.renderToString(<Board />);
  expect(ssrRender).toContain('bgio-client');
  expect(ssrRender).toContain('my-board');
});
