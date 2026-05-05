const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc Get all employees
// @route GET /admin/employees
exports.getAllEmployees = async (req, res) => {
  try {
    // Only admins can access
    const admin = await User.findById(req.session.userId);
    if (admin.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can access this',
      });
    }

    const employees = await User.find({ role: 'member' });

    res.json({
      success: true,
      data: employees,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get employee details
// @route GET /admin/employees/:id
exports.getEmployeeDetails = async (req, res) => {
  try {
    // Only admins can access
    const admin = await User.findById(req.session.userId);
    if (admin.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can access this',
      });
    }

    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Get employee's tasks
    const tasks = await Task.find({ assignee: req.params.id })
      .populate('project')
      .sort({ createdAt: -1 });

    // Get project assignments
    const projects = await Project.find({
      members: req.params.id,
    });

    res.json({
      success: true,
      data: {
        employee,
        tasks,
        projects,
        taskStats: {
          total: tasks.length,
          completed: tasks.filter((t) => t.status === 'Done').length,
          pending: tasks.filter((t) => t.status !== 'Done').length,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get admin dashboard stats
// @route GET /admin/stats
exports.getAdminStats = async (req, res) => {
  try {
    // Only admins can access
    const admin = await User.findById(req.session.userId);
    if (admin.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can access this',
      });
    }

    const employees = await User.find({ role: 'member' });
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'Done' });
    const pendingTasks = await Task.countDocuments({ status: { $ne: 'Done' } });

    res.json({
      success: true,
      data: {
        totalEmployees: employees.length,
        totalTasks,
        completedTasks,
        pendingTasks,
        completionRate: ((completedTasks / totalTasks) * 100).toFixed(2),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
