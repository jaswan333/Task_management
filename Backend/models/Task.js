const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Project',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'review', 'done'],
    default: 'todo',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  assigneeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  dueDate: {
    type: String,
  }
}, {
  timestamps: true,
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
