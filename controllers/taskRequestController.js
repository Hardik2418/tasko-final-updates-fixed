const TaskRequest = require('../models/TaskRequest');
const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc Create task completion request
// @route POST /task-requests
exports.createTaskRequest = async (req, res) => {
  try {
    const { taskId, comment } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check if task is assigned to user
    if (task.assignee.toString() !== req.session.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only request completion for your assigned tasks',
      });
    }

    // Check if request already exists
    const existingRequest = await TaskRequest.findOne({
      task: taskId,
      status: 'pending',
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Completion request already pending',
      });
    }

    const request = await TaskRequest.create({
      task: taskId,
      employee: req.session.userId,
      comment,
    });

    // Get project creator (admin) to send notification
    const project = await Task.findById(taskId).populate('project');
    const admin = await User.findOne({ role: 'admin' });

    if (admin) {
      await Notification.create({
        user: admin._id,
        type: 'task_request',
        title: 'Task Completion Request',
        message: `${task.title} - Completion request from employee`,
        relatedId: request._id,
      });
    }

    res.json({
      success: true,
      message: 'Completion request submitted',
      data: request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get task requests for admin
// @route GET /task-requests
exports.getTaskRequests = async (req, res) => {
  try {
    const requests = await TaskRequest.find({ status: 'pending' })
      .populate('task')
      .populate('employee')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Approve task request
// @route PUT /task-requests/:id/approve
exports.approveTaskRequest = async (req, res) => {
  try {
    const { adminComment } = req.body;

    const request = await TaskRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Only admin can approve
    const user = await User.findById(req.session.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can approve requests',
      });
    }

    request.status = 'approved';
    request.admin = req.session.userId;
    request.approvalDate = new Date();
    request.adminComment = adminComment;
    await request.save();

    // Update task status to Done
    await Task.findByIdAndUpdate(request.task, { status: 'Done' });

    // Send notification to employee
    await Notification.create({
      user: request.employee,
      type: 'task_approved',
      title: 'Task Approved',
      message: 'Your task completion request has been approved',
      relatedId: request._id,
    });

    res.json({
      success: true,
      message: 'Request approved',
      data: request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Reject task request
// @route PUT /task-requests/:id/reject
exports.rejectTaskRequest = async (req, res) => {
  try {
    const { adminComment } = req.body;

    const request = await TaskRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Only admin can reject
    const user = await User.findById(req.session.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can reject requests',
      });
    }

    request.status = 'rejected';
    request.admin = req.session.userId;
    request.approvalDate = new Date();
    request.adminComment = adminComment;
    await request.save();

    // Send notification to employee
    await Notification.create({
      user: request.employee,
      type: 'task_rejected',
      title: 'Task Rejected',
      message: 'Your task completion request has been rejected. Please review the comments.',
      relatedId: request._id,
    });

    res.json({
      success: true,
      message: 'Request rejected',
      data: request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all task requests history
// @route GET /task-requests/history
exports.getTaskRequestHistory = async (req, res) => {
  try {
    const requests = await TaskRequest.find()
      .populate('task')
      .populate('employee')
      .populate('admin')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
