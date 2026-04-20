const express = require('express');
const { body } = require('express-validator');
const {
  listByProduct,
  createReview,
  updateReview,
  deleteReview,
  reviewValidation,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

const updateReviewValidation = [
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('comment').optional().trim().notEmpty(),
];

router.get('/product/:productId', listByProduct);
router.post('/', protect, reviewValidation, validate, createReview);
router.put('/:id', protect, updateReviewValidation, validate, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
