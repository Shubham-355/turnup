const invitationService = require('../services/invitation.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @route   POST /api/plans/:planId/invitations
 * @desc    Send invitation to a user
 * @access  Private (Member)
 */
const sendInvitation = asyncHandler(async (req, res) => {
  const invitation = await invitationService.sendInvitation(
    req.params.planId,
    req.user.id,
    req.body
  );

  ApiResponse.created(invitation, 'Invitation sent').send(res);
});

/**
 * @route   GET /api/invitations
 * @desc    Get user's received invitations
 * @access  Private
 */
const getReceivedInvitations = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const invitations = await invitationService.getReceivedInvitations(req.user.id, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
  });

  ApiResponse.success(invitations).send(res);
});

/**
 * @route   GET /api/plans/:planId/invitations
 * @desc    Get sent invitations for a plan
 * @access  Private (Member)
 */
const getSentInvitations = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const invitations = await invitationService.getSentInvitations(
    req.params.planId,
    req.user.id,
    {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    }
  );

  ApiResponse.success(invitations).send(res);
});

/**
 * @route   POST /api/invitations/:invitationId/respond
 * @desc    Respond to invitation (accept/decline)
 * @access  Private
 */
const respondToInvitation = asyncHandler(async (req, res) => {
  const result = await invitationService.respondToInvitation(
    req.params.invitationId,
    req.user.id,
    req.body.accept
  );

  ApiResponse.success(result).send(res);
});

/**
 * @route   DELETE /api/invitations/:invitationId
 * @desc    Cancel invitation
 * @access  Private (Sender)
 */
const cancelInvitation = asyncHandler(async (req, res) => {
  await invitationService.cancelInvitation(req.params.invitationId, req.user.id);

  ApiResponse.success(null, 'Invitation cancelled').send(res);
});

/**
 * @route   POST /api/plans/:planId/join-request
 * @desc    Request to join a public plan
 * @access  Private
 */
const requestToJoin = asyncHandler(async (req, res) => {
  const request = await invitationService.requestToJoin(
    req.params.planId,
    req.user.id,
    req.body.message
  );

  ApiResponse.created(request, 'Join request sent').send(res);
});

/**
 * @route   GET /api/plans/:planId/join-requests
 * @desc    Get join requests for a plan
 * @access  Private (Admin/Owner)
 */
const getJoinRequests = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;

  const requests = await invitationService.getJoinRequests(
    req.params.planId,
    req.user.id,
    {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      status,
    }
  );

  ApiResponse.success(requests).send(res);
});

/**
 * @route   POST /api/join-requests/:requestId/respond
 * @desc    Respond to join request (approve/reject)
 * @access  Private (Admin/Owner)
 */
const respondToJoinRequest = asyncHandler(async (req, res) => {
  const result = await invitationService.respondToJoinRequest(
    req.params.requestId,
    req.user.id,
    req.body.approve
  );

  ApiResponse.success(result).send(res);
});

/**
 * @route   GET /api/invitations/search-users
 * @desc    Search users to invite
 * @access  Private
 */
const searchUsers = asyncHandler(async (req, res) => {
  const { query, limit } = req.query;

  const users = await invitationService.searchUsers(
    query,
    req.user.id,
    parseInt(limit) || 10
  );

  ApiResponse.success(users).send(res);
});

module.exports = {
  sendInvitation,
  getReceivedInvitations,
  getSentInvitations,
  respondToInvitation,
  cancelInvitation,
  requestToJoin,
  getJoinRequests,
  respondToJoinRequest,
  searchUsers,
};
