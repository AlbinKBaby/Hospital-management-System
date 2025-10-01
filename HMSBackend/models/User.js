const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'LAB_STAFF']
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for doctor
userSchema.virtual('doctor', {
  ref: 'Doctor',
  localField: '_id',
  foreignField: 'userId',
  justOne: true
});

// Virtual for receptionist
userSchema.virtual('receptionist', {
  ref: 'Receptionist',
  localField: '_id',
  foreignField: 'userId',
  justOne: true
});

// Virtual for labStaff
userSchema.virtual('labStaff', {
  ref: 'LabStaff',
  localField: '_id',
  foreignField: 'userId',
  justOne: true
});

module.exports = mongoose.model('User', userSchema);
