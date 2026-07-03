jest.mock('jsonwebtoken');
jest.mock('../../models/User');
jest.mock('../../models/Role');

const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Role = require('../../models/Role');
const { auth, authorize, permit } = require('../../middleware/auth');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { header: jest.fn() };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('auth', () => {
    it('should return 401 if no token provided', async () => {
      req.header.mockReturnValue(null);
      await auth(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'No token, authorization denied' });
    });

    it('should call next() with valid token and active user', async () => {
      req.header.mockReturnValue('Bearer validtoken');
      jwt.verify.mockReturnValue({ id: 'user123' });
      User.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: 'user123',
          email: 'test@test.com',
          role: 'admin',
          isActive: true,
          employeeId: { _id: 'emp123' }
        })
      });
      Role.findOne.mockResolvedValue({ permissions: ['read:all', 'write:all'] });

      await auth(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.email).toBe('test@test.com');
      expect(req.user.role).toBe('admin');
      expect(req.user.permissions).toEqual(['read:all', 'write:all']);
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 if user not found', async () => {
      req.header.mockReturnValue('Bearer validtoken');
      jwt.verify.mockReturnValue({ id: 'user123' });
      User.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await auth(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 401 if user is inactive', async () => {
      req.header.mockReturnValue('Bearer validtoken');
      jwt.verify.mockReturnValue({ id: 'user123' });
      User.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: 'user123',
          isActive: false
        })
      });

      await auth(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 401 on jwt error', async () => {
      req.header.mockReturnValue('Bearer invalid');
      jwt.verify.mockImplementation(() => { throw new Error('jwt error'); });

      await auth(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should handle user without employeeId', async () => {
      req.header.mockReturnValue('Bearer validtoken');
      jwt.verify.mockReturnValue({ id: 'user123' });
      User.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: 'user123',
          email: 'test@test.com',
          role: 'employee',
          isActive: true,
          employeeId: null
        })
      });
      Role.findOne.mockResolvedValue({ permissions: [] });

      await auth(req, res, next);
      expect(req.user.employeeId).toBeNull();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('should call next() if user has required role', () => {
      req.user = { role: 'admin' };
      const middleware = authorize('admin', 'manager');
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should return 403 if user does not have required role', () => {
      req.user = { role: 'employee' };
      const middleware = authorize('admin', 'manager');
      middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should return 401 if no user', () => {
      req.user = undefined;
      const middleware = authorize('admin');
      middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('permit', () => {
    it('should call next() if user has required permission', () => {
      req.user = { permissions: ['read:all', 'write:all'] };
      const middleware = permit('read:all');
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should call next() if user has any of the required permissions', () => {
      req.user = { permissions: ['read:all'] };
      const middleware = permit('read:all', 'write:all');
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should return 403 if user does not have permission', () => {
      req.user = { permissions: ['read:basic'] };
      const middleware = permit('read:all');
      middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should return 401 if no user', () => {
      req.user = undefined;
      const middleware = permit('read:all');
      middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
