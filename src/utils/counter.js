const mongoose = require('mongoose');

// Schema for auto-incrementing counters
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

/**
 * Get next sequence number for a given counter
 * @param {string} name - Counter name (e.g., 'userId', 'taskId')
 * @returns {Promise<number>} Next sequence number
 */
async function getNextSequence(name) {
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

module.exports = { getNextSequence };
