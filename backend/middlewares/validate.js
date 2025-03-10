const { validationResult } = require('express-validator');
const { ApiError } = require('./errorHandler');

/**
 * Validation middleware
 * Checks for validation errors and throws ApiError if any
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map(err => err.msg).join(', ');
    throw new ApiError(message, 400);
  }
  next();
};

/**
 * Common validation rules
 */
const userValidationRules = {
  register: [
    {
      field: 'name',
      rules: {
        notEmpty: 'Name is required',
        isLength: { min: 2, max: 50, message: 'Name must be between 2 and 50 characters' }
      }
    },
    {
      field: 'email',
      rules: {
        notEmpty: 'Email is required',
        isEmail: 'Please enter a valid email',
        normalizeEmail: true
      }
    },
    {
      field: 'password',
      rules: {
        notEmpty: 'Password is required',
        isLength: { min: 6, message: 'Password must be at least 6 characters long' }
      }
    }
  ],
  login: [
    {
      field: 'email',
      rules: {
        notEmpty: 'Email is required',
        isEmail: 'Please enter a valid email'
      }
    },
    {
      field: 'password',
      rules: {
        notEmpty: 'Password is required'
      }
    }
  ]
};

const orderValidationRules = {
  create: [
    {
      field: 'items',
      rules: {
        notEmpty: 'Order must contain items',
        isArray: 'Items must be an array'
      }
    },
    {
      field: 'items.*.productId',
      rules: {
        notEmpty: 'Product ID is required',
        isMongoId: 'Invalid product ID'
      }
    },
    {
      field: 'items.*.quantity',
      rules: {
        notEmpty: 'Quantity is required',
        isInt: { min: 1, message: 'Quantity must be at least 1' }
      }
    },
    {
      field: 'shippingAddress',
      rules: {
        notEmpty: 'Shipping address is required'
      }
    }
  ]
};

const productValidationRules = {
  create: [
    {
      field: 'name',
      rules: {
        notEmpty: 'Product name is required',
        isLength: { min: 2, max: 100, message: 'Product name must be between 2 and 100 characters' }
      }
    },
    {
      field: 'price',
      rules: {
        notEmpty: 'Price is required',
        isFloat: { min: 0, message: 'Price must be a positive number' }
      }
    },
    {
      field: 'category',
      rules: {
        notEmpty: 'Category is required',
        isIn: {
          values: ['fruits', 'vegetables', 'dairy', 'bakery', 'beverages', 'snacks', 'household', 'other'],
          message: 'Invalid category'
        }
      }
    },
    {
      field: 'stock',
      rules: {
        isInt: { min: 0, message: 'Stock must be a non-negative number' }
      }
    }
  ]
};

/**
 * Create validation middleware from rules
 */
const createValidationMiddleware = (rules) => {
  return rules.map(({ field, rules }) => {
    const validators = Object.entries(rules).map(([validator, options]) => {
      if (typeof options === 'string') {
        return check(field)[validator]().withMessage(options);
      }
      if (options.message) {
        return check(field)[validator](options).withMessage(options.message);
      }
      return check(field)[validator](options);
    });
    return validators;
  }).flat();
};

module.exports = {
  validate,
  userValidationRules,
  orderValidationRules,
  productValidationRules,
  createValidationMiddleware
}; 