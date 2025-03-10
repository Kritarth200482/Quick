const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { ApiError } = require('../middlewares/errorHandler');


const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};


const addItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    // Validate product
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError('Product not found', 404);
    }

    // Check stock
    if (product.stock < quantity) {
      throw new ApiError('Not enough stock available', 400);
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    
    if (!cart) {
      cart = await Cart.create({
        userId: req.user._id,
        items: [{
          productId,
          quantity,
          price: product.price,
          name: product.name,
          unit: product.unit
        }]
      });
    } else {
      // Check if product already exists in cart
      const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
      
      if (itemIndex > -1) {
        // Update quantity if product exists
        cart.items[itemIndex].quantity += quantity;
      } else {
        // Add new item if product doesn't exist
        cart.items.push({
          productId,
          quantity,
          price: product.price,
          name: product.name,
          unit: product.unit
        });
      }
      
      await cart.save();
    }

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};


const updateItemQuantity = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // Validate product
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError('Product not found', 404);
    }

    // Check stock
    if (product.stock < quantity) {
      throw new ApiError('Not enough stock available', 400);
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      throw new ApiError('Cart not found', 404);
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex === -1) {
      throw new ApiError('Item not found in cart', 404);
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/items/:productId
 * @access  Private
 */
const removeItem = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      throw new ApiError('Cart not found', 404);
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex === -1) {
      throw new ApiError('Item not found in cart', 404);
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear cart
 * @route   DELETE /api/cart
 * @access  Private
 */
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      throw new ApiError('Cart not found', 404);
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart
};
