const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { getNextSequence } = require('../utils/counter');

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      unique: true
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

// Auto-increment userId before saving
userSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      this.userId = await getNextSequence('userId');
    } catch (error) {
      return next(error);
    }
  }
  
  // Hash password if it's modified
  if (this.isModified('password')) {
    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (error) {
      return next(error);
    }
  }
  
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
