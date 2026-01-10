const planService = require('../services/plan.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @route   POST /api/plans
 * @desc    Create a new plan
 * @access  Private
 */
const createPlan = asyncHandler(async (req, res) => {
  const plan = await planService.createPlan(req.user.id, req.body);

  ApiResponse.created(plan, 'Plan created successfully').send(res);
});

/**
 * @route   GET /api/plans
 * @desc    Get all plans for current user
 * @access  Private
 */
const getUserPlans = asyncHandler(async (req, res) => {
  const { status, category, page, limit } = req.query;

  const plans = await planService.getUserPlans(req.user.id, {
    status,
    category,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
  });

  ApiResponse.success(plans).send(res);
});

/**
 * @route   GET /api/plans/discover
 * @desc    Get public plans for discovery
 * @access  Private
 */
const getPublicPlans = asyncHandler(async (req, res) => {
  const { category, search, page, limit } = req.query;

  const plans = await planService.getPublicPlans({
    category,
    search,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
  });

  ApiResponse.success(plans).send(res);
});

/**
 * @route   GET /api/plans/:planId
 * @desc    Get plan by ID
 * @access  Private
 */
const getPlanById = asyncHandler(async (req, res) => {
  const plan = await planService.getPlanById(req.params.planId, req.user.id);

  ApiResponse.success(plan).send(res);
});

/**
 * @route   GET /api/plans/invite/:inviteCode
 * @desc    Get plan by invite code
 * @access  Private
 */
const getPlanByInviteCode = asyncHandler(async (req, res) => {
  const plan = await planService.getPlanByInviteCode(req.params.inviteCode);

  ApiResponse.success(plan).send(res);
});

/**
 * @route   PUT /api/plans/:planId
 * @desc    Update plan
 * @access  Private (Owner/Admin)
 */
const updatePlan = asyncHandler(async (req, res) => {
  const plan = await planService.updatePlan(req.params.planId, req.user.id, req.body);

  ApiResponse.success(plan, 'Plan updated successfully').send(res);
});

/**
 * @route   DELETE /api/plans/:planId
 * @desc    Delete plan
 * @access  Private (Owner)
 */
const deletePlan = asyncHandler(async (req, res) => {
  await planService.deletePlan(req.params.planId, req.user.id);

  ApiResponse.success(null, 'Plan deleted successfully').send(res);
});

/**
 * @route   GET /api/plans/:planId/members
 * @desc    Get plan members
 * @access  Private (Member)
 */
const getPlanMembers = asyncHandler(async (req, res) => {
  const members = await planService.getPlanMembers(req.params.planId);

  ApiResponse.success(members).send(res);
});

/**
 * @route   PUT /api/plans/:planId/members/:memberId/role
 * @desc    Update member role
 * @access  Private (Owner)
 */
const updateMemberRole = asyncHandler(async (req, res) => {
  const member = await planService.updateMemberRole(
    req.params.planId,
    req.params.memberId,
    req.body.role,
    req.user.id
  );

  ApiResponse.success(member, 'Member role updated').send(res);
});

/**
 * @route   DELETE /api/plans/:planId/members/:memberId
 * @desc    Remove member from plan
 * @access  Private (Owner/Admin)
 */
const removeMember = asyncHandler(async (req, res) => {
  await planService.removeMember(req.params.planId, req.params.memberId, req.user.id);

  ApiResponse.success(null, 'Member removed successfully').send(res);
});

/**
 * @route   POST /api/plans/:planId/leave
 * @desc    Leave a plan
 * @access  Private (Member)
 */
const leavePlan = asyncHandler(async (req, res) => {
  await planService.leavePlan(req.params.planId, req.user.id);

  ApiResponse.success(null, 'You have left the plan').send(res);
});

/**
 * @route   POST /api/plans/join
 * @desc    Join plan via invite code
 * @access  Private
 */
const joinByInviteCode = asyncHandler(async (req, res) => {
  const result = await planService.joinByInviteCode(req.body.inviteCode, req.user.id);

  ApiResponse.success(result, 'Successfully joined the plan').send(res);
});

/**
 * @route   POST /api/plans/:planId/regenerate-invite
 * @desc    Regenerate invite code
 * @access  Private (Owner)
 */
const regenerateInviteCode = asyncHandler(async (req, res) => {
  const result = await planService.regenerateInviteCode(req.params.planId, req.user.id);

  ApiResponse.success(result, 'Invite code regenerated').send(res);
});

module.exports = {
  createPlan,
  getUserPlans,
  getPublicPlans,
  getPlanById,
  getPlanByInviteCode,
  updatePlan,
  deletePlan,
  getPlanMembers,
  updateMemberRole,
  removeMember,
  leavePlan,
  joinByInviteCode,
  regenerateInviteCode,
};
