const activityService = require('../services/activity.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @route   POST /api/plans/:planId/activities
 * @desc    Create a new activity
 * @access  Private (Member)
 */
const createActivity = asyncHandler(async (req, res) => {
  const activity = await activityService.createActivity(
    req.params.planId,
    req.user.id,
    req.body
  );

  ApiResponse.created(activity, 'Activity created successfully').send(res);
});

/**
 * @route   GET /api/plans/:planId/activities
 * @desc    Get all activities for a plan
 * @access  Private (Member)
 */
const getPlanActivities = asyncHandler(async (req, res) => {
  const activities = await activityService.getPlanActivities(
    req.params.planId,
    req.user.id
  );

  ApiResponse.success(activities).send(res);
});

/**
 * @route   GET /api/activities/:activityId
 * @desc    Get activity by ID
 * @access  Private (Member)
 */
const getActivityById = asyncHandler(async (req, res) => {
  const activity = await activityService.getActivityById(
    req.params.activityId,
    req.user.id
  );

  ApiResponse.success(activity).send(res);
});

/**
 * @route   PUT /api/activities/:activityId
 * @desc    Update activity
 * @access  Private (Member)
 */
const updateActivity = asyncHandler(async (req, res) => {
  const activity = await activityService.updateActivity(
    req.params.activityId,
    req.user.id,
    req.body
  );

  ApiResponse.success(activity, 'Activity updated successfully').send(res);
});

/**
 * @route   DELETE /api/activities/:activityId
 * @desc    Delete activity
 * @access  Private (Member)
 */
const deleteActivity = asyncHandler(async (req, res) => {
  await activityService.deleteActivity(req.params.activityId, req.user.id);

  ApiResponse.success(null, 'Activity deleted successfully').send(res);
});

/**
 * @route   PUT /api/plans/:planId/activities/reorder
 * @desc    Reorder activities
 * @access  Private (Member)
 */
const reorderActivities = asyncHandler(async (req, res) => {
  const activities = await activityService.reorderActivities(
    req.params.planId,
    req.user.id,
    req.body.activityIds
  );

  ApiResponse.success(activities, 'Activities reordered successfully').send(res);
});

module.exports = {
  createActivity,
  getPlanActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
  reorderActivities,
};
