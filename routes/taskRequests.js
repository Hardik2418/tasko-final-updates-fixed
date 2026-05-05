const express = require('express');
const {
  createTaskRequest,
  getTaskRequests,
  approveTaskRequest,
  rejectTaskRequest,
  getTaskRequestHistory,
} = require('../controllers/taskRequestController');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

router.post('/', isAuthenticated, createTaskRequest);
router.get('/', isAuthenticated, getTaskRequests);
router.get('/history', isAuthenticated, getTaskRequestHistory);
router.put('/:id/approve', isAuthenticated, approveTaskRequest);
router.put('/:id/reject', isAuthenticated, rejectTaskRequest);

module.exports = router;
