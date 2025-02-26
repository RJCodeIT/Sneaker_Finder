import mongoose, { Document, Schema, Types } from 'mongoose';
import { sendOrderStatusUpdate } from '../services/emailService';
import User from './User';

interface IProduct {
  name: string;
  size: string;
  price: number;
  quantity: number;
}

interface IShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  orderNumber: string;
  date: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'paid';
  products: IProduct[];
  totalAmount: number;
  paymentId: string;
  shippingAddress: IShippingAddress;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'paid'],
    required: true,
    default: 'pending'
  },
  products: [{
    name: { type: String, required: true },
    size: { type: String, required: true, default: 'N/A' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  paymentId: {
    type: String,
    required: true
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  }
}, {
  timestamps: true
});

orderSchema.pre('save', async function(next) {
  const order = this as IOrder;
  
  // Only proceed if the status has been modified
  if (order.isModified('status') && order.status !== 'pending') {
    try {
      // Get the user's email
      const user = await User.findById(order.userId);
      if (!user || !user.email) {
        console.error('User not found or no email available for order:', order._id);
        return next();
      }

      // Send status update email
      await sendOrderStatusUpdate(
        user.email,
        order._id.toString(),
        order.orderNumber,
        order.status
      );
    } catch (error) {
      console.error('Error sending status update email:', error);
      // Continue with save even if email fails
    }
  }
  next();
});

const Order = mongoose.model<IOrder>('Order', orderSchema);
export default Order;
