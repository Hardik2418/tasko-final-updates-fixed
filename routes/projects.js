const express = require('express');
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  addMember,
  removeMember,
  deleteProject,
} = require('../controllers/projectController');
const { isAuthenticated, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Only ADMIN can create projects
router.post('/', isAuthenticated, authorizeRole('admin'), createProject);
// All authenticated users can list their projects
router.get('/', isAuthenticated, getProjects);
// All authenticated users can view project details
router.get('/:id', isAuthenticated, getProject);
// Only ADMIN can update projects
router.put('/:id', isAuthenticated, authorizeRole('admin'), updateProject);
// Only ADMIN can add members
router.post('/:id/members', isAuthenticated, authorizeRole('admin'), addMember);
// Only ADMIN can remove members
router.delete('/:id/members/:memberId', isAuthenticated, authorizeRole('admin'), removeMember);
// Only ADMIN can delete projects
router.delete('/:id', isAuthenticated, authorizeRole('admin'), deleteProject);

module.exports = router;
