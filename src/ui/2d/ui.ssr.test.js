/**
 * @jest-environment node
 */

import React from 'react';
import { UI } from './ui';
import { Card } from './card';
import ReactDOMServer from 'react-dom/server';

test('SSR', () => {
  let ssrRender = ReactDOMServer.renderToString(
    <UI>
      <Card />
    </UI>
  );
  expect(ssrRender).toContain('bgio-card');
});
