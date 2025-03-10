const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  register,
  login,
  getProfile,
  updateProfile
} = require('../controllers/authController');
const { validate, userValidationRules, createValidationMiddleware } = require('../middlewares/validate');

// Public routes
router.post('/register', createValidationMiddleware(userValidationRules.register), validate, register);
router.post('/login', createValidationMiddleware(userValidationRules.login), validate, login);

// Protected routes
router.use(protect); // All routes below this middleware will require authentication
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router;
