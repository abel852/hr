const mongoose = require('mongoose');

describe('Notification Model', () => {
  const Notification = require('../../models/Notification');

  it('should create valid notification', () => {
    const n = new Notification({
      recipient: new mongoose.Types.ObjectId(),
      message: new mongoose.Types.ObjectId()
    });
    expect(n).toBeDefined();
    expect(n.type).toBe('message');
    expect(n.dismissed).toBe(false);
    expect(n.nextReminderAt).toBeDefined();
  });

  it('should require recipient', () => {
    const n = new Notification({ message: new mongoose.Types.ObjectId() });
    const err = n.validateSync();
    expect(err.errors['recipient']).toBeDefined();
  });

  it('should require message', () => {
    const n = new Notification({ recipient: new mongoose.Types.ObjectId() });
    const err = n.validateSync();
    expect(err.errors['message']).toBeDefined();
  });

  it('should accept only message type', () => {
    const n = new Notification({ recipient: new mongoose.Types.ObjectId(), message: new mongoose.Types.ObjectId(), type: 'message' });
    const err = n.validateSync();
    expect(err).toBeUndefined();
  });

  it('should have default nextReminderAt set to future', () => {
    const n = new Notification({ recipient: new mongoose.Types.ObjectId(), message: new mongoose.Types.ObjectId() });
    expect(n.nextReminderAt.getTime()).toBeGreaterThan(Date.now() - 1000);
  });

  it('should have compound index', () => {
    const indexes = Notification.schema.indexes();
    const match = indexes.some(idx => idx[0].recipient === 1 && idx[0].dismissed === 1 && idx[0].nextReminderAt === 1);
    expect(match).toBe(true);
  });

  it('should have timestamps', () => {
    const keys = Object.keys(Notification.schema.paths);
    expect(keys).toContain('createdAt');
    expect(keys).toContain('updatedAt');
  });
});
