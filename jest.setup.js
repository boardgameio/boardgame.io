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
if (globalThis.MessagePort === undefined) {
  const { MessagePort, MessageChannel } = require('node:worker_threads');
  globalThis.MessagePort = MessagePort;
  globalThis.MessageChannel = MessageChannel;
}
