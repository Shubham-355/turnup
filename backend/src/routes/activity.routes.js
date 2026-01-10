const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  createActivityValidation,
  updateActivityValidation,
  getActivityValidation,
  reorderActivitiesValidation,
} = require('../validators/activity.validator');

// All routes require authentication
router.use(authenticate);

// Activity routes (standalone)
router.get('/:activityId', getActivityValidation, validate, activityController.getActivityById);
router.put('/:activityId', updateActivityValidation, validate, activityController.updateActivity);
router.delete('/:activityId', getActivityValidation, validate, activityController.deleteActivity);

module.exports = router;
