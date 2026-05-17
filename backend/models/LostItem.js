const mongoose = require('mongoose');

const lostItemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    color: { type: String, default: '' },
    description: { type: String, required: true },
    image: { type: String, default: '' },
    location: { type: String, required: true },
    dateLost: { type: Date, required: true },
    contactInfo: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['active', 'resolved', 'recovered'], default: 'active' },
    uniqueId: { type: String, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('LostItem', lostItemSchema);
