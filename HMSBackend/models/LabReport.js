const mongoose = require('mongoose');

const labReportSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  testName: {
    type: String,
    required: true
  },
  testType: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
    default: 'PENDING'
  },
  results: {
    type: String
  },
  fileUrl: {
    type: String
  },
  fileName: {
    type: String
  },
  remarks: {
    type: String
  },
  conductedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabStaff'
  },
  reportDate: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LabReport', labReportSchema);
