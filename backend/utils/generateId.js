const Counter = require('../models/Counter');

exports.generateUniqueId = async (prefix) => {
    const year = new Date().getFullYear();
    const counterId = `${prefix}-${year}`;
    
    const counter = await Counter.findByIdAndUpdate(
        { _id: counterId },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    
    // Format sequence as 4 digits (e.g., 0001)
    const seq = String(counter.seq).padStart(4, '0');
    return `${prefix}-${year}-${seq}`;
};
