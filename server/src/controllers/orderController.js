const Order = require('../models/Order');
const Product = require('../models/Product');
const sendEmail = require('../utils/sendEmail');

/**
 * Build order line items from cart payload and verify stock
 */
async function buildOrderItems(cartItems) {
  const items = [];
  for (const row of cartItems) {
    const product = await Product.findById(row.productId || row._id);
    if (!product || !product.isActive) {
      throw new Error(`Product not found: ${row.productId || row._id}`);
    }
    if (product.stock < row.qty) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }
    const image =
      product.images && product.images.length ? product.images[0] : '';
    items.push({
      product: product._id,
      name: product.name,
      image,
      price: product.price,
      qty: row.qty,
    });
  }
  return items;
}

/**
 * POST /api/orders — create pending order (cash/manual flow) or after payment
 */
async function createOrder(req, res, next) {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;
    if (!orderItems?.length) {
      res.status(400);
      throw new Error('Cart is empty');
    }

    const built = await buildOrderItems(orderItems);
    const itemsPrice = built.reduce((a, i) => a + i.price * i.qty, 0);
    const taxPrice = Number(req.body.taxPrice) || 0;
    const shippingPrice = Number(req.body.shippingPrice) || 0;
    const totalPrice = itemsPrice + taxPrice + shippingPrice;

    const order = await Order.create({
      user: req.user._id,
      orderItems: built,
      shippingAddress,
      paymentMethod: paymentMethod || 'stripe',
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      status: 'pending_payment',
    });

    const populated = await order.populate('user', 'name email');
    res.status(201).json(populated);
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/orders/my
 */
async function getMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/orders/:id
 */
async function getOrderById(req, res, next) {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email'
    );
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    if (
      String(order.user._id) !== String(req.user._id) &&
      req.user.role !== 'admin'
    ) {
      res.status(403);
      throw new Error('Not allowed');
    }
    res.json(order);
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/orders (admin)
 */
async function getAllOrders(req, res, next) {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (e) {
    next(e);
  }
}

/**
 * PUT /api/orders/:id/status (admin)
 */
async function updateOrderStatus(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    const { status } = req.body;
    const allowed = [
      'pending_payment',
      'paid',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
    ];
    if (!allowed.includes(status)) {
      res.status(400);
      throw new Error('Invalid status');
    }
    order.status = status;
    if (status === 'delivered') order.deliveredAt = new Date();
    await order.save();

    const user = await require('../models/User').findById(order.user);
    if (user?.email) {
      await sendEmail({
        to: user.email,
        subject: `BB Enterprise — Order ${order._id} is now ${status}`,
        html: `<p>Your order status was updated to <strong>${status}</strong>.</p>`,
      });
    }

    res.json(order);
  } catch (e) {
    next(e);
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  buildOrderItems,
};
