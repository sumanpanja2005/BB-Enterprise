const express = require('express');
const {
  dashboard,
  listUsers,
  updateUserRole,
  deleteUser,
  listAllProducts,
  listAllCategories,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/dashboard', dashboard);
router.get('/products', listAllProducts);
router.get('/categories', listAllCategories);
router.get('/users', listUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;
