const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
  processPayment,
  getPaymentDetails,
  processRefund,
  getPaymentHistory
} = require('../controllers/paymentController');

// All payment routes are protected
router.use(protect);

// User routes
router.post('/process', processPayment);
router.get('/history', getPaymentHistory);
router.get('/:paymentId', getPaymentDetails);

// Admin only routes
router.post('/:paymentId/refund', authorize('admin'), processRefund);

module.exports = router;
