const express = require('express');
const router = express.Router();
const claimController = require('../controllers/claimController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin only.' });
    }
};

// @route   POST api/claims
// @desc    Submit a claim
// @access  Private
router.post('/', [auth, upload.single('proofDocument')], claimController.submitClaim);

// @route   GET api/claims/my-claims
// @desc    Get claims made by the user
// @access  Private
router.get('/my-claims', auth, claimController.getMyClaims);

// @route   GET api/claims/received-claims
// @desc    Get claims received by the user
// @access  Private
router.get('/received-claims', auth, claimController.getReceivedClaims);

// @route   PUT api/claims/:id/respond
// @desc    Approve or reject a claim (Item Owner/Finder)
// @access  Private
router.put('/:id/respond', auth, claimController.respondToClaim);

// @route   GET api/claims
// @desc    Get pending claims (Admin)
// @access  Private/Admin
router.get('/', [auth, isAdmin], claimController.getPendingClaims);

module.exports = router;
