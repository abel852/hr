import client from '../../api/client';

describe('API Client', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should create axios instance with correct baseURL', () => {
    expect(client.defaults.baseURL).toBeDefined();
  });

  it('should have default baseURL of localhost:5000/api', () => {
    expect(client.defaults.baseURL).toBe('http://localhost:5000/api');
  });

  it('should set Authorization header when token in localStorage', () => {
    localStorage.setItem('token', 'test-token-123');
    const config = client.interceptors.request.handlers[0].fulfilled({ headers: {} });
    expect(config.headers.Authorization).toBe('Bearer test-token-123');
  });

  it('should not set Authorization header when no token', () => {
    const config = client.interceptors.request.handlers[0].fulfilled({ headers: {} });
    expect(config.headers.Authorization).toBeUndefined();
  });
});
