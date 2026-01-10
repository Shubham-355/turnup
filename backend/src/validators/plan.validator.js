const { body, param, query } = require('express-validator');

const createPlanValidation = [
  body('name')
    .notEmpty()
    .withMessage('Plan name is required')
    .isLength({ max: 100 })
    .withMessage('Plan name cannot exceed 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('category')
    .isIn(['NIGHTOUT', 'TRIP'])
    .withMessage('Category must be NIGHTOUT or TRIP'),
  body('type')
    .optional()
    .isIn(['PRIVATE', 'PUBLIC'])
    .withMessage('Type must be PRIVATE or PUBLIC'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
];

const updatePlanValidation = [
  param('planId')
    .isUUID()
    .withMessage('Invalid plan ID'),
  body('name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Plan name cannot exceed 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('category')
    .optional()
    .isIn(['NIGHTOUT', 'TRIP'])
    .withMessage('Category must be NIGHTOUT or TRIP'),
  body('type')
    .optional()
    .isIn(['PRIVATE', 'PUBLIC'])
    .withMessage('Type must be PRIVATE or PUBLIC'),
  body('status')
    .optional()
    .isIn(['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'])
    .withMessage('Invalid status'),
];

const getPlanValidation = [
  param('planId')
    .isUUID()
    .withMessage('Invalid plan ID'),
];

const getPlansValidation = [
  query('status')
    .optional()
    .isIn(['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'])
    .withMessage('Invalid status'),
  query('category')
    .optional()
    .isIn(['NIGHTOUT', 'TRIP'])
    .withMessage('Invalid category'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
];

const joinByInviteCodeValidation = [
  body('inviteCode')
    .notEmpty()
    .withMessage('Invite code is required'),
];

const updateMemberRoleValidation = [
  param('planId')
    .isUUID()
    .withMessage('Invalid plan ID'),
  param('memberId')
    .isUUID()
    .withMessage('Invalid member ID'),
  body('role')
    .isIn(['ADMIN', 'MEMBER'])
    .withMessage('Role must be ADMIN or MEMBER'),
];

module.exports = {
  createPlanValidation,
  updatePlanValidation,
  getPlanValidation,
  getPlansValidation,
  joinByInviteCodeValidation,
  updateMemberRoleValidation,
};
