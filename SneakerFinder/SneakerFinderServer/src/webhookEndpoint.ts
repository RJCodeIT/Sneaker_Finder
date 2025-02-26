import express, { Router } from 'express';
import Stripe from 'stripe';
import Order from './models/Order';
import User from './models/User';
import { sendPaymentConfirmation } from './services/emailService';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const router = Router();

// Use raw body parsing for this endpoint only
router.post('/sneakerFinder/api/checkout/webhook', express.raw({ type: 'application/json' }), async (request, response) => {
  console.log('Received webhook event');
  const sig = request.headers['stripe-signature'];

  try {
    if (!endpointSecret) {
      throw new Error('Missing Stripe webhook secret');
    }

    if (!sig) {
      throw new Error('No Stripe signature found');
    }

    const event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    console.log('Webhook event type:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (!orderId) {
        throw new Error('No order ID in session metadata');
      }

      console.log('Processing completed checkout for order:', orderId);

      const order = await Order.findByIdAndUpdate(
        orderId,
        {
          status: 'paid',
          paymentId: session.payment_intent as string,
        },
        { new: true }
      ).lean();

      if (!order) {
        throw new Error('Order not found after update');
      }

      const user = await User.findById(order.userId);
      if (!user) {
        throw new Error('User not found for order');
      }

      const orderDetails = {
        orderId: order._id.toString(),
        totalAmount: session.amount_total ? session.amount_total / 100 : 0,
        items: order.products.map(product => ({
          name: product.name,
          quantity: product.quantity,
          price: product.price
        }))
      };

      try {
        await sendPaymentConfirmation(user.email, orderDetails);
        console.log('Payment confirmation email sent successfully to:', user.email);
      } catch (emailError: any) {
        console.error('Error sending confirmation email:', {
          error: emailError.message,
          orderId,
          userEmail: user.email
        });
      }
    }

    response.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    response.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
});

export default router;
