const express = require('express');
const {
  getAllEmployees,
  getEmployeeDetails,
  getAdminStats,
} = require('../controllers/adminController');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

router.get('/employees', isAuthenticated, getAllEmployees);
router.get('/employees/:id', isAuthenticated, getEmployeeDetails);
router.get('/stats', isAuthenticated, getAdminStats);

module.exports = router;
