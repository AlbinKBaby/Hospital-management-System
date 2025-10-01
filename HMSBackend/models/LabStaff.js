const mongoose = require('mongoose');

const labStaffSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  department: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LabStaff', labStaffSchema);
