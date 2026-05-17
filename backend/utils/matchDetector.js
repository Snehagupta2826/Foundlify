const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const Notification = require('../models/Notification');

// Calculate match score
const calculateMatchScore = (item1, item2) => {
    let score = 0;
    
    // Category MUST match, otherwise score is 0
    if (item1.category !== item2.category) return 0;
    score += 20; // Base score for matching category

    // Color match (if both have color)
    if (item1.color && item2.color && item1.color.toLowerCase() === item2.color.toLowerCase()) {
        score += 15;
    }

    // Keyword matching function
    const getKeywords = (text) => text ? text.toLowerCase().split(/\s+/).filter(w => w.length >= 3) : [];
    
    const k1 = getKeywords(item1.title + ' ' + item1.description);
    const k2 = getKeywords(item2.title + ' ' + item2.description);
    
    let keywordMatches = 0;
    for (const kw of k1) {
        if (k2.some(k => k.includes(kw) || kw.includes(k))) keywordMatches++;
    }
    
    // Max 40 points for keywords
    score += Math.min(40, keywordMatches * 10);

    // Location match (simple string include)
    if (item1.location && item2.location) {
        const l1 = item1.location.toLowerCase();
        const l2 = item2.location.toLowerCase();
        if (l1.includes(l2) || l2.includes(l1)) {
            score += 15;
        }
    }

    // Date proximity (within 3 days = +10 points)
    const d1 = item1.dateLost || item1.dateFound;
    const d2 = item2.dateLost || item2.dateFound;
    if (d1 && d2) {
        const diffDays = Math.abs(new Date(d1) - new Date(d2)) / (1000 * 60 * 60 * 24);
        if (diffDays <= 3) score += 10;
        else if (diffDays <= 7) score += 5;
    }

    return score;
};

exports.detectMatchesForLostItem = async (lostItem) => {
    try {
        const potentialMatches = await FoundItem.find({
            category: lostItem.category,
            status: 'active'
        });

        for (const found of potentialMatches) {
            const score = calculateMatchScore(lostItem, found);

            // If score >= 50, it's a solid potential match
            if (score >= 50) {
                await Notification.create({
                    receiverId: lostItem.userId,
                    type: 'match_found',
                    relatedItemId: found._id,
                    itemModel: 'FoundItem',
                    message: `A found item "${found.title}" might match your lost item "${lostItem.title}". (Match Score: ${score})`
                });

                await Notification.create({
                    receiverId: found.userId,
                    type: 'match_found',
                    relatedItemId: lostItem._id,
                    itemModel: 'LostItem',
                    message: `A lost item "${lostItem.title}" might match the item you found "${found.title}".`
                });
            }
        }
    } catch (err) {
        console.error("Error in detectMatchesForLostItem:", err);
    }
};

exports.detectMatchesForFoundItem = async (foundItem) => {
    try {
        const potentialMatches = await LostItem.find({
            category: foundItem.category,
            status: 'active'
        });

        for (const lost of potentialMatches) {
            const score = calculateMatchScore(lost, foundItem);

            if (score >= 50) {
                await Notification.create({
                    receiverId: lost.userId,
                    type: 'match_found',
                    relatedItemId: foundItem._id,
                    itemModel: 'FoundItem',
                    message: `A found item "${foundItem.title}" might match your lost item "${lost.title}". (Match Score: ${score})`
                });

                await Notification.create({
                    receiverId: foundItem.userId,
                    type: 'match_found',
                    relatedItemId: lost._id,
                    itemModel: 'LostItem',
                    message: `A lost item "${lost.title}" might match the item you found "${foundItem.title}".`
                });
            }
        }
    } catch (err) {
        console.error("Error in detectMatchesForFoundItem:", err);
    }
};
