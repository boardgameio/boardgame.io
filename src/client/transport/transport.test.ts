import { Transport } from './transport';

describe('Transport', () => {
  class SimpleTransport extends Transport {
    connect() {}
    disconnect() {}
    sendAction() {}
    sendChatMessage() {}
    requestSync() {}
    updateMatchID() {}
    updatePlayerID() {}
    updateCredentials() {}
    get(key: 'callback') {
      return this[key].bind(this);
    }
  }

  test('base class sets up callbacks', () => {
    const transport = new SimpleTransport({ clientCallback: () => {} });
    expect(transport.get('callback')()).toBeUndefined();
  });
});
