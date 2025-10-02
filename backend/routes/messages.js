const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Message = require('../models/Message');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');
const { auth, authorize } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Configure multer for message attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './uploads/messages';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'msg-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB per file
  },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx|txt/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Invalid file type'));
  }
});

// Helper to resolve recipient by id, employee code, or email
const mongoose = require('mongoose');
async function resolveEmployeeIdentifier(identifier) {
  if (!identifier) return null;
  // ObjectId
  if (mongoose.isValidObjectId(identifier)) {
    const emp = await Employee.findById(identifier);
    if (emp) return emp;
  }
  // By employee code
  let emp = await Employee.findOne({ employeeId: identifier });
  if (emp) return emp;
  // By email
  emp = await Employee.findOne({ 'personalInfo.email': identifier.toLowerCase() });
  return emp;
}

// @route   GET /api/messages
// @desc    List conversation messages with a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { withUser, page = 1, limit = 20 } = req.query;

    if (!withUser) {
      return res.status(400).json({ message: 'withUser (employee id) is required' });
    }

    // Ensure recipient exists
    const other = await Employee.findById(withUser);
    if (!other) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    const currentEmployeeId = req.user.employeeId;

    const query = {
      $or: [
        { sender: currentEmployeeId, recipient: withUser },
        { sender: withUser, recipient: currentEmployeeId }
      ],
      deletedFor: { $nin: [currentEmployeeId] },
      status: { $ne: 'archived' }
    };

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Message.countDocuments(query);

    res.json({
      messages: messages.reverse(),
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('List messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/messages
// @desc    Send a text message
// @access  Private
router.post('/', auth, [
  body('recipient').optional(),
  body('recipients').optional().isArray(),
  body('subject').optional().isString().trim(),
  body('body').optional().isString().trim(),
  body('replyTo').optional().isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let { recipient, recipients, subject, body: bodyText, replyTo } = req.body;

    // normalize recipients: accept single string or array
    if (recipients && !Array.isArray(recipients)) {
      recipients = [recipients];
    }

    const ids = [];
    if (Array.isArray(recipients) && recipients.length > 0) {
      for (const r of recipients) {
        const emp = await resolveEmployeeIdentifier(r);
        if (emp) ids.push(emp._id);
      }
    } else if (recipient) {
      const emp = await resolveEmployeeIdentifier(recipient);
      if (emp) ids.push(emp._id);
    }
    if (ids.length === 0) {
      return res.status(400).json({ message: 'Recipients are required' });
    }

    if (!bodyText && !req.files?.length) {
      return res.status(400).json({ message: 'Message content or attachment is required' });
    }

    const created = [];
    for (const rid of ids) {
      const message = new Message({
        messageId: uuidv4(),
        sender: req.user.employeeId,
        recipient: rid,
        subject: subject || '',
        body: bodyText || '',
        replyTo: replyTo || null
      });
      await message.save();
      // create notification for recipient
      await Notification.create({ recipient: rid, message: message._id });
      created.push(message);
    }

    res.status(201).json({ count: created.length, messages: created });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/messages/attachments
// @desc    Send message with attachments
// @access  Private
router.post('/attachments', auth, upload.array('attachments', 10), async (req, res) => {
  try {
    let { recipient, recipients } = req.body;
    if (recipients && !Array.isArray(recipients)) {
      recipients = [recipients];
    }
    const ids = [];
    if (Array.isArray(recipients) && recipients.length > 0) {
      for (const r of recipients) {
        const emp = await resolveEmployeeIdentifier(r);
        if (emp) ids.push(emp._id);
      }
    } else if (recipient) {
      const emp = await resolveEmployeeIdentifier(recipient);
      if (emp) ids.push(emp._id);
    }
    if (ids.length === 0) {
      return res.status(400).json({ message: 'Recipients are required' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const attachments = req.files.map(f => ({
      type: f.mimetype.startsWith('image/') ? 'image' : 'file',
      name: f.originalname,
      filePath: (f.path || '').replace(/\\/g, '/').replace(/^\.\//, ''),
      size: f.size
    }));

    const created = [];
    for (const rid of ids) {
      const message = new Message({
        messageId: uuidv4(),
        sender: req.user.employeeId,
        recipient: rid,
        subject: req.body.subject || '',
        body: req.body.body || '',
        attachments,
        replyTo: req.body.replyTo || null
      });
      await message.save();
      await Notification.create({ recipient: rid, message: message._id });
      created.push(message);
    }
    res.status(201).json({ count: created.length, messages: created });
  } catch (error) {
    console.error('Send attachments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.recipient.toString() !== req.user.employeeId.toString()) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    message.status = 'read';
    message.readAt = new Date();
    await message.save();
    res.json(message);
  } catch (error) {
    console.error('Read message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/messages/:id
// @desc    Soft-delete message for current user
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const userEmpId = req.user.employeeId;
    if (message.sender.toString() !== userEmpId.toString() && message.recipient.toString() !== userEmpId.toString()) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    if (!message.deletedFor.find(id => id.toString() === userEmpId.toString())) {
      message.deletedFor.push(userEmpId);
    }
    // record role-aware trash entry for escalation
    const role = req.user.role;
    const existing = (message.trashEntries || []).find(t => t.by.toString() === userEmpId.toString());
    if (!existing) {
      message.trashEntries = message.trashEntries || [];
      message.trashEntries.push({ by: userEmpId, role, deletedAt: new Date(), escalatedToAdmin: false });
    }
    await message.save();

    res.json({ message: 'Moved to recycle bin' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/inbox
// @desc    Get latest conversations for current user
// @access  Private
router.get('/inbox/summary', auth, async (req, res) => {
  try {
    const userEmpId = req.user.employeeId;

    const pipeline = [
      { $match: { $or: [ { sender: userEmpId }, { recipient: userEmpId } ], deletedFor: { $nin: [userEmpId] }, status: { $ne: 'archived' } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', userEmpId] }, '$recipient', '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: { $sum: { $cond: [ { $and: [ { $eq: ['$recipient', userEmpId] }, { $eq: ['$status', 'unread'] } ] }, 1, 0 ] } }
        }
      }
    ];

    const conversations = await Message.aggregate(pipeline);
    res.json(conversations);
  } catch (error) {
    console.error('Inbox summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/messages/broadcast
// @desc    Broadcast a message to a role or department
// @access  Private (Admin)
router.post('/broadcast', auth, authorize('admin'), upload.array('attachments', 5), async (req, res) => {
  try {
    const { targetRole, targetDepartment, subject, body: bodyText } = req.body;
    if (!targetRole && !targetDepartment) {
      return res.status(400).json({ message: 'targetRole or targetDepartment is required' });
    }

    let recipientsQuery = {};
    if (targetDepartment) {
      recipientsQuery['employmentInfo.department'] = targetDepartment;
    }
    // Role-based broadcast uses User role -> Employee ids
    let employeeIds = [];
    if (targetRole) {
      const employees = await Employee.find(recipientsQuery);
      const users = await require('../models/User').find({ role: targetRole, employeeId: { $in: employees.map(e => e._id) } });
      employeeIds = users.map(u => u.employeeId.toString());
    } else {
      const employees = await Employee.find(recipientsQuery, '_id');
      employeeIds = employees.map(e => e._id.toString());
    }

    const attachments = (req.files || []).map(f => ({
      type: f.mimetype.startsWith('image/') ? 'image' : 'file',
      name: f.originalname,
      filePath: f.path,
      size: f.size
    }));

    const messages = await Promise.all(employeeIds.map(async rid => {
      const msg = new Message({
        messageId: uuidv4(),
        sender: req.user.employeeId,
        recipient: rid,
        subject: subject || '',
        body: bodyText || '',
        attachments
      });
      await msg.save();
      return msg._id;
    }));

    res.status(201).json({ count: messages.length });
  } catch (error) {
    console.error('Broadcast message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/messages/:id/archive
// @desc    Archive a message
// @access  Private
router.put('/:id/archive', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    const userEmpId = req.user.employeeId.toString();
    if (message.sender.toString() !== userEmpId && message.recipient.toString() !== userEmpId) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    message.status = 'archived';
    await message.save();
    res.json(message);
  } catch (error) {
    console.error('Archive message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/archived/:userId
// @desc    List archived messages for user
// @access  Private
router.get('/archived/:userId', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.params.userId;
    if (req.user.role === 'employee' && req.user.employeeId.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const query = {
      status: 'archived',
      $or: [ { sender: userId }, { recipient: userId } ],
      deletedFor: { $ne: userId }
    };
    const messages = await Message.find(query).sort({ updatedAt: -1 }).limit(parseInt(limit)).skip((parseInt(page) - 1) * parseInt(limit));
    const total = await Message.countDocuments(query);
    res.json({ messages, total, totalPages: Math.ceil(total / limit), currentPage: parseInt(page) });
  } catch (error) {
    console.error('List archived error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/recipients
// @desc    Get available recipients based on role
// @access  Private
router.get('/recipients', auth, async (req, res) => {
  try {
    const { search = '' } = req.query;
    const query = {};

    // Role-based scoping
    if (req.user.role === 'admin') {
      // all employees
    } else if (req.user.role === 'manager') {
      const me = await Employee.findById(req.user.employeeId);
      if (me?.employmentInfo?.department) {
        query['employmentInfo.department'] = me.employmentInfo.department;
      }
    } else {
      // employee: same department or manager
      const me = await Employee.findById(req.user.employeeId);
      if (me?.employmentInfo?.department) {
        query['employmentInfo.department'] = me.employmentInfo.department;
      }
    }

    if (search) {
      query.$or = [
        { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
        { 'personalInfo.email': { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    const employees = await Employee.find(query)
      .limit(50)
      .sort({ 'personalInfo.firstName': 1 });

    // attach role info
    const users = await require('../models/User').find({ employeeId: { $in: employees.map(e => e._id) } });
    const userRoleMap = new Map(users.map(u => [u.employeeId.toString(), u.role]));

    const mapped = employees.map(e => ({
      _id: e._id,
      name: `${e.personalInfo.firstName} ${e.personalInfo.lastName}`,
      email: e.personalInfo.email,
      employeeCode: e.employeeId,
      role: userRoleMap.get(e._id.toString()) || 'employee',
      department: e.employmentInfo.department
    }));
    res.json(mapped);
  } catch (error) {
    console.error('Get recipients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dedicated inbox/sent endpoints per spec
// @route   GET /api/messages/inbox/:userId
router.get('/inbox/:userId', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.params.userId;
    if (req.user.role === 'employee' && req.user.employeeId.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const query = { recipient: userId, deletedFor: { $nin: [userId] }, status: { $ne: 'archived' } };
    const messages = await Message.find(query).sort({ createdAt: -1 }).limit(parseInt(limit)).skip((parseInt(page) - 1) * parseInt(limit));
    const total = await Message.countDocuments(query);
    res.json({ messages, total, totalPages: Math.ceil(total / limit), currentPage: parseInt(page) });
  } catch (error) {
    console.error('Inbox list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/sent/:userId
router.get('/sent/:userId', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.params.userId;
    if (req.user.role === 'employee' && req.user.employeeId.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const query = { sender: userId, deletedFor: { $nin: [userId] }, status: { $ne: 'archived' } };
    const messages = await Message.find(query).sort({ createdAt: -1 }).limit(parseInt(limit)).skip((parseInt(page) - 1) * parseInt(limit));
    const total = await Message.countDocuments(query);
    res.json({ messages, total, totalPages: Math.ceil(total / limit), currentPage: parseInt(page) });
  } catch (error) {
    console.error('Sent list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Convenience endpoints using current user
router.get('/inbox', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userEmpId = req.user.employeeId;
    const query = { recipient: userEmpId, deletedFor: { $nin: [userEmpId] }, status: { $ne: 'archived' } };
    const messages = await Message.find(query).sort({ createdAt: -1 }).limit(parseInt(limit)).skip((parseInt(page) - 1) * parseInt(limit));
    const total = await Message.countDocuments(query);
    res.json({ messages, total, totalPages: Math.ceil(total / limit), currentPage: parseInt(page) });
  } catch (error) {
    console.error('Inbox (me) error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/sent', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userEmpId = req.user.employeeId;
    const query = { sender: userEmpId, deletedFor: { $nin: [userEmpId] }, status: { $ne: 'archived' } };
    const messages = await Message.find(query).sort({ createdAt: -1 }).limit(parseInt(limit)).skip((parseInt(page) - 1) * parseInt(limit));
    const total = await Message.countDocuments(query);
    res.json({ messages, total, totalPages: Math.ceil(total / limit), currentPage: parseInt(page) });
  } catch (error) {
    console.error('Sent (me) error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/archived', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userEmpId = req.user.employeeId;
    const query = { status: 'archived', $or: [ { sender: userEmpId }, { recipient: userEmpId } ], deletedFor: { $nin: [userEmpId] } };
    const messages = await Message.find(query).sort({ updatedAt: -1 }).limit(parseInt(limit)).skip((parseInt(page) - 1) * parseInt(limit));
    const total = await Message.countDocuments(query);
    res.json({ messages, total, totalPages: Math.ceil(total / limit), currentPage: parseInt(page) });
  } catch (error) {
    console.error('Archived (me) error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Recycle bin (trash) endpoints
// @route   GET /api/messages/trash
// @desc    List messages deleted by current user
// @access  Private
router.get('/trash', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userEmpId = req.user.employeeId;
    const query = { deletedFor: { $in: [userEmpId] }, 'adminTrash.active': { $ne: true } };
    const messages = await Message.find(query).sort({ updatedAt: -1 }).limit(parseInt(limit)).skip((parseInt(page) - 1) * parseInt(limit));
    const total = await Message.countDocuments(query);
    res.json({ messages, total, totalPages: Math.ceil(total / limit), currentPage: parseInt(page) });
  } catch (error) {
    console.error('Trash (me) error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/messages/:id/restore
// @desc    Restore a message from trash for current user
// @access  Private
router.put('/:id/restore', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    const userEmpId = req.user.employeeId.toString();
    const idx = message.deletedFor.findIndex(id => id.toString() === userEmpId);
    if (idx !== -1) {
      message.deletedFor.splice(idx, 1);
    }
    if (Array.isArray(message.trashEntries)) {
      const tidx = message.trashEntries.findIndex(t => t.by.toString() === userEmpId);
      if (tidx !== -1) message.trashEntries.splice(tidx, 1);
    }
    await message.save();
    res.json({ message: 'Restored' });
  } catch (error) {
    console.error('Restore message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/messages/:id/purge
// @desc    Permanently delete message if all parties deleted, otherwise keep hidden for current user
// @access  Private
router.delete('/:id/purge', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    const userEmpId = req.user.employeeId.toString();
    if (!message.deletedFor.find(id => id.toString() === userEmpId)) {
      return res.status(400).json({ message: 'Message must be in trash before purge' });
    }

    const otherParty = [message.sender.toString(), message.recipient.toString()].find(id => id !== userEmpId);
    const otherDeleted = message.deletedFor.find(id => id.toString() === otherParty);

    if (otherDeleted) {
      // escalate to admin recycle bin instead of hard-delete
      message.adminTrash = {
        active: true,
        escalatedFromRole: req.user.role === 'admin' ? null : req.user.role,
        escalatedAt: new Date()
      };
      await message.save();
      return res.json({ message: 'Moved to admin recycle bin' });
    }

    // Keep hidden for current user; already in deletedFor
    res.json({ message: 'Deleted for you; waiting for other party to purge' });
  } catch (error) {
    console.error('Purge message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin recycle bin endpoints
// List admin trash
router.get('/admin/trash', auth, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const query = { 'adminTrash.active': true };
    const messages = await Message.find(query)
      .sort({ 'adminTrash.escalatedAt': -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    const total = await Message.countDocuments(query);
    res.json({ messages, total, totalPages: Math.ceil(total / limit), currentPage: parseInt(page) });
  } catch (error) {
    console.error('Admin trash list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin restore
router.put('/admin/restore/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    message.deletedFor = [];
    message.trashEntries = [];
    message.adminTrash = { active: false, escalatedFromRole: null, escalatedAt: null };
    await message.save();
    res.json({ message: 'Restored by admin' });
  } catch (error) {
    console.error('Admin restore error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin purge
router.delete('/admin/purge/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    await Message.findByIdAndDelete(message._id);
    res.json({ message: 'Permanently deleted by admin' });
  } catch (error) {
    console.error('Admin purge error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Manual escalation (admin)
router.post('/maintenance/escalate', auth, authorize('admin'), async (req, res) => {
  try {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const candidates = await Message.find({
      'adminTrash.active': { $ne: true },
      trashEntries: { $elemMatch: { deletedAt: { $lte: cutoff }, escalatedToAdmin: false, role: { $in: ['employee', 'manager'] } } }
    });
    let escalated = 0;
    for (const msg of candidates) {
      msg.trashEntries = msg.trashEntries.map(t => {
        if ((t.role === 'employee' || t.role === 'manager') && t.deletedAt <= cutoff && !t.escalatedToAdmin) {
          return { ...t.toObject(), escalatedToAdmin: true, escalatedAt: new Date() };
        }
        return t;
      });
      msg.adminTrash = { active: true, escalatedFromRole: 'employee', escalatedAt: new Date() };
      await msg.save();
      escalated++;
    }
    res.json({ message: 'Escalation completed', escalated });
  } catch (error) {
    console.error('Maintenance escalate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;



// commit-81: feat(messages): add send message endpoint

// commit-82: feat(messages): add inbox and sent endpoints
