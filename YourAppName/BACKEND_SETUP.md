# Backend Integration Setup Guide

## 🚀 Quick Start

### 1. Backend Setup

1. **Navigate to the Backend folder:**
   ```bash
   cd Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create .env file in the Backend folder:**
   ```bash
   touch .env
   ```

4. **Add the following to your .env file:**
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/mentorapp
   JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
   NODE_ENV=development
   ```

5. **Start MongoDB:**
   - Make sure MongoDB is running on your system
   - If you don't have MongoDB installed, install it from: https://www.mongodb.com/try/download/community

6. **Start the backend server:**
   ```bash
   npm start
   ```
   or
   ```bash
   node server.js
   ```

### 2. Frontend Setup

The frontend is already configured with:
- ✅ Authentication service (`services/authService.ts`)
- ✅ Authentication context (`contexts/AuthContext.tsx`)
- ✅ Updated login screen with backend integration
- ✅ Required dependencies (axios, async-storage)

### 3. Testing the Integration

1. **Start your React Native app:**
   ```bash
   npm start
   ```

2. **Test the login flow:**
   - Try registering a new user
   - Try logging in with existing credentials
   - Check if navigation works properly

## 📁 File Structure

```
Backend/
├── models/
│   └── User.js          # User model with password hashing
├── routes/
│   └── user.js          # Authentication routes
├── server.js            # Express server setup
├── package.json         # Backend dependencies
└── .env                 # Environment variables

Frontend/
├── services/
│   └── authService.ts   # API service for authentication
├── contexts/
│   └── AuthContext.tsx  # Authentication state management
└── app/
    ├── _layout.tsx       # Updated with AuthProvider
    └── index.tsx         # Updated login screen
```

## 🔧 API Endpoints

- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `PUT /api/users/profile` - Update user profile

## 🛠️ Troubleshooting

### Common Issues:

1. **MongoDB Connection Error:**
   - Make sure MongoDB is running
   - Check the MONGO_URI in your .env file

2. **Network Request Failed:**
   - Make sure the backend server is running on port 5000
   - For iOS simulator, use `http://localhost:5000`
   - For Android emulator, use `http://10.0.2.2:5000`

3. **CORS Issues:**
   - The backend already has CORS enabled
   - If you still have issues, check the CORS configuration in server.js

### For Android Emulator:
Update the API_BASE_URL in `services/authService.ts`:
```typescript
const API_BASE_URL = 'http://10.0.2.2:5000/api';
```

### For Physical Device:
Use your computer's IP address:
```typescript
const API_BASE_URL = 'http://YOUR_IP_ADDRESS:5000/api';
```

## 🎯 Next Steps

1. Add form validation
2. Implement forgot password functionality
3. Add user profile management
4. Implement skill selection integration
5. Add error handling and loading states
6. Implement logout functionality in other screens

## 📱 Features Implemented

- ✅ User registration
- ✅ User login
- ✅ JWT token authentication
- ✅ Password hashing
- ✅ Persistent login state
- ✅ Loading states
- ✅ Error handling
- ✅ Form validation
