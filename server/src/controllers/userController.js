const { body } = require('express-validator');
const User = require('../models/User');
const Product = require('../models/Product');

const profileValidation = [
  body('name').optional().trim().notEmpty(),
  body('phone').optional().trim(),
  body('address').optional().isObject(),
];

/**
 * GET /api/users/profile
 */
async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id).populate(
      'wishlist',
      'name slug price images stock'
    );
    res.json(user);
  } catch (e) {
    next(e);
  }
}

/**
 * PUT /api/users/profile
 */
async function updateProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.name) user.name = req.body.name;
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.avatar !== undefined) user.avatar = req.body.avatar;
    if (req.body.address) {
      user.address = { ...user.address, ...req.body.address };
    }
    await user.save();
    res.json(user);
  } catch (e) {
    next(e);
  }
}

/**
 * POST /api/users/wishlist/:productId
 */
async function addWishlist(req, res, next) {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    const user = await User.findById(req.user._id);
    const id = req.params.productId;
    if (!user.wishlist.map(String).includes(String(id))) {
      user.wishlist.push(id);
      await user.save();
    }
    await user.populate('wishlist', 'name slug price images stock');
    res.json(user.wishlist);
  } catch (e) {
    next(e);
  }
}

/**
 * DELETE /api/users/wishlist/:productId
 */
async function removeWishlist(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter(
      (p) => String(p) !== String(req.params.productId)
    );
    await user.save();
    await user.populate('wishlist', 'name slug price images stock');
    res.json(user.wishlist);
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/users/wishlist
 */
async function getWishlist(req, res, next) {
  try {
    const user = await User.findById(req.user._id).populate(
      'wishlist',
      'name slug price images stock featured'
    );
    res.json(user.wishlist);
  } catch (e) {
    next(e);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  addWishlist,
  removeWishlist,
  getWishlist,
  profileValidation,
};
