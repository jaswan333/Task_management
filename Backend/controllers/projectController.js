const Project = require('../models/Project');
const Activity = require('../models/Activity');

// @desc    Fetch all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({});
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res) => {
  const { name, description, status, startDate, endDate } = req.body;

  try {
    const project = new Project({
      name,
      description,
      status: status || 'planning',
      startDate,
      endDate,
    });

    const createdProject = await project.save();
    
    // Log activity
    await Activity.create({
      type: 'project',
      text: 'Project created',
      detail: name
    });

    res.status(201).json(createdProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private/Admin
const updateProject = async (req, res) => {
  const { name, description, status, startDate, endDate, progress } = req.body;

  try {
    const project = await Project.findById(req.params.id);

    if (project) {
      project.name = name || project.name;
      project.description = description !== undefined ? description : project.description;
      project.status = status || project.status;
      project.startDate = startDate !== undefined ? startDate : project.startDate;
      project.endDate = endDate !== undefined ? endDate : project.endDate;
      project.progress = progress !== undefined ? progress : project.progress;

      const updatedProject = await project.save();
      
      // Log activity
      await Activity.create({
        type: 'project',
        text: 'Project updated',
        detail: name || project.name
      });
      
      res.json(updatedProject);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (project) {
      await project.deleteOne();
      
      // Log activity
      await Activity.create({
        type: 'project',
        text: 'Project removed',
        detail: req.params.id
      });
      
      res.json({ message: 'Project removed' });
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProjects, createProject, updateProject, deleteProject };
