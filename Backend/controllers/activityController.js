const Activity = require('../models/Activity');

// @desc    Get all activities
// @route   GET /api/activities
// @access  Private
const getActivities = async (req, res) => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 }).limit(100);
    res.json(activities.map(a => ({
      id: a._id,
      type: a.type,
      text: a.text,
      detail: a.detail,
      at: a.createdAt
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getActivities };
