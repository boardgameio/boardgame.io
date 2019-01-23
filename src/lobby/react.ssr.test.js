/**
 * @jest-environment node
 */

import React from 'react';
import Lobby from './react';
import ReactDOMServer from 'react-dom/server';

/* mock server requests */
global.fetch = jest.fn().mockReturnValue({ status: 200, json: () => [] });

describe('lobby', () => {
  test('is rendered', () => {
    const components = [{ board: 'Board', game: { name: 'GameName' } }];
    const ssrRender = ReactDOMServer.renderToString(
      <Lobby server="localhost" port={8001} gameComponents={components} />
    );
    expect(ssrRender).toContain('lobby-view');
  });
});
