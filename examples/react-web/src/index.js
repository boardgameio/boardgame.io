import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app';

const container =
  document.getElementById('test') || document.createElement('div');
const root = createRoot(container);
root.render(<App />);
