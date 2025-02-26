import nodemailer from 'nodemailer';

interface OrderDetails {
  orderId: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false
  }
});

// Verify connection configuration
transporter.verify(function(error, success) {
  if (error) {
    console.log('Error verifying email configuration:', error);
  } else {
    console.log('Server is ready to take our messages');
  }
});

export const sendPaymentConfirmation = async (
  userEmail: string,
  orderDetails: OrderDetails
): Promise<void> => {
  const mailOptions = {
    from: `"Sneaker Finder" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: 'Payment Confirmation - Sneaker Finder',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Thank you for your purchase!</h1>
        <p>Your order has been confirmed and is being processed.</p>
        
        <div style="margin: 20px 0; padding: 20px; background-color: #f8f8f8; border-radius: 5px;">
          <h2 style="color: #333; margin-bottom: 15px;">Order Details</h2>
          <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
          <p><strong>Total Amount:</strong> $${orderDetails.totalAmount.toFixed(2)}</p>
          
          <h3 style="color: #333; margin: 15px 0;">Items Purchased:</h3>
          <ul style="list-style: none; padding: 0;">
            ${orderDetails.items.map(item => `
              <li style="margin-bottom: 10px;">
                <span style="font-weight: bold;">${item.name}</span>
                <br>
                Quantity: ${item.quantity}
                <br>
                Price: $${item.price.toFixed(2)}
              </li>
            `).join('')}
          </ul>
        </div>
        
        <p>If you have any questions about your order, please don't hesitate to contact us.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message, please do not reply directly to this email.
          </p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Payment confirmation email sent:', info.response);
  } catch (error: any) {
    console.error('Error sending payment confirmation email:', {
      error: error.message,
      userEmail,
      orderId: orderDetails.orderId,
      errorStack: error.stack
    });
    throw error;
  }
};

export const sendOrderStatusUpdate = async (
  userEmail: string,
  orderId: string,
  orderNumber: string,
  newStatus: string
): Promise<void> => {
  const statusMessages: { [key: string]: string } = {
    processing: 'Your order is now being processed',
    shipped: 'Your order has been shipped',
    delivered: 'Your order has been delivered',
    cancelled: 'Your order has been cancelled'
  };

  const message = statusMessages[newStatus] || `Your order status has been updated to: ${newStatus}`;

  const mailOptions = {
    from: `"Sneaker Finder" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Order Status Update - ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Order Status Update</h1>
        <p>${message}</p>
        
        <div style="margin: 20px 0; padding: 20px; background-color: #f8f8f8; border-radius: 5px;">
          <h2 style="color: #333; margin-bottom: 15px;">Order Information</h2>
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          <p><strong>New Status:</strong> ${newStatus}</p>
        </div>
        
        <p>You can track your order status in your account dashboard.</p>
        <p>Thank you for shopping with Sneaker Finder!</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Status update email sent for order ${orderId}`);
  } catch (error) {
    console.error('Error sending status update email:', error);
    throw error;
  }
};
