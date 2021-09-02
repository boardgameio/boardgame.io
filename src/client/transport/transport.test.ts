import { Transport } from './transport';

describe('Transport', () => {
  class SimpleTransport extends Transport {
    onAction(): void {}
    connect(): void {}
    disconnect(): void {}
    updateMatchID(): void {}
    updatePlayerID(): void {}
    updateCredentials(): void {}
    onChatMessage(): void {}
    get(key: 'callback' | 'chatMessageCallback' | 'matchDataCallback') {
      return this[key].bind(this);
    }
  }

  test('base class sets up callbacks', () => {
    const transport = new SimpleTransport({});
    expect(transport.get('callback')()).toBeUndefined();
    expect(transport.get('chatMessageCallback')()).toBeUndefined();
    expect(transport.get('matchDataCallback')()).toBeUndefined();
  });
});
