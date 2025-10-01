const mongoose = require('mongoose');

const receptionistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  shift: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Receptionist', receptionistSchema);
