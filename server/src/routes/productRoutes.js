const express = require('express');
const {
  listProducts,
  featuredProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/featured', featuredProducts);
router.get('/id/:id', getProductById);
router.get('/:slug', getProductBySlug);
router.get('/', listProducts);

router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
