const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type: {
    type: String, // e.g. 'project', 'task', 'member'
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  detail: {
    type: String,
    default: '',
  },
}, {
  timestamps: true, // Will track 'at' as createdAt
});

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
