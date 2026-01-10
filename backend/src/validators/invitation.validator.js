const { body, param, query } = require('express-validator');

const sendInvitationValidation = [
  param('planId')
    .isUUID()
    .withMessage('Invalid plan ID'),
  body('receiverId')
    .optional()
    .isUUID()
    .withMessage('Invalid receiver ID'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address'),
];

const getInvitationsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
];

const respondToInvitationValidation = [
  param('invitationId')
    .isUUID()
    .withMessage('Invalid invitation ID'),
  body('accept')
    .isBoolean()
    .withMessage('Accept must be a boolean'),
];

const requestToJoinValidation = [
  param('planId')
    .isUUID()
    .withMessage('Invalid plan ID'),
  body('message')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Message cannot exceed 500 characters'),
];

const getJoinRequestsValidation = [
  param('planId')
    .isUUID()
    .withMessage('Invalid plan ID'),
  query('status')
    .optional()
    .isIn(['PENDING', 'APPROVED', 'REJECTED'])
    .withMessage('Invalid status'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
];

const respondToJoinRequestValidation = [
  param('requestId')
    .isUUID()
    .withMessage('Invalid request ID'),
  body('approve')
    .isBoolean()
    .withMessage('Approve must be a boolean'),
];

module.exports = {
  sendInvitationValidation,
  getInvitationsValidation,
  respondToInvitationValidation,
  requestToJoinValidation,
  getJoinRequestsValidation,
  respondToJoinRequestValidation,
};
