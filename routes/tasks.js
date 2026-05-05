const express = require('express');
const {
  createTask,
  getProjectTasks,
  getMyTasks,
  updateTask,
  deleteTask,
  getDashboardStats,
} = require('../controllers/taskController');
const { isAuthenticated, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Only ADMIN can create tasks
router.post('/', isAuthenticated, authorizeRole('admin'), createTask);
// All authenticated users can view their assigned tasks
router.get('/my-tasks', isAuthenticated, getMyTasks);
// All authenticated users can view project tasks (if they're members)
router.get('/:projectId', isAuthenticated, getProjectTasks);
// Update task - handled in controller (ADMIN: all fields, EMPLOYEE: status only on own tasks)
router.put('/:id', isAuthenticated, updateTask);
// Only ADMIN can delete tasks
router.delete('/:id', isAuthenticated, authorizeRole('admin'), deleteTask);
router.get('/api/dashboard/stats', isAuthenticated, getDashboardStats);

module.exports = router;
