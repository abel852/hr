const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Set default values if not loaded from .env
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PORT = process.env.PORT || '5000';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hr_system';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// Debug environment variables
console.log('Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const attendanceRoutes = require('./routes/attendance');
const leaveRoutes = require('./routes/leave');
const payrollRoutes = require('./routes/payroll');
const cron = require('node-cron');
const Message = require('./models/Message');
const performanceRoutes = require('./routes/performance');
const messageRoutes = require('./routes/messages');
const adminRoutes = require('./routes/admin');
const workRoutes = require('./routes/work');

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Body parser middleware (match message upload limits)
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/payroll', payrollRoutes);

// Daily cron job at 02:00 to escalate 30+ day trash to admin recycle bin
cron.schedule('0 2 * * *', async () => {
  try {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const candidates = await Message.find({
      'adminTrash.active': { $ne: true },
      trashEntries: { $elemMatch: { deletedAt: { $lte: cutoff }, escalatedToAdmin: false, role: { $in: ['employee', 'manager'] } } }
    });
    for (const msg of candidates) {
      msg.trashEntries = msg.trashEntries.map(t => {
        if ((t.role === 'employee' || t.role === 'manager') && t.deletedAt <= cutoff && !t.escalatedToAdmin) {
          return { ...t.toObject(), escalatedToAdmin: true, escalatedAt: new Date() };
        }
        return t;
      });
      msg.adminTrash = { active: true, escalatedFromRole: 'employee', escalatedAt: new Date() };
      await msg.save();
    }
    if (candidates.length > 0) {
      console.log(`[Cron] Escalated ${candidates.length} messages to admin recycle bin`);
    }
  } catch (err) {
    console.error('[Cron] Escalation error:', err.message);
  }
});
app.use('/api/performance', performanceRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/work', workRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large' });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ message: 'Unexpected field' });
  }
  
  res.status(500).json({ 
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  // Simple in-process reminder scheduler (every minute checks reminders due)
  const Notification = require('./models/Notification');
  const Message = require('./models/Message');
  setInterval(async () => {
    try {
      const now = new Date();
      const due = await Notification.find({ dismissed: false, nextReminderAt: { $lte: now } }).populate('message');
      for (const n of due) {
        // if message already read, stop reminders
        if (n.message && n.message.status === 'read') {
          n.dismissed = true;
          await n.save();
          continue;
        }
        // Here you would push a real-time notification or email/SMS
        console.log(`Reminder: unread message ${n.message?._id} for recipient ${n.recipient}`);
        n.lastSentAt = now;
        n.nextReminderAt = new Date(Date.now() + 60 * 60 * 1000); // next hour
        await n.save();
      }
    } catch (e) {
      console.error('Reminder scheduler error:', e.message);
    }
  }, 60 * 1000);
});

// commit-1: feat(server): add CORS configuration for production
