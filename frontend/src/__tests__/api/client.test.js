import client from '../../api/client';

describe('API Client', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates an axios client with a defined baseURL', () => {
    expect(client.defaults.baseURL).toBeDefined();
  });

  it('points the default baseURL to localhost:5000/api', () => {
    expect(client.defaults.baseURL).toBe('http://localhost:5000/api');
  });

  it('attaches a Bearer token to outgoing requests when a token is stored', () => {
    localStorage.setItem('token', 'test-token-123');
    const config = client.interceptors.request.handlers[0].fulfilled({ headers: {} });
    expect(config.headers.Authorization).toBe('Bearer test-token-123');
  });

  it('omits the Authorization header when no token is present', () => {
    const config = client.interceptors.request.handlers[0].fulfilled({ headers: {} });
    expect(config.headers.Authorization).toBeUndefined();
  });
});
