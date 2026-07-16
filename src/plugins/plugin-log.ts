/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import type { Plugin } from '../types';

interface LogData {
  metadata?: any;
}

export interface LogAPI {
  setMetadata(metadata: any): void;
}

/**
 * Plugin that makes it possible to add metadata to log entries.
 * Metadata set during a move, or during hooks triggered by a directly
 * dispatched game event, is attached to that action's log entry.
 */
const LogPlugin: Plugin<LogAPI, LogData> = {
  name: 'log',

  flush: () => ({}),

  api: ({ data }) => {
    return {
      setMetadata: (metadata) => {
        data.metadata = metadata;
      },
    };
  },

  setup: () => ({}),
};

export default LogPlugin;
