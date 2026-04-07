const Task = require('../models/Task');
const Activity = require('../models/Activity');
const Project = require('../models/Project');

const recalcProjectProgress = async (projectId) => {
  try {
    const tasks = await Task.find({ projectId });
    if (tasks.length === 0) {
      await Project.findByIdAndUpdate(projectId, { progress: 0 });
      return;
    }
    const done = tasks.filter(t => t.status === 'done').length;
    const progress = Math.round((done / tasks.length) * 100);
    await Project.findByIdAndUpdate(projectId, { progress });
  } catch(e) {
    console.error("Progress calc error:", e);
  }
};

// @desc    Fetch all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({});
    res.json(tasks.map(t => {
      // Return with 'id' instead of '_id' for frontend compatibility if needed, or stick to _id and adapt frontend.
      return {
        id: t._id,
        projectId: t.projectId,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        assigneeId: t.assigneeId,
        dueDate: t.dueDate,
        createdAt: t.createdAt
      };
    }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  const { projectId, title, description, status, priority, assigneeId, dueDate } = req.body;

  try {
    const task = new Task({
      projectId,
      title,
      description: description || '',
      status: status || 'todo',
      priority: priority || 'medium',
      assigneeId: assigneeId || null,
      dueDate: dueDate || ''
    });

    const createdTask = await task.save();

    await recalcProjectProgress(projectId);

    // Activity Log
    await Activity.create({ type: 'task', text: 'Task created', detail: title });

    res.status(201).json({ id: createdTask._id, ...createdTask._doc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  const { projectId, title, description, status, priority, assigneeId, dueDate } = req.body;
  try {
    const task = await Task.findById(req.params.id);

    if (task) {
      const prevStatus = task.status;
      const prevProjectId = task.projectId;

      task.projectId = projectId || task.projectId;
      task.title = title || task.title;
      task.description = description !== undefined ? description : task.description;
      task.status = status || task.status;
      task.priority = priority || task.priority;
      task.assigneeId = assigneeId !== undefined ? assigneeId : task.assigneeId;
      task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;

      const updatedTask = await task.save();

      // Recalc project progress
      await recalcProjectProgress(task.projectId);
      if (projectId && String(projectId) !== String(prevProjectId)) {
        await recalcProjectProgress(prevProjectId);
      }

      if (status && status !== prevStatus) {
         await Activity.create({ type: 'task', text: 'Task moved', detail: `${task.title} → ${status}` });
      } else {
         await Activity.create({ type: 'task', text: 'Task updated', detail: task.title });
      }

      res.json({ id: updatedTask._id, ...updatedTask._doc });
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (task) {
      const pId = task.projectId;
      await task.deleteOne();

      await recalcProjectProgress(pId);
      await Activity.create({ type: 'task', text: 'Task deleted', detail: req.params.id });

      res.json({ message: 'Task removed' });
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
