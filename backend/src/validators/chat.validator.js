const { body, param, query } = require('express-validator');

const sendMessageValidation = [
  param('planId')
    .isUUID()
    .withMessage('Invalid plan ID'),
  body('content')
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ max: 2000 })
    .withMessage('Message cannot exceed 2000 characters'),
  body('type')
    .optional()
    .isIn(['TEXT', 'IMAGE', 'VIDEO', 'LOCATION'])
    .withMessage('Invalid message type'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object'),
];

const getMessagesValidation = [
  param('planId')
    .isUUID()
    .withMessage('Invalid plan ID'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('before')
    .optional()
    .isISO8601()
    .withMessage('Before must be a valid date'),
];

const deleteMessageValidation = [
  param('messageId')
    .isUUID()
    .withMessage('Invalid message ID'),
];

module.exports = {
  sendMessageValidation,
  getMessagesValidation,
  deleteMessageValidation,
};
