# HR Management System

A comprehensive Human Resources Management System designed specifically for Ethiopian businesses, featuring modern UI/UX, multi-language support (English & Amharic), and compliance with Ethiopian labor laws and tax regulations.

## 🌟 Features

### 👥 Employee Management

- Complete employee profile management
- Personal information (name, contact, address, emergency contacts)
- Employment details (department, position, hire date, contract type)
- Document upload and storage (ID, contracts, certificates)
- Bank information for payroll processing

### ⏰ Attendance & Time Tracking

- Daily check-in/check-out system
- Overtime calculation
- Late arrival tracking
- Attendance statistics and reports
- Future-ready for biometric integration

### 🌴 Leave Management

- Multiple leave types (annual, sick, maternity, paternity, casual, emergency)
- Approval workflow (Employee → Manager → HR)
- Leave balance tracking
- Half-day leave support
- Work handover assignments

### 💵 Payroll & Salary

- Ethiopian tax calculations (PAYE) with current tax brackets
- Pension deductions (7% employee + 11% employer)
- Allowances and deductions management
- PDF payslip generation
- Bank transfer sheet export (CSV/XLSX) for Ethiopian banks
- Compliance with ERCA regulations

### 📊 Reports & Analytics

- Employee reports and profiles
- Attendance reports (daily, weekly, monthly)
- Payroll reports with tax breakdowns
- Leave usage reports
- Interactive dashboard with charts
- Export to PDF, Excel, CSV formats

### 📈 Performance Management

- KPI definition and tracking
- Performance evaluation system
- Manager and peer reviews
- Goal setting and tracking
- Training history management
- 360-degree feedback

### ⚖️ Legal Compliance (Ethiopian Context)

- 8-hour workday, 48-hour workweek compliance
- Ethiopian national holidays (editable)
- ERCA tax compliance
- Social Security integration
- Ethiopian Labor Law adherence

### 🔐 User Roles & Security

- **Admin (HR Manager)**: Full system access
- **Manager**: Employee management, leave approval, performance evaluation
- **Employee**: Profile viewing, leave requests, payslip download
- JWT-based authentication
- Role-based access control

### 🎨 Modern UI/UX

- Responsive design (mobile, tablet, desktop)
- Dark/Light mode toggle
- Professional HR-themed interface
- Sidebar navigation
- Real-time notifications
- Multi-language support (English & Amharic)

## 🚀 Tech Stack

### Frontend

- **React 18** - Modern UI library
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React i18next** - Internationalization
- **Recharts** - Data visualization
- **React Hook Form** - Form management
- **React Hot Toast** - Notifications
- **Heroicons** - Icon library

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File uploads
- **Puppeteer** - PDF generation
- **Bcryptjs** - Password hashing

### Development Tools

- **Concurrently** - Run multiple scripts
- **Nodemon** - Development server
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### 1. Clone the Repository

```bash
git clone <repository-url>
cd hr-system
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hr_system
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

### 4. Database Setup

Make sure MongoDB is running on your system:

```bash
# Start MongoDB (varies by system)
mongod
```

### 5. Seed Sample Data

```bash
cd backend
npm run seed
```

### 6. Start the Application

```bash
# From root directory - starts both frontend and backend
npm run dev

# Or start individually:
# Backend only
npm run server

# Frontend only
npm run client
```

## 🔑 Default Login Credentials

After seeding the database, you can use these credentials:

- **Admin**: admin@company.com / admin123
- **Manager**: meron.tesfaye@company.com / password123
- **Employee**: dawit.hailu@company.com / password123
- **Employee**: hirut.gebre@company.com / password123

## 📱 Usage

### 1. Login

- Open your browser and navigate to `http://localhost:3000`
- Use the provided credentials to log in
- The system will redirect you based on your role

### 2. Dashboard

- View key metrics and statistics
- Access recent activities
- Quick navigation to all features

### 3. Employee Management

- Add new employees with complete profiles
- Edit employee information
- Upload and manage documents
- Track employment history

### 4. Attendance

- Check in/out daily
- View attendance history
- Monitor overtime and late arrivals
- Generate attendance reports

### 5. Leave Management

- Request leave with proper workflow
- Approve/reject leave requests
- Track leave balances
- Monitor leave usage

### 6. Payroll

- Generate monthly payroll
- Calculate Ethiopian taxes and deductions
- Generate PDF payslips
- Export bank transfer sheets

### 7. Reports

- Generate comprehensive reports
- Export in multiple formats
- View analytics and trends
- Customize report parameters

## 🌍 Internationalization

The system supports both English and Amharic languages:

- Toggle language using the language selector in the header
- All UI text is translated
- Date and number formats are localized
- RTL support for Amharic text

## 🎨 Theming

- Toggle between light and dark modes
- Theme preference is saved locally
- Responsive design for all screen sizes
- Professional HR-themed color scheme

## 📊 API Documentation

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Employee Endpoints

- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create employee
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Attendance Endpoints

- `GET /api/attendance` - Get attendance records
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance/stats` - Get attendance statistics

### Leave Endpoints

- `GET /api/leave` - Get leave requests
- `POST /api/leave` - Create leave request
- `PUT /api/leave/:id/approve` - Approve leave
- `PUT /api/leave/:id/reject` - Reject leave
- `GET /api/leave/balance/:employeeId` - Get leave balance

### Payroll Endpoints

- `GET /api/payroll` - Get payroll records
- `POST /api/payroll/generate` - Generate payroll
- `GET /api/payroll/:id/payslip` - Download payslip
- `GET /api/payroll/export/bank-transfer` - Export bank transfer

## 🚀 Deployment

### Backend Deployment (Render/Heroku)

1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Frontend Deployment (Vercel/Netlify)

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `build`
4. Deploy automatically on push

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
JWT_EXPIRE=7d
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

## 🔧 Configuration

### Tax Settings

The system includes Ethiopian tax brackets for 2024. To update:

1. Modify `backend/utils/payrollCalculations.js`
2. Update tax brackets in `calculatePAYE` function
3. Restart the application

### Holiday Configuration

1. Access Settings → Holidays
2. Add/remove national holidays
3. Configure company-specific holidays
4. Set working days and hours

### Department Management

1. Access Settings → Departments
2. Add new departments
3. Configure positions
4. Set organizational hierarchy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- [ ] Biometric integration
- [ ] Mobile app (React Native)
- [ ] Advanced analytics with AI
- [ ] Integration with Ethiopian banks
- [ ] Multi-company support
- [ ] Advanced reporting with BI tools
- [ ] Employee self-service portal
- [ ] Training management system
- [ ] Recruitment module
- [ ] Performance analytics dashboard

## 📞 Contact

For any questions or support, please contact:

- Email: support@hrsystem.com
- Phone: +251-XXX-XXXXXX
- Website: https://hrsystem.com

---

**Built with ❤️ for Ethiopian businesses**


