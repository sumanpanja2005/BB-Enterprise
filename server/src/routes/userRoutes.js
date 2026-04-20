const express = require('express');
const {
  getProfile,
  updateProfile,
  addWishlist,
  removeWishlist,
  getWishlist,
  profileValidation,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', profileValidation, validate, updateProfile);
router.get('/wishlist', getWishlist);
router.post('/wishlist/:productId', addWishlist);
router.delete('/wishlist/:productId', removeWishlist);

module.exports = router;
