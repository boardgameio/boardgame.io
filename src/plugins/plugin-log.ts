/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import type { Plugin } from '../types';

export interface LogData {
  metadata?: any;
}

/**
 * Return metadata set by the current move or hook and clear it from the
 * mutable plugin data object used by the log API.
 */
export function consumeLogMetadata(data: LogData | undefined): any {
  const metadata = data?.metadata;
  if (metadata !== undefined) {
    delete data.metadata;
  }
  return metadata;
}

export interface LogAPI {
  setMetadata(metadata: any): void;
}

/**
 * Plugin that makes it possible to add metadata to log entries.
 * Metadata set during a move or a lifecycle hook is attached to the log
 * entry for the move or event that triggered it.
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
