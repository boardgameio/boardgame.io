import { Transport } from './transport';
import type { TransportOpts } from './transport';

/**
 * This class doesn’t do anything, but simplifies the client class by providing
 * dummy functions to call, so we don’t need to mock them in the client.
 */
class DummyImpl extends Transport {
  connect() {}
  disconnect() {}
  sendAction() {}
  sendChatMessage() {}
  requestSync() {}
  updateCredentials() {}
  updateMatchID() {}
  updatePlayerID() {}
}

export const DummyTransport = (opts: TransportOpts) => new DummyImpl(opts);
