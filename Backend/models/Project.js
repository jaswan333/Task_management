const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'on_hold', 'completed'],
    default: 'planning',
  },
  startDate: {
    type: String,
  },
  endDate: {
    type: String,
  },
  progress: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
