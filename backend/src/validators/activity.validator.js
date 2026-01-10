const { body, param } = require('express-validator');

const createActivityValidation = [
  param('planId')
    .isUUID()
    .withMessage('Invalid plan ID'),
  body('name')
    .notEmpty()
    .withMessage('Activity name is required')
    .isLength({ max: 100 })
    .withMessage('Activity name cannot exceed 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid date'),
  body('time')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time must be in HH:MM format'),
  body('locationName')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Location name cannot exceed 200 characters'),
  body('locationAddress')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Location address cannot exceed 500 characters'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('placeId')
    .optional()
    .isString()
    .withMessage('Place ID must be a string'),
];

const updateActivityValidation = [
  param('activityId')
    .isUUID()
    .withMessage('Invalid activity ID'),
  body('name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Activity name cannot exceed 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid date'),
  body('time')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time must be in HH:MM format'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
];

const getActivityValidation = [
  param('activityId')
    .isUUID()
    .withMessage('Invalid activity ID'),
];

const reorderActivitiesValidation = [
  param('planId')
    .isUUID()
    .withMessage('Invalid plan ID'),
  body('activityIds')
    .isArray()
    .withMessage('Activity IDs must be an array'),
  body('activityIds.*')
    .isUUID()
    .withMessage('Each activity ID must be a valid UUID'),
];

module.exports = {
  createActivityValidation,
  updateActivityValidation,
  getActivityValidation,
  reorderActivitiesValidation,
};
