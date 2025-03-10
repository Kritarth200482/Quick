const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart
} = require('../controllers/cartController');

// All cart routes are protected
router.use(protect);

router.get('/', getCart);
router.post('/items', addItem);
router.put('/items/:productId', updateItemQuantity);
router.delete('/items/:productId', removeItem);
router.delete('/', clearCart);

module.exports = router;
