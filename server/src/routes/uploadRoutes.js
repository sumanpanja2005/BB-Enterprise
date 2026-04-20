const express = require('express');
const { upload, uploadImage, uploadImages } = require('../controllers/uploadController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/image', protect, adminOnly, upload.single('image'), uploadImage);
router.post(
  '/images',
  protect,
  adminOnly,
  upload.array('images', 8),
  uploadImages
);

module.exports = router;
