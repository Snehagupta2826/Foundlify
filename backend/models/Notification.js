const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional (null for system notifications)
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['match_found', 'claim_request', 'claim_accepted', 'claim_rejected', 'item_recovered', 'system'], default: 'system' },
    message: { type: String, required: true },
    relatedItemId: { type: mongoose.Schema.Types.ObjectId, refPath: 'itemModel' },
    itemModel: { type: String, enum: ['LostItem', 'FoundItem'] },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
