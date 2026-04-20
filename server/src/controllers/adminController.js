const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');

/**
 * GET /api/admin/dashboard
 */
async function dashboard(req, res, next) {
  try {
    const [users, orders, products, revenueAgg] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
    ]);

    const revenue = revenueAgg[0]?.total || 0;

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      counts: { users, orders, products, revenue },
      recentOrders,
      ordersByStatus,
    });
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/admin/users
 */
async function listUsers(req, res, next) {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (e) {
    next(e);
  }
}

/**
 * PUT /api/admin/users/:id/role
 */
async function updateUserRole(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    if (String(user._id) === String(req.user._id)) {
      res.status(400);
      throw new Error('Cannot change your own role');
    }
    user.role = req.body.role === 'admin' ? 'admin' : 'user';
    await user.save();
    res.json(user);
  } catch (e) {
    next(e);
  }
}

/**
 * DELETE /api/admin/users/:id
 */
async function deleteUser(req, res, next) {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      res.status(400);
      throw new Error('Cannot delete yourself');
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.json({ message: 'User removed' });
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/admin/products — all products for management
 */
async function listAllProducts(req, res, next) {
  try {
    const products = await Product.find()
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/admin/categories — same as public list; reserved for future filters
 */
async function listAllCategories(req, res, next) {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (e) {
    next(e);
  }
}

module.exports = {
  dashboard,
  listUsers,
  updateUserRole,
  deleteUser,
  listAllProducts,
  listAllCategories,
};
