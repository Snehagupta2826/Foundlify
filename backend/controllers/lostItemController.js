const LostItem = require('../models/LostItem');
const Notification = require('../models/Notification');
const { detectMatchesForLostItem } = require('../utils/matchDetector');
const { generateUniqueId } = require('../utils/generateId');

exports.createLostItem = async (req, res) => {
    try {
        const { title, category, description, location, dateLost, contactInfo } = req.body;
        let imageUrl = '';
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }

        // Duplicate Check
        const duplicate = await LostItem.findOne({
            title,
            category,
            location,
            dateLost,
            userId: req.user.id
        });

        if (duplicate) {
            await Notification.create({
                userId: req.user.id,
                message: 'Duplicate item entry detected.'
            });
            return res.status(400).json({ message: 'Duplicate item entry detected.' });
        }

        const uniqueId = await generateUniqueId('LF');

        const newLostItem = new LostItem({
            uniqueId,
            title,
            category,
            description,
            image: imageUrl,
            location,
            dateLost,
            contactInfo,
            userId: req.user.id
        });

        const savedItem = await newLostItem.save();
        
        // Run match detection asynchronously
        detectMatchesForLostItem(savedItem);

        res.status(201).json(savedItem);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getLostItems = async (req, res) => {
    try {
        const items = await LostItem.find().populate('userId', 'name').sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getLostItemById = async (req, res) => {
    try {
        const item = await LostItem.findById(req.params.id).populate('userId', 'name email');
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

exports.getLostItemMatches = async (req, res) => {
    try {
        const lostItem = await LostItem.findById(req.params.id);
        if (!lostItem) return res.status(404).json({ message: 'Item not found' });

        const potentialMatches = await require('../models/FoundItem').find({
            category: lostItem.category,
            status: 'active'
        });

        const getKeywords = (text) => text ? text.toLowerCase().split(/\s+/).filter(w => w.length >= 3) : [];
        const k1 = getKeywords(lostItem.title + ' ' + lostItem.description);

        const matches = potentialMatches.map(found => {
            let score = 20;
            if (lostItem.color && found.color && lostItem.color.toLowerCase() === found.color.toLowerCase()) score += 15;
            
            const k2 = getKeywords(found.title + ' ' + found.description);
            let keywordMatches = 0;
            for (const kw of k1) {
                if (k2.some(k => k.includes(kw) || kw.includes(k))) keywordMatches++;
            }
            score += Math.min(40, keywordMatches * 10);

            if (lostItem.location && found.location) {
                const l1 = lostItem.location.toLowerCase();
                const l2 = found.location.toLowerCase();
                if (l1.includes(l2) || l2.includes(l1)) score += 15;
            }

            return { item: found, score };
        }).filter(m => m.score >= 40).sort((a, b) => b.score - a.score);

        res.json(matches.map(m => m.item));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteLostItem = async (req, res) => {
    try {
        const item = await LostItem.findById(req.params.id);
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

exports.updateLostItem = async (req, res) => {
    try {
        let item = await LostItem.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        // Check user
        if (item.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const { title, category, description, location, dateLost, contactInfo, status } = req.body;
        
        let imageUrl = item.image;
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }

        item = await LostItem.findByIdAndUpdate(
            req.params.id,
            { $set: { title, category, description, location, dateLost, contactInfo, status, image: imageUrl } },
            { new: true }
        );

        res.json(item);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
