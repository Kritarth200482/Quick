const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  updateDeliveryLocation,
  getAllOrders
} = require('../controllers/orderController');

// All order routes are protected
router.use(protect);

// User routes
router.post('/', createOrder);
router.get('/my-orders', getUserOrders);
router.get('/:id', getOrderById);

// Admin routes
router.get('/all', authorize('admin'), getAllOrders);

// Admin and delivery person routes
router.patch('/:id/status', 
  authorize('admin', 'delivery'),
  updateOrderStatus
);

// Delivery person routes
router.patch('/:id/location',
  authorize('delivery'),
  updateDeliveryLocation
);

module.exports = router;
