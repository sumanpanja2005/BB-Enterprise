const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  registerValidation,
  loginValidation,
  forgotValidation,
  resetValidation,
} = require('../controllers/authController');
const validate = require('../middleware/validate');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'Too many attempts, try again later' },
});

router.post(
  '/register',
  authLimiter,
  registerValidation,
  validate,
  register
);
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/forgot-password', authLimiter, forgotValidation, validate, forgotPassword);
router.post('/reset-password/:token', resetValidation, validate, resetPassword);

module.exports = router;
