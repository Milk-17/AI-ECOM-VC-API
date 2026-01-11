const express = require('express');
const router = express.Router();

// Import controllers
const { 
  register, 
  login, 
  currentUser, 
  forgotPassword, 
  resetPassword, 
  currentAdmin, 
  changePassword 
} = require('../controllers/auth');

// Import middleware
const { authCheck, adminCheck } = require('../middlewares/authCheck');

// --- Routes ---

// 1. Authentication (Register / Login)
router.post('/register', register);
router.post('/login', login);

// 2. Forgot / Reset Password
router.post("/forgot-password", forgotPassword);
// สำคัญ: ต้องมี /:token เพื่อรับค่าจาก useParams ใน React
router.post("/reset-password/:token", resetPassword); 

// 3. Check User / Admin (Middleware)
router.post('/current-user', authCheck, currentUser);
router.post('/current-admin', authCheck, adminCheck, currentAdmin);

// 4. Change Password (User Logged in)
router.put('/user/change-password', authCheck, changePassword);

module.exports = router;