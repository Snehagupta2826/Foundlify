const FoundItem = require('../models/FoundItem');
const Notification = require('../models/Notification');
const { detectMatchesForFoundItem } = require('../utils/matchDetector');
const { generateUniqueId } = require('../utils/generateId');

exports.createFoundItem = async (req, res) => {
    try {
        const { title, category, description, location, dateFound, contactInfo } = req.body;
        let imageUrl = '';
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }

        // Duplicate Check
        const duplicate = await FoundItem.findOne({
            title,
            category,
            location,
            dateFound,
            userId: req.user.id
        });

        if (duplicate) {
            await Notification.create({
                userId: req.user.id,
                message: 'Duplicate item entry detected.'
            });
            return res.status(400).json({ message: 'Duplicate item entry detected.' });
        }

        const uniqueId = await generateUniqueId('FD');

        const newFoundItem = new FoundItem({
            uniqueId,
            title,
            category,
            description,
            image: imageUrl,
            location,
            dateFound,
            contactInfo,
            userId: req.user.id
        });

        const savedItem = await newFoundItem.save();

        // Run match detection asynchronously
        detectMatchesForFoundItem(savedItem);

        res.status(201).json(savedItem);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getFoundItems = async (req, res) => {
    try {
        const items = await FoundItem.find().populate('userId', 'name').sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getFoundItemById = async (req, res) => {
    try {
        const item = await FoundItem.findById(req.params.id).populate('userId', 'name email');
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json(item);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.status(500).send('Server Error');
    }
};

exports.getFoundItemMatches = async (req, res) => {
    try {
        const foundItem = await FoundItem.findById(req.params.id);
        if (!foundItem) return res.status(404).json({ message: 'Item not found' });

        const potentialMatches = await require('../models/LostItem').find({
            category: foundItem.category,
            status: 'active'
        });

        const getKeywords = (text) => text ? text.toLowerCase().split(/\s+/).filter(w => w.length >= 3) : [];
        const k1 = getKeywords(foundItem.title + ' ' + foundItem.description);

        const matches = potentialMatches.map(lost => {
            let score = 20;
            if (foundItem.color && lost.color && foundItem.color.toLowerCase() === lost.color.toLowerCase()) score += 15;
            
            const k2 = getKeywords(lost.title + ' ' + lost.description);
            let keywordMatches = 0;
            for (const kw of k1) {
                if (k2.some(k => k.includes(kw) || kw.includes(k))) keywordMatches++;
            }
            score += Math.min(40, keywordMatches * 10);

            if (foundItem.location && lost.location) {
                const l1 = foundItem.location.toLowerCase();
                const l2 = lost.location.toLowerCase();
                if (l1.includes(l2) || l2.includes(l1)) score += 15;
            }

            return { item: lost, score };
        }).filter(m => m.score >= 40).sort((a, b) => b.score - a.score);

        res.json(matches.map(m => m.item));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteFoundItem = async (req, res) => {
    try {
        const item = await FoundItem.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        // Check user
        if (item.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await item.deleteOne();
        res.json({ message: 'Item removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateFoundItem = async (req, res) => {
    try {
        let item = await FoundItem.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        // Check user
        if (item.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const { title, category, description, location, dateFound, contactInfo, status } = req.body;
        
        let imageUrl = item.image;
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }

        item = await FoundItem.findByIdAndUpdate(
            req.params.id,
            { $set: { title, category, description, location, dateFound, contactInfo, status, image: imageUrl } },
            { new: true }
        );

        res.json(item);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
