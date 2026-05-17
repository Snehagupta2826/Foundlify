const express = require('express');
const router = express.Router();
const lostItemController = require('../controllers/lostItemController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   POST api/lost-items
// @desc    Create a lost item report
// @access  Private
router.post('/', [auth, upload.single('image')], lostItemController.createLostItem);

// @route   GET api/lost-items
// @desc    Get all lost items
// @access  Public
router.get('/', lostItemController.getLostItems);

// @route   GET api/lost-items/:id
// @desc    Get lost item by ID
// @access  Public
router.get('/:id', lostItemController.getLostItemById);

// @route   GET api/lost-items/:id/matches
// @desc    Get matches for a lost item
// @access  Public
router.get('/:id/matches', lostItemController.getLostItemMatches);

// @route   DELETE api/lost-items/:id
// @desc    Delete a lost item
// @access  Private
router.delete('/:id', auth, lostItemController.deleteLostItem);

// @route   PUT api/lost-items/:id
// @desc    Update a lost item
// @access  Private
router.put('/:id', [auth, upload.single('image')], lostItemController.updateLostItem);

module.exports = router;
