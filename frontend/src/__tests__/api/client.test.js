import client from '../../api/client';

describe('API Client', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('the API client comes with a baseURL ready to go', () => {
    expect(client.defaults.baseURL).toBeDefined();
  });

  it('by default all requests target localhost:5000/api', () => {
    expect(client.defaults.baseURL).toBe('http://localhost:5000/api');
  });

  it('when the user has a token saved, the client sends it as a Bearer header', () => {
    localStorage.setItem('token', 'test-token-123');
    const config = client.interceptors.request.handlers[0].fulfilled({ headers: {} });
    expect(config.headers.Authorization).toBe('Bearer test-token-123');
  });

  it('without a saved token, no Authorization header is sent', () => {
    const config = client.interceptors.request.handlers[0].fulfilled({ headers: {} });
    expect(config.headers.Authorization).toBeUndefined();
  });
});
