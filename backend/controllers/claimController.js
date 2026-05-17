const ClaimRequest = require('../models/ClaimRequest');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const Notification = require('../models/Notification');

exports.submitClaim = async (req, res) => {
    try {
        const { itemId, itemModel, itemUniqueCode, message } = req.body;
        
        let proofDocument = '';
        if (req.file) {
            proofDocument = `/uploads/${req.file.filename}`;
        } else {
            return res.status(400).json({ message: 'Proof document is required' });
        }

        // Find the original item to get the receiverId
        const Model = itemModel === 'LostItem' ? LostItem : FoundItem;
        const item = await Model.findById(itemId);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        const newClaim = new ClaimRequest({
            claimantId: req.user.id,
            receiverId: item.userId,
            itemId,
            itemModel,
            itemUniqueCode,
            message: message || '',
            proofDocument
        });

        await newClaim.save();

        await Notification.create({
            receiverId: item.userId,
            type: 'claim_request',
            relatedItemId: item._id,
            itemModel: itemModel,
            message: `Someone has submitted a claim for your item: ${item.title}`
        });

        res.status(201).json(newClaim);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getMyClaims = async (req, res) => {
    try {
        const claims = await ClaimRequest.find({ claimantId: req.user.id })
            .populate('receiverId', 'name email')
            .populate('itemId')
            .sort({ createdAt: -1 });
        res.json(claims);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getReceivedClaims = async (req, res) => {
    try {
        const claims = await ClaimRequest.find({ receiverId: req.user.id })
            .populate('claimantId', 'name email phone')
            .populate('itemId')
            .sort({ createdAt: -1 });
        res.json(claims);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getPendingClaims = async (req, res) => {
    try {
        const claims = await ClaimRequest.find({ status: 'pending' })
            .populate('claimantId', 'name email')
            .populate('receiverId', 'name email')
            .populate('itemId')
            .sort({ createdAt: -1 });
        res.json(claims);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.respondToClaim = async (req, res) => {
    try {
        const { status } = req.body; // 'accepted' or 'rejected'
        const claim = await ClaimRequest.findById(req.params.id).populate('itemId');

        if (!claim) return res.status(404).json({ message: 'Claim not found' });

        if (claim.receiverId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to respond to this claim' });
        }

        claim.status = status;
        await claim.save();

        if (status === 'accepted') {
            const Model = claim.itemModel === 'LostItem' ? LostItem : FoundItem;
            // Note: We don't mark as recovered until the final handover, but we notify.
            
            await Notification.create({
                receiverId: claim.claimantId,
                type: 'claim_accepted',
                relatedItemId: claim.itemId._id,
                itemModel: claim.itemModel,
                message: `Your claim for item ${claim.itemId.title} has been ACCEPTED. Please contact them at their email to arrange handover.`
            });
        } else if (status === 'rejected') {
            await Notification.create({
                receiverId: claim.claimantId,
                type: 'claim_rejected',
                relatedItemId: claim.itemId._id,
                itemModel: claim.itemModel,
                message: `Your claim for item ${claim.itemId.title} was REJECTED.`
            });
        }

        res.json(claim);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
