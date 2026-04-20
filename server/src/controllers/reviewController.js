const { body } = require('express-validator');
const Review = require('../models/Review');
const Product = require('../models/Product');

const reviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').trim().notEmpty(),
];

/**
 * Recalculate product average rating
 */
async function recalcProductRating(productId) {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        avg: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);
  const product = await Product.findById(productId);
  if (!product) return;
  if (stats.length) {
    product.rating = Math.round(stats[0].avg * 10) / 10;
    product.numReviews = stats[0].count;
  } else {
    product.rating = 0;
    product.numReviews = 0;
  }
  await product.save();
}

/**
 * GET /api/reviews/product/:productId
 */
async function listByProduct(req, res, next) {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (e) {
    next(e);
  }
}

/**
 * POST /api/reviews
 */
async function createReview(req, res, next) {
  try {
    const { product: productId, rating, comment } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    const existing = await Review.findOne({
      product: productId,
      user: req.user._id,
    });
    if (existing) {
      res.status(400);
      throw new Error('You already reviewed this product');
    }
    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating,
      comment,
    });
    await recalcProductRating(productId);
    await review.populate('user', 'name avatar');
    res.status(201).json(review);
  } catch (e) {
    next(e);
  }
}

/**
 * PUT /api/reviews/:id
 */
async function updateReview(req, res, next) {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }
    if (String(review.user) !== String(req.user._id)) {
      res.status(403);
      throw new Error('Not allowed');
    }
    if (req.body.rating === undefined && req.body.comment === undefined) {
      res.status(400);
      throw new Error('Provide rating or comment to update');
    }
    if (req.body.rating !== undefined) review.rating = req.body.rating;
    if (req.body.comment !== undefined) review.comment = req.body.comment;
    await review.save();
    await recalcProductRating(review.product);
    await review.populate('user', 'name avatar');
    res.json(review);
  } catch (e) {
    next(e);
  }
}

/**
 * DELETE /api/reviews/:id
 */
async function deleteReview(req, res, next) {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }
    if (
      String(review.user) !== String(req.user._id) &&
      req.user.role !== 'admin'
    ) {
      res.status(403);
      throw new Error('Not allowed');
    }
    const pid = review.product;
    await review.deleteOne();
    await recalcProductRating(pid);
    res.json({ message: 'Review removed' });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listByProduct,
  createReview,
  updateReview,
  deleteReview,
  reviewValidation,
  recalcProductRating,
};
