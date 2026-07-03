const express = require('express');
const { body, validationResult } = require('express-validator');
const Role = require('../models/Role');
const Department = require('../models/Department');
const Position = require('../models/Position');
const LeavePolicy = require('../models/LeavePolicy');
const { auth, authorize, permit } = require('../middleware/auth');

const router = express.Router();

// Roles
router.get('/roles', auth, authorize('admin'), async (req, res) => {
  const roles = await Role.find();
  res.json(roles);
});

router.post('/roles', auth, authorize('admin'), [
  body('name').isIn(['admin', 'manager', 'employee']),
  body('label').notEmpty(),
  body('permissions').isArray()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const role = await Role.findOneAndUpdate(
    { name: req.body.name },
    { label: req.body.label, permissions: req.body.permissions },
    { new: true, upsert: true }
  );
  res.status(201).json(role);
});

// Departments
router.get('/departments', auth, permit('departments:read'), async (req, res) => {
  const items = await Department.find();
  res.json(items);
});

router.post('/departments', auth, permit('departments:write'), [
  body('name').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const item = new Department(req.body);
  await item.save();
  res.status(201).json(item);
});

router.put('/departments/:id', auth, permit('departments:write'), async (req, res) => {
  const item = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
});

router.delete('/departments/:id', auth, permit('departments:write'), async (req, res) => {
  await Department.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// Positions
router.get('/positions', auth, permit('positions:read'), async (req, res) => {
  const items = await Position.find().populate('department', 'name');
  res.json(items);
});

router.post('/positions', auth, permit('positions:write'), [
  body('title').notEmpty(),
  body('department').isMongoId()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const item = new Position(req.body);
  await item.save();
  res.status(201).json(item);
});

router.put('/positions/:id', auth, permit('positions:write'), async (req, res) => {
  const item = await Position.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
});

router.delete('/positions/:id', auth, permit('positions:write'), async (req, res) => {
  await Position.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// Leave Policies
router.get('/leave-policies', auth, permit('policies:read'), async (req, res) => {
  const items = await LeavePolicy.find();
  res.json(items);
});

router.post('/leave-policies', auth, permit('policies:write'), [
  body('name').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const item = new LeavePolicy(req.body);
  await item.save();
  res.status(201).json(item);
});

router.put('/leave-policies/:id', auth, permit('policies:write'), async (req, res) => {
  const item = await LeavePolicy.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
});

router.delete('/leave-policies/:id', auth, permit('policies:write'), async (req, res) => {
  await LeavePolicy.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;


