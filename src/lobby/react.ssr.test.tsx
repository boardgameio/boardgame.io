/**
 * @jest-environment node
 */

import React from 'react';
import Lobby from './react';
import ReactDOMServer from 'react-dom/server';

/* mock server requests */
global.fetch = jest
  .fn()
  .mockReturnValue({ ok: true, status: 200, json: () => [] });

describe('lobby', () => {
  test('is rendered', () => {
    const components: any[] = [{ board: 'Board', game: { name: 'GameName' } }];
    const ssrRender = ReactDOMServer.renderToString(
      <Lobby gameServer="localhost" gameComponents={components} />
    );
    expect(ssrRender).toContain('lobby-view');
  });
});
