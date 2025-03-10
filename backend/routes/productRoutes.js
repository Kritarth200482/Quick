const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getCategories
} = require('../controllers/productController');
const { validate, productValidationRules, createValidationMiddleware } = require('../middlewares/validate');

// Public routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProduct);

// Protected admin routes
router.use(protect); // All routes below this middleware will require authentication
router.use(authorize('admin')); // All routes below this middleware will require admin role

router.post('/', createValidationMiddleware(productValidationRules.create), validate, createProduct);
router.put('/:id', createValidationMiddleware(productValidationRules.create), validate, updateProduct);
router.delete('/:id', deleteProduct);
router.patch('/:id/stock', updateStock);

module.exports = router;
