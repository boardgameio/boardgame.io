/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { AnyFn, Ctx, Plugin } from '../types';

interface LogMetadataData {
  metadata: object;
}

interface LogMetadataAPI {
  setMetadata(metadata: object): object;
}

/**
 * Plugin that makes it possible to add metadata to log entries.
 * During a move, you can set metadata using ctx.log.setMetadata and it will be
 * available on the log entry for that move.
 */
const LogMetadataPlugin: Plugin = {
  name: 'log',

  flush: () => {
    return { metadata: null };
  },

  api: ({ ctx: Ctx, data }): LogMetadataAPI => {
    const setMetadata = metadata => {
      data.metadata = metadata;
      return metadata;
    };
    return {
      setMetadata,
    };
  },

  setup: ({ G, ctx }) => ({ metadata: null }),
};

export default LogMetadataPlugin;
