const express = require('express');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} = require('../controllers/notificationController');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

router.get('/', isAuthenticated, getNotifications);
router.get('/unread-count', isAuthenticated, getUnreadCount);
router.put('/:id/read', isAuthenticated, markAsRead);
router.put('/read-all', isAuthenticated, markAllAsRead);

module.exports = router;
