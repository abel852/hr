const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, authorize } = require('../middleware/auth');
const Work = require('../models/Work');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './uploads/work';
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'work-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Employee submit work
router.post('/', auth, upload.array('attachments', 5), async (req, res) => {
  try {
    const attachments = (req.files || []).map(f => ({ name: f.originalname, filePath: f.path, size: f.size }));
    const work = new Work({
      employee: req.user.employeeId,
      title: req.body.title,
      description: req.body.description || '',
      dueAt: req.body.dueAt ? new Date(req.body.dueAt) : null,
      attachments
    });
    await work.save();
    res.status(201).json(work);
  } catch (e) {
    console.error('Submit work error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Manager/Admin review and set status
router.put('/:id/review', auth, authorize('manager', 'admin'), async (req, res) => {
  try {
    const { status, managerComment } = req.body;
    if (!['green','yellow','red'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const work = await Work.findByIdAndUpdate(
      req.params.id,
      { status, managerComment, reviewedBy: req.user.employeeId },
      { new: true }
    );
    if (!work) return res.status(404).json({ message: 'Work not found' });
    res.json(work);
  } catch (e) {
    console.error('Review work error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// List work
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = {};
    if (req.user.role === 'employee') query.employee = req.user.employeeId;
    const works = await Work.find(query).sort({ createdAt: -1 }).limit(parseInt(limit)).skip((parseInt(page) - 1) * parseInt(limit));
    const total = await Work.countDocuments(query);
    res.json({ works, total, totalPages: Math.ceil(total / limit), currentPage: parseInt(page) });
  } catch (e) {
    console.error('List work error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


