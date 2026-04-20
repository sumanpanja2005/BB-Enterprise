function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return require('stripe')(key);
}
const Order = require('../models/Order');
const Product = require('../models/Product');
const { buildOrderItems } = require('./orderController');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');

/**
 * Decrement inventory for paid order
 */
async function decrementStock(orderItems) {
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.qty },
    });
  }
}

/**
 * POST /api/payments/create-checkout-session — auth required
 */
async function createCheckoutSession(req, res, next) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      res.status(503);
      throw new Error('Stripe is not configured');
    }

    const { orderItems, shippingAddress } = req.body;
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
      paymentMethod: 'stripe',
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      status: 'pending_payment',
    });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: built.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.qty,
      })),
      success_url: `${clientUrl}/order-confirmation/${order._id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/checkout?cancelled=1`,
      customer_email: req.user.email,
      metadata: {
        orderId: order._id.toString(),
      },
    });

    order.stripeSessionId = session.id;
    await order.save();

    res.json({ url: session.url, sessionId: session.id, orderId: order._id });
  } catch (e) {
    next(e);
  }
}

/**
 * Stripe webhook — mounted with raw body in index.js
 */
async function handleStripeWebhook(req, res, next) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const stripe = getStripe();
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(400).send('Webhook not configured');
    }
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (!orderId) {
        return res.json({ received: true });
      }

      const order = await Order.findById(orderId);
      if (!order || order.status === 'paid') {
        return res.json({ received: true });
      }

      order.status = 'paid';
      order.paidAt = new Date();
      order.paymentResult = {
        id: session.payment_intent || session.id,
        status: session.payment_status,
        update_time: new Date().toISOString(),
        email_address: session.customer_details?.email || '',
      };
      await order.save();
      await decrementStock(order.orderItems);

      const user = await User.findById(order.user);
      if (user?.email) {
        await sendEmail({
          to: user.email,
          subject: 'BB Enterprise — Order confirmed',
          html: `<p>Thank you! Your order <strong>#${order._id}</strong> was paid successfully.</p><p>Total: $${order.totalPrice.toFixed(2)}</p>`,
        });
      }
    }

    res.json({ received: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
}

module.exports = {
  createCheckoutSession,
  handleStripeWebhook,
};
