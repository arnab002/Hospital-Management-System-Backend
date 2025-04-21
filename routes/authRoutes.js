// backend/routes/authRoutes.js
const express = require('express');
const { 
  login, 
  signup, 
  getMe,
  updateMe,
  changePassword,
  logout 
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logout);

module.exports = router;