const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { ApiError } = require('../middlewares/errorHandler');
const { sendPaymentNotification } = require('../services/notificationService');

/**
 * @desc    Process payment for an order
 * @route   POST /api/payments/process
 * @access  Private
 */
const processPayment = async (req, res, next) => {
  try {
    const { orderId, paymentMethod } = req.body;

    // Validate order
    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError('Order not found', 404);
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ orderId });
    if (existingPayment) {
      throw new ApiError('Payment already processed for this order', 400);
    }

    // Create payment record
    const payment = await Payment.create({
      orderId,
      userId: req.user._id,
      amount: order.totalAmount,
      paymentMethod,
      status: 'processing'
    });

    // Simulate payment processing
    // In production, integrate with actual payment gateway
    try {
      // Simulated payment gateway response
      const gatewayResponse = {
        success: true,
        transactionId: `TX${Date.now()}`,
        timestamp: new Date()
      };

      // Update payment with success
      payment.status = 'completed';
      payment.transactionId = gatewayResponse.transactionId;
      payment.paymentGatewayResponse = gatewayResponse;
      await payment.save();

      // Update order status
      order.status = 'processing';
      await order.save();

      // Send notification
      await sendPaymentNotification(payment, req.user._id);

      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      // Update payment with failure
      payment.status = 'failed';
      payment.paymentGatewayResponse = error;
      await payment.save();

      throw new ApiError('Payment processing failed', 400);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get payment details
 * @route   GET /api/payments/:paymentId
 * @access  Private
 */
const getPaymentDetails = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    
    if (!payment) {
      throw new ApiError('Payment not found', 404);
    }

    // Check if user is authorized to view this payment
    if (payment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      throw new ApiError('Not authorized to view this payment', 403);
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Process refund for a payment
 * @route   POST /api/payments/:paymentId/refund
 * @access  Private (Admin only)
 */
const processRefund = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const payment = await Payment.findById(req.params.paymentId);

    if (!payment) {
      throw new ApiError('Payment not found', 404);
    }

    if (payment.status !== 'completed') {
      throw new ApiError('Can only refund completed payments', 400);
    }

    // Simulate refund processing
    // In production, integrate with payment gateway's refund API
    try {
      payment.status = 'refunded';
      payment.refundDetails = {
        amount: payment.amount,
        reason,
        date: new Date(),
        status: 'completed'
      };
      await payment.save();

      // Update order status
      const order = await Order.findById(payment.orderId);
      if (order) {
        order.status = 'cancelled';
        await order.save();
      }

      // Send notification
      await sendPaymentNotification(payment, payment.userId);

      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      throw new ApiError('Refund processing failed', 400);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's payment history
 * @route   GET /api/payments/history
 * @access  Private
 */
const getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  processPayment,
  getPaymentDetails,
  processRefund,
  getPaymentHistory
};
