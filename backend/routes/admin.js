const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin only.' });
    }
};

// @route   GET api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', [auth, isAdmin], adminController.getAllUsers);

// @route   DELETE api/admin/users/:id
// @desc    Delete a user
// @access  Private/Admin
router.delete('/users/:id', [auth, isAdmin], adminController.deleteUser);

// @route   GET api/admin/stats
// @desc    Get platform stats
// @access  Private/Admin
router.get('/stats', [auth, isAdmin], adminController.getStats);

module.exports = router;
