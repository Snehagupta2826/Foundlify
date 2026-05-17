const mongoose = require('mongoose');

const foundItemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    color: { type: String, default: '' },
    description: { type: String, required: true },
    image: { type: String, default: '' },
    location: { type: String, required: true },
    dateFound: { type: Date, required: true },
    contactInfo: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['active', 'claimed', 'recovered'], default: 'active' },
    uniqueId: { type: String, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('FoundItem', foundItemSchema);
