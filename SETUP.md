# Placement OS Backend Setup

## आवश्यक Requirements:
- Node.js (v16+)
- MongoDB (local या cloud)
- Git Bash या PowerShell

## Setup Steps:

### 1. Backend Dependencies Install करें:
```bash
cd backend
npm install
```

### 2. Environment File बनाएं:
```bash
# .env file बनाएं (backend folder में)
MONGODB_URI=mongodb://127.0.0.1:27017/placement_os
JWT_SECRET=your_super_secret_key_here_make_it_long_and_random
PORT=3000
```

### 3. MongoDB Start करें:
```bash
# Windows में MongoDB service start करें
net start MongoDB

# या MongoDB Compass से local connection verify करें
```

### 4. Backend Server Start करें:
```bash
cd backend
npm start
```

### 5. Frontend Open करें:
```bash
# Browser में खोलें:
http://localhost:3000/login.html
```

## Troubleshooting:

### MongoDB Connection Error:
- MongoDB installed है? Check करें: `mongod --version`
- MongoDB running है? Check करें: Task Manager में MongoDB service

### Port 3000 Busy:
- `.env` file में PORT=3001 change करें
- API_BASE को `api.js` में update करें

### Permission Issues:
- PowerShell में run करें: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

## Test Commands:
```bash
# Backend health check
curl http://localhost:3000/api/health

# Expected response: {"ok": true}
```
