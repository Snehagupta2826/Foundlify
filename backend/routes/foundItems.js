const express = require('express');
const router = express.Router();
const foundItemController = require('../controllers/foundItemController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   POST api/found-items
// @desc    Create a found item report
// @access  Private
router.post('/', [auth, upload.single('image')], foundItemController.createFoundItem);

// @route   GET api/found-items
// @desc    Get all found items
// @access  Public
router.get('/', foundItemController.getFoundItems);

// @route   GET api/found-items/:id
// @desc    Get found item by ID
// @access  Public
router.get('/:id', foundItemController.getFoundItemById);

// @route   GET api/found-items/:id/matches
// @desc    Get matches for a found item
// @access  Public
router.get('/:id/matches', foundItemController.getFoundItemMatches);

// @route   DELETE api/found-items/:id
// @desc    Delete a found item
// @access  Private
router.delete('/:id', auth, foundItemController.deleteFoundItem);

// @route   PUT api/found-items/:id
// @desc    Update a found item
// @access  Private
router.put('/:id', [auth, upload.single('image')], foundItemController.updateFoundItem);

module.exports = router;
