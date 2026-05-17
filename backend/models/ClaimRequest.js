const mongoose = require('mongoose');

const claimRequestSchema = new mongoose.Schema({
    claimantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'itemModel' },
    itemModel: { type: String, required: true, enum: ['LostItem', 'FoundItem'] },
    itemUniqueCode: { type: String, required: true },
    message: { type: String, default: '' },
    proofDocument: { type: String, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('ClaimRequest', claimRequestSchema);
