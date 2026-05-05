const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');

exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a project name',
      });
    }

    const project = await Project.create({
      name,
      description,
      creator: req.session.userId,
      members: [req.session.userId],
    });

    res.json({
      success: true,
      message: 'Project created successfully',
      projectId: project._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getProjects = async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    const projects = await Project.find({
      $or: [
        { creator: req.session.userId },
        { members: req.session.userId },
      ],
    }).populate('creator').populate('members');

    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getProject = async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    const project = await Project.findById(req.params.id)
      .populate('creator')
      .populate('members');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const isMember = project.members.some(
      (member) => member._id.toString() === req.session.userId
    );
    const isCreator = project.creator._id.toString() === req.session.userId;

    if (!isMember && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const tasks = await Task.find({ project: req.params.id })
      .populate('assignee')
      .populate('project');

    res.status(200).json({
      success: true,
      data: {
        project,
        tasks,
      },
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Update project
// @route PUT /projects/:id
exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const user = await User.findById(req.session.userId);
    const isCreator = project.creator.toString() === req.session.userId;
    const isAdmin = user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project',
      });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Add member to project
// @route POST /projects/:id/members
exports.addMember = async (req, res) => {
  try {
    const { memberEmail } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const user = await User.findById(req.session.userId);
    const isCreator = project.creator.toString() === req.session.userId;
    const isAdmin = user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only project creator or admins can add members',
      });
    }

    const member = await User.findOne({ email: memberEmail });
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (project.members.includes(member._id)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member',
      });
    }

    project.members.push(member._id);
    await project.save();

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Remove member from project
// @route DELETE /projects/:id/members/:memberId
exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const user = await User.findById(req.session.userId);
    const isCreator = project.creator.toString() === req.session.userId;
    const isAdmin = user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only project creator or admins can remove members',
      });
    }

    project.members = project.members.filter(
      (member) => member.toString() !== req.params.memberId
    );
    await project.save();

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete project
// @route DELETE /projects/:id
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const user = await User.findById(req.session.userId);
    const isCreator = project.creator.toString() === req.session.userId;
    const isAdmin = user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project',
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
