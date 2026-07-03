const mongoose = require('mongoose');

describe('Message Model', () => {
  const Message = require('../../models/Message');

  it('should create valid message', () => {
    const msg = new Message({
      messageId: 'MSG001',
      sender: new mongoose.Types.ObjectId(),
      recipient: new mongoose.Types.ObjectId(),
      subject: 'Hello',
      body: 'Test message body'
    });
    expect(msg).toBeDefined();
    expect(msg.status).toBe('unread');
  });

  it('should require messageId', () => {
    const msg = new Message({ sender: new mongoose.Types.ObjectId(), recipient: new mongoose.Types.ObjectId() });
    const err = msg.validateSync();
    expect(err.errors['messageId']).toBeDefined();
  });

  it('should require sender', () => {
    const msg = new Message({ messageId: 'MSG002', recipient: new mongoose.Types.ObjectId() });
    const err = msg.validateSync();
    expect(err.errors['sender']).toBeDefined();
  });

  it('should require recipient', () => {
    const msg = new Message({ messageId: 'MSG003', sender: new mongoose.Types.ObjectId() });
    const err = msg.validateSync();
    expect(err.errors['recipient']).toBeDefined();
  });

  it('should accept all status values', () => {
    for (const s of ['unread', 'read', 'archived']) {
      const msg = new Message({ messageId: `MSG${s}`, sender: new mongoose.Types.ObjectId(), recipient: new mongoose.Types.ObjectId(), status: s });
      const err = msg.validateSync();
      expect(err).toBeUndefined();
    }
  });

  it('should accept attachment types', () => {
    const msg = new Message({
      messageId: 'MSG004',
      sender: new mongoose.Types.ObjectId(),
      recipient: new mongoose.Types.ObjectId(),
      attachments: [{ type: 'image', name: 'photo.png', filePath: '/uploads/photo.png', size: 5000 }]
    });
    const err = msg.validateSync();
    expect(err).toBeUndefined();
  });

  it('should reject invalid attachment type', () => {
    const msg = new Message({
      messageId: 'MSG005',
      sender: new mongoose.Types.ObjectId(),
      recipient: new mongoose.Types.ObjectId(),
      attachments: [{ type: 'video', name: 'vid.mp4', filePath: '/uploads/vid.mp4', size: 5000 }]
    });
    const err = msg.validateSync();
    expect(err).toBeDefined();
  });

  it('should accept trash entries', () => {
    const msg = new Message({
      messageId: 'MSG006',
      sender: new mongoose.Types.ObjectId(),
      recipient: new mongoose.Types.ObjectId(),
      trashEntries: [{ by: new mongoose.Types.ObjectId(), role: 'employee' }]
    });
    const err = msg.validateSync();
    expect(err).toBeUndefined();
  });

  it('should have timestamps', () => {
    const keys = Object.keys(Message.schema.paths);
    expect(keys).toContain('createdAt');
    expect(keys).toContain('updatedAt');
  });
});
