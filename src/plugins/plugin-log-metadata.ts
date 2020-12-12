/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { AnyFn, Ctx, Plugin } from '../types';

interface LogMetadataData {
  metadata?: any;
}

interface LogMetadataAPI {
  setMetadata(metadata: any): void;
}

/**
 * Plugin that makes it possible to add metadata to log entries.
 * During a move, you can set metadata using ctx.log.setMetadata and it will be
 * available on the log entry for that move.
 */
const LogMetadataPlugin: Plugin<LogMetadataAPI, LogMetadataData> = {
  name: 'log',

  flush: () => ({}),

  api: ({ ctx: Ctx, data }) => {
    const setMetadata = metadata => {
      data.metadata = metadata;
    };
    return {
      setMetadata,
    };
  },

  setup: ({ G, ctx }) => ({}),
};

export default LogMetadataPlugin;