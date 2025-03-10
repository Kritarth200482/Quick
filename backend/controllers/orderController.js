const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { broadcastOrderUpdate } = require('../services/socketService');
const Cart = require('../models/Cart');
const { ApiError } = require('../middlewares/errorHandler');
const { sendOrderStatusNotification } = require('../services/notificationService');

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart || cart.items.length === 0) {
      throw new ApiError('Cart is empty', 400);
    }

    // Verify stock availability and calculate total
    let totalAmount = 0;
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new ApiError(`Product ${item.name} not found`, 404);
      }
      if (product.stock < item.quantity) {
        throw new ApiError(`Insufficient stock for ${product.name}`, 400);
      }
      totalAmount += item.price * item.quantity;

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Create order
    const order = await Order.create({
      userId: req.user._id,
      items: cart.items,
      totalAmount,
      shippingAddress,
      status: 'placed'
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    // Send notification
    await sendOrderStatusNotification(order, req.user._id);

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user orders
 * @route   GET /api/orders
 * @access  Private
 */
const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      throw new ApiError('Order not found', 404);
    }

    // Check if user is authorized to view this order
    if (order.userId.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin' && 
        req.user.role !== 'delivery') {
      throw new ApiError('Not authorized to view this order', 403);
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status
 * @route   PATCH /api/orders/:id/status
 * @access  Private (Admin/Delivery)
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      throw new ApiError('Order not found', 404);
    }

    order.status = status;
    if (status === 'out_for_delivery') {
      order.deliveryPersonId = req.user._id;
    }
    
    await order.save();

    // Send notification
    await sendOrderStatusNotification(order, order.userId);

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update delivery location
 * @route   PATCH /api/orders/:id/location
 * @access  Private (Delivery)
 */
const updateDeliveryLocation = async (req, res, next) => {
  try {
    const { currentLocation } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      throw new ApiError('Order not found', 404);
    }

    if (order.deliveryPersonId.toString() !== req.user._id.toString()) {
      throw new ApiError('Not authorized to update this order', 403);
    }

    order.currentLocation = currentLocation;
    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders (admin)
 * @route   GET /api/orders/all
 * @access  Private (Admin)
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { status, startDate, endDate } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  updateDeliveryLocation,
  getAllOrders
};