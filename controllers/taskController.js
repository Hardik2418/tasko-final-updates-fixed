const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc Create a new task
// @route POST /tasks
exports.createTask = async (req, res) => {
  try {
    const { title, description, projectId, priority, dueDate, assignee } = req.body;

    // Only admins can create tasks
    const user = await User.findById(req.session.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can create tasks',
      });
    }

    if (!title || !projectId) {
      return res.status(400).json({
        success: false,
        message: 'Title and Project ID are required',
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Verify assignee is a member of the project if provided
    if (assignee) {
      const isAssigneeInProject = project.members.some(
        (member) => member.toString() === assignee
      );
      if (!isAssigneeInProject) {
        return res.status(400).json({
          success: false,
          message: 'Assignee must be a member of the project',
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      priority,
      dueDate,
      assignee: assignee || null,
    });

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all tasks for a project
// @route GET /projects/:projectId/tasks
exports.getProjectTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignee')
      .populate('project');

    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyTasks = async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    const tasks = await Task.find({ assignee: req.session.userId })
      .populate('project')
      .populate('assignee');

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Update task status
// @route PUT /tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const { status, assignee, priority, dueDate } = req.body;

    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const user = await User.findById(req.session.userId);

    // Check authorization
    // Admins can update any task
    // Members can only update their assigned tasks
    if (user.role === 'member') {
      if (!task.assignee || task.assignee.toString() !== req.session.userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only update tasks assigned to you',
        });
      }

      // Members can only update status
      if (assignee || priority || dueDate) {
        return res.status(403).json({
          success: false,
          message: 'Members can only update task status',
        });
      }
    }

    if (status) task.status = status;
    if (assignee && user.role === 'admin') task.assignee = assignee;
    if (priority && user.role === 'admin') task.priority = priority;
    if (dueDate && user.role === 'admin') task.dueDate = dueDate;

    task = await task.save();

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete task
// @route DELETE /tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Only admins can delete tasks
    const user = await User.findById(req.session.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can delete tasks',
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get dashboard stats
// @route GET /api/dashboard/stats
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.session.userId;

    const projects = await Project.find({
      $or: [
        { creator: userId },
        { members: userId },
      ],
    });

    const totalTasks = await Task.countDocuments({
      project: { $in: projects.map((p) => p._id) },
    });

    const completedTasks = await Task.countDocuments({
      project: { $in: projects.map((p) => p._id) },
      status: 'Done',
    });

    const myTasks = await Task.countDocuments({
      assignee: userId,
    });

    const overdueTasks = await Task.countDocuments({
      assignee: userId,
      dueDate: { $lt: new Date() },
      status: { $ne: 'Done' },
    });

    res.json({
      success: true,
      data: {
        totalProjects: projects.length,
        totalTasks,
        completedTasks,
        myTasks,
        overdueTasks,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
