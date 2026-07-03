/* eslint-env es2020 */
// Polyfill globals required by some dependencies (e.g. @noble/hashes via
// supertest/formidable/cuid2; koa's request body parsing) when running under
// jsdom.
if (globalThis.TextEncoder === undefined) {
  const { TextEncoder, TextDecoder } = require('node:util');
  globalThis.TextEncoder = TextEncoder;
  globalThis.TextDecoder = TextDecoder;
}
if (globalThis.ReadableStream === undefined) {
  const {
    ReadableStream,
    WritableStream,
    TransformStream,
  } = require('node:stream/web');
  globalThis.ReadableStream = ReadableStream;
  globalThis.WritableStream = WritableStream;
  globalThis.TransformStream = TransformStream;
}
// jsdom strips setImmediate from the test global. React's scheduler prefers
// setImmediate over MessageChannel (scheduler.development.js); restoring it
// lets the scheduler avoid the MessagePort, which would otherwise keep the
// event loop ref'd via .onmessage and force jest to use --forceExit.
if (globalThis.setImmediate === undefined) {
  const { setImmediate, clearImmediate } = require('node:timers');
  globalThis.setImmediate = setImmediate;
  globalThis.clearImmediate = clearImmediate;
}
if (globalThis.MessagePort === undefined) {
  const { MessagePort, MessageChannel } = require('node:worker_threads');
  globalThis.MessagePort = MessagePort;
  globalThis.MessageChannel = MessageChannel;
}
// jsdom does not implement Web Animations. Svelte 5 transitions invoke
// element.animate(); stub it so tests that exercise toggle UI don't crash.
// Stub fires onfinish synchronously so transitions complete and Svelte
// proceeds with DOM removal in the same tick.
if (
  typeof Element !== 'undefined' &&
  typeof Element.prototype.animate !== 'function'
) {
  Element.prototype.animate = function () {
    let onfinish = null;
    const animation = {
      cancel() {},
      finish() {
        if (onfinish) onfinish();
      },
      pause() {},
      play() {},
      reverse() {},
      addEventListener(type, cb) {
        if (type === 'finish') onfinish = cb;
      },
      removeEventListener() {},
      set onfinish(cb) {
        onfinish = cb;
        if (cb) cb();
      },
      get onfinish() {
        return onfinish;
      },
      finished: Promise.resolve(),
    };
    return animation;
  };
}
