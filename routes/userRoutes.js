const express = require("express");
const { protect, authorize } = require('../middlewares/auth');
const {getAllUsers, getCurrentUser, UpdateUserProfile, DeleteUserProfile} = require("../controllers/userController");

const router = express.Router();

// Get all users (Admin only)
router.route('/')
      .get(protect, authorize('admin'), getAllUsers);

// Get current user details
router.route('/me')
      .get(protect, authorize('admin'), getCurrentUser);

// Update user profile
router.route('/update')
      .put(protect, authorize('admin'), UpdateUserProfile);

// Delete user (Admin only)
router.route('/:id')
      .delete(protect, authorize('admin'), DeleteUserProfile);

module.exports = router;
