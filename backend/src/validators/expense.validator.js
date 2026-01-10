const { body, param, query } = require('express-validator');

const createExpenseValidation = [
  param('planId')
    .isUUID()
    .withMessage('Invalid plan ID'),
  body('title')
    .notEmpty()
    .withMessage('Expense title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter code'),
  body('splitType')
    .optional()
    .isIn(['EQUAL', 'CUSTOM', 'BY_ITEM'])
    .withMessage('Invalid split type'),
  body('activityId')
    .optional()
    .isUUID()
    .withMessage('Invalid activity ID'),
  body('shares')
    .optional()
    .isArray()
    .withMessage('Shares must be an array'),
  body('shares.*.userId')
    .optional()
    .isUUID()
    .withMessage('Invalid user ID in shares'),
  body('shares.*.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Share amount must be a positive number'),
];

const updateExpenseValidation = [
  param('expenseId')
    .isUUID()
    .withMessage('Invalid expense ID'),
  body('title')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter code'),
  body('splitType')
    .optional()
    .isIn(['EQUAL', 'CUSTOM', 'BY_ITEM'])
    .withMessage('Invalid split type'),
];

const getExpenseValidation = [
  param('expenseId')
    .isUUID()
    .withMessage('Invalid expense ID'),
];

const getExpensesValidation = [
  param('planId')
    .isUUID()
    .withMessage('Invalid plan ID'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
];

const settleShareValidation = [
  param('expenseId')
    .isUUID()
    .withMessage('Invalid expense ID'),
  param('userId')
    .isUUID()
    .withMessage('Invalid user ID'),
];

module.exports = {
  createExpenseValidation,
  updateExpenseValidation,
  getExpenseValidation,
  getExpensesValidation,
  settleShareValidation,
};
