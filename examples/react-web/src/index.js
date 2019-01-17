import React from 'react';
import { render } from 'react-dom';
import { App } from './app';

render(
  <App />,
  document.getElementById('test') || document.createElement('div')
);
