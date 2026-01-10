const express = require('express');
const router = express.Router();
const planController = require('../controllers/plan.controller');
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

module.exports = router;
