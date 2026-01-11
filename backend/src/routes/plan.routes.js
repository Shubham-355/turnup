const express = require('express');
const router = express.Router();
const planController = require('../controllers/plan.controller');
const activityController = require('../controllers/activity.controller');
const { authenticate, isPlanMember, isPlanAdmin } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  createPlanValidation,
  updatePlanValidation,
  getPlanValidation,
  getPlansValidation,
  joinByInviteCodeValidation,
  updateMemberRoleValidation,
} = require('../validators/plan.validator');
const {
  createActivityValidation,
  updateActivityValidation,
  getActivityValidation,
  reorderActivitiesValidation,
} = require('../validators/activity.validator');

// All routes require authentication
router.use(authenticate);

// Plan CRUD
router.post('/', createPlanValidation, validate, planController.createPlan);
router.get('/', getPlansValidation, validate, planController.getUserPlans);
router.get('/discover', getPlansValidation, validate, planController.getPublicPlans);
router.post('/join', joinByInviteCodeValidation, validate, planController.joinByInviteCode);
router.get('/invite/:inviteCode', planController.getPlanByInviteCode);

router.get('/:planId', getPlanValidation, validate, planController.getPlanById);
router.put('/:planId', updatePlanValidation, validate, planController.updatePlan);
router.delete('/:planId', getPlanValidation, validate, planController.deletePlan);

// Member management
router.get('/:planId/members', getPlanValidation, validate, isPlanMember, planController.getPlanMembers);
router.put(
  '/:planId/members/:memberId/role',
  updateMemberRoleValidation,
  validate,
  planController.updateMemberRole
);
router.delete(
  '/:planId/members/:memberId',
  getPlanValidation,
  validate,
  planController.removeMember
);
router.post('/:planId/leave', getPlanValidation, validate, isPlanMember, planController.leavePlan);
router.post('/:planId/regenerate-invite', getPlanValidation, validate, planController.regenerateInviteCode);

// Nested activity routes under plans
router.get('/:planId/activities', getPlanValidation, validate, isPlanMember, activityController.getPlanActivities);
router.post('/:planId/activities', createActivityValidation, validate, activityController.createActivity);
router.put('/:planId/activities/reorder', reorderActivitiesValidation, validate, activityController.reorderActivities);
router.get('/:planId/activities/:activityId', getActivityValidation, validate, activityController.getActivityById);
router.put('/:planId/activities/:activityId', updateActivityValidation, validate, activityController.updateActivity);
router.delete('/:planId/activities/:activityId', getActivityValidation, validate, activityController.deleteActivity);

module.exports = router;
