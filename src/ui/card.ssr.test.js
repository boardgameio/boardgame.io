/**
 * @jest-environment node
 */

import React from 'react';
import { Card } from './card';
import ReactDOMServer from 'react-dom/server';

test('Card is rendered - ssr', () => {
  let ssrRender = ReactDOMServer.renderToString(<Card />);
  expect(ssrRender).toContain('bgio-card');
});
