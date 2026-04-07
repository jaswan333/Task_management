const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const Activity = require('../models/Activity');

// @desc    Get all users / members
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users.map(u => ({
      id: u._id,
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      jobRole: u.jobRole,
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new member (by Admin from Team page)
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res) => {
  const { name, email, jobRole } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password: '123456',  // default password
      role: 'member',
      jobRole: jobRole || ''
    });

    await Activity.create({ type: 'member', text: 'Member added', detail: name });

    res.status(201).json({
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      jobRole: user.jobRole,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  const { name, role, email, jobRole } = req.body;
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = name || user.name;
      user.role = role || user.role;
      user.email = email || user.email;
      user.jobRole = jobRole !== undefined ? jobRole : user.jobRole;

      const updatedUser = await user.save();
      
      await Activity.create({ type: 'member', text: 'Member updated', detail: user.name });

      res.json({
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        jobRole: updatedUser.jobRole,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.deleteOne();
      await Activity.create({ type: 'member', text: 'Member removed', detail: user.name });
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };
