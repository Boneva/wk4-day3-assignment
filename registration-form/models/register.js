const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true
  },
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true
  }
}, {
  timestamps: true // Optional: adds createdAt and updatedAt
});

module.exports = mongoose.model('Registration', registrationSchema);
