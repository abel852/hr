# Troubleshooting Guide

## Common Issues and Solutions

### 1. Application Won't Start

#### Issue: "Module not found" errors

**Solution:**

```bash
# Install all dependencies
npm run install-all

# Or install manually:
npm install
cd backend && npm install
cd ../frontend && npm install
```

#### Issue: MongoDB connection error

**Solution:**

1. Make sure MongoDB is running on your system
2. Check if the connection string in `.env` is correct
3. Default connection: `mongodb://localhost:27017/hr_system`

#### Issue: Port already in use

**Solution:**

```bash
# Kill process using port 5000 (backend)
npx kill-port 5000

# Kill process using port 3000 (frontend)
npx kill-port 3000
```

### 2. Frontend Issues

#### Issue: "Cannot resolve module" errors

**Solution:**

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### Issue: Tailwind CSS not working

**Solution:**
Make sure you have the correct Tailwind configuration:

```bash
cd frontend
npx tailwindcss init -p
```

### 3. Backend Issues

#### Issue: JWT secret not defined

**Solution:**
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

#### Issue: File upload errors

**Solution:**
Make sure the uploads directory exists:

```bash
mkdir -p backend/uploads/documents
mkdir -p backend/uploads/leave-attachments
```

### 4. Database Issues

#### Issue: No data showing

**Solution:**
Seed the database with sample data:

```bash
cd backend
npm run seed
```

#### Issue: MongoDB connection refused

**Solution:**

1. Start MongoDB service:
   - Windows: `net start MongoDB`
   - macOS: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

### 5. Build Issues

#### Issue: Build fails

**Solution:**

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# For frontend specifically:
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 6. Runtime Errors

#### Issue: "Cannot read property of undefined"

**Solution:**
This usually means the API is not running or there's a connection issue. Check:

1. Backend is running on port 5000
2. Frontend is running on port 3000
3. CORS is properly configured
4. API endpoints are correct

### 7. Quick Fix Commands

```bash
# Complete reset and reinstall
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
npm install
cd backend && npm install
cd ../frontend && npm install
cd .. && npm run dev
```

### 8. Environment Setup

#### Windows:

```cmd
# Run the batch file
start.bat
```

#### macOS/Linux:

```bash
# Make script executable
chmod +x start.sh

# Run the script
./start.sh
```

### 9. Manual Start Process

If automated scripts don't work:

1. **Start MongoDB** (if not running)
2. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```
3. **Start Frontend** (in new terminal):
   ```bash
   cd frontend
   npm start
   ```

### 10. Check Logs

Look for error messages in:

- Terminal/Console output
- Browser Developer Tools (F12)
- Network tab for API calls
- MongoDB logs

### 11. Common Error Messages

#### "EADDRINUSE: address already in use"

- Kill the process using the port
- Or change the port in .env file

#### "MongoError: connect ECONNREFUSED"

- Start MongoDB service
- Check connection string

#### "Module not found: Can't resolve"

- Run `npm install` in the correct directory
- Check if the module is in package.json

#### "CORS error"

- Check if backend is running
- Verify CORS configuration in server.js

### 12. Getting Help

If you're still having issues:

1. Check the console/terminal for specific error messages
2. Make sure all dependencies are installed
3. Verify MongoDB is running
4. Check if ports 3000 and 5000 are available
5. Try the complete reset process above

## System Requirements

- Node.js 16+
- MongoDB 4.4+
- npm or yarn
- Modern web browser
