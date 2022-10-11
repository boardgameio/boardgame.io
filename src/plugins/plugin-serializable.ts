import type { Plugin } from '../types';
import isPlainObject from 'lodash.isplainobject';

/**
 * Check if a value can be serialized (e.g. using `JSON.stringify`).
 * Adapted from: https://stackoverflow.com/a/30712764/3829557
 */
function isSerializable(value: any) {
  // Primitives are OK.
  if (
    value === undefined ||
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'string'
  ) {
    return true;
  }

  // A non-primitive value that is neither a POJO or an array cannot be serialized.
  if (!isPlainObject(value) && !Array.isArray(value)) {
    return false;
  }

  // Recurse entries if the value is an object or array.
  for (const key in value) {
    if (!isSerializable(value[key])) return false;
  }

  return true;
}

/**
 * Plugin that checks whether state is serializable, in order to avoid
 * network serialization bugs.
 */
const SerializablePlugin: Plugin = {
  name: 'plugin-serializable',

  fnWrap:
    (move) =>
    (context, ...args) => {
      const result = move(context, ...args);
      // Check state in non-production environments.
      if (process.env.NODE_ENV !== 'production' && !isSerializable(result)) {
        throw new Error(
          'Move state is not JSON-serialiazable.\n' +
            'See https://boardgame.io/documentation/#/?id=state for more information.'
        );
      }
      return result;
    },
};

export default SerializablePlugin;
