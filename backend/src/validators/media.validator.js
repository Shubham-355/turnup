const { body, param, query } = require('express-validator');

const uploadMediaValidation = [
  param('planId')
    .isUUID()
    .withMessage('Invalid plan ID'),
  body('activityId')
    .optional()
    .isUUID()
    .withMessage('Invalid activity ID'),
  body('caption')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Caption cannot exceed 500 characters'),
];

const getMediaValidation = [
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
  query('type')
    .optional()
    .isIn(['IMAGE', 'VIDEO'])
    .withMessage('Type must be IMAGE or VIDEO'),
];

const deleteMediaValidation = [
  param('mediaId')
    .isUUID()
    .withMessage('Invalid media ID'),
];

const updateMediaCaptionValidation = [
  param('mediaId')
    .isUUID()
    .withMessage('Invalid media ID'),
  body('caption')
    .isLength({ max: 500 })
    .withMessage('Caption cannot exceed 500 characters'),
];

module.exports = {
  uploadMediaValidation,
  getMediaValidation,
  deleteMediaValidation,
  updateMediaCaptionValidation,
};
