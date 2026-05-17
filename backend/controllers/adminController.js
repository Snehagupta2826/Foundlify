const User = require('../models/User');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getStats = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const lostItemsCount = await LostItem.countDocuments();
        const foundItemsCount = await FoundItem.countDocuments();
        
        res.json({
            userCount,
            lostItemsCount,
            foundItemsCount
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
