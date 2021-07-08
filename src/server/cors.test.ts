import { EventEmitter } from 'events';
import cors from 'cors';
import type { Origins as OriginsTS } from './cors';
let { Origins } = require('./cors') as { Origins: typeof OriginsTS };

describe('localhost origin', () => {
  const middleware = cors({ origin: [Origins.LOCALHOST] });

  test('allows localhost', () => {
    const origin = 'http://localhost:8000/';
    const req = createMockRequest(origin);
    const res = new MockResponse();
    middleware(req, res, () => {});
    expect(res._headers['access-control-allow-origin']).toBe(origin);
  });

  test('disallows other origins', () => {
    const req = createMockRequest('http://example.com/');
    const res = new MockResponse();
    middleware(req, res, () => {});
    expect('access-control-allow-origin' in res._headers).toBe(false);
  });
});

describe('development-only localhost origin', () => {
  const reloadOriginsModule = () => {
    jest.resetModules();
    ({ Origins } = require('./cors'));
  };

  const oldNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = oldNodeEnv;
    reloadOriginsModule();
  });

  const origin = 'http://localhost:8000/';

  describe('development environment', () => {
    test('allows localhost', () => {
      const middleware = cors({ origin: [Origins.LOCALHOST_IN_DEVELOPMENT] });
      const req = createMockRequest(origin);
      const res = new MockResponse();
      middleware(req, res, () => {});
      expect(res._headers['access-control-allow-origin']).toBe(origin);
    });
  });

  describe('production environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      reloadOriginsModule();
    });

    test('disallows localhost', () => {
      const middleware = cors({ origin: [Origins.LOCALHOST_IN_DEVELOPMENT] });
      const req = createMockRequest(origin);
      const res = new MockResponse();
      middleware(req, res, () => {});
      expect('access-control-allow-origin' in res._headers).toBe(false);
    });

    test('disallows random URL', () => {
      const middleware = cors({ origin: [Origins.LOCALHOST_IN_DEVELOPMENT] });
      const req = createMockRequest('http://example.com/');
      const res = new MockResponse();
      middleware(req, res, () => {});
      expect('access-control-allow-origin' in res._headers).toBe(false);
    });

    test('allows URL when set alongside localhost', () => {
      const origin = 'http://example.com/';
      const middleware = cors({
        origin: [Origins.LOCALHOST_IN_DEVELOPMENT, origin],
      });
      const req = createMockRequest(origin);
      const res = new MockResponse();
      middleware(req, res, () => {});
      expect(res._headers['access-control-allow-origin']).toBe(origin);
    });
  });
});

/**
 * Create a fake request object from the given origin.
 */
function createMockRequest(origin: string): cors.CorsRequest {
  return { headers: { origin } };
}

/**
 * Class mocking the interface of the request object expected by the
 * CORS middleware package.
 */
class MockResponse extends EventEmitter {
  _headers: Record<string, string>;
  statusCode: number;

  constructor() {
    super();
    this._headers = {};
    this.statusCode = 200;
  }

  end() {
    process.nextTick(
      function () {
        this.emit('finish');
      }.bind(this)
    );
  }

  getHeader(name: string) {
    return this._headers[name.toLowerCase()];
  }

  setHeader(name: string, value: string) {
    this._headers[name.toLowerCase()] = value;
  }
}
