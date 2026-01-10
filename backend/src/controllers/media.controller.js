const mediaService = require('../services/media.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * @route   POST /api/plans/:planId/media
 * @desc    Upload media to a plan
 * @access  Private (Member)
 */
const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('No file uploaded');
  }

  const media = await mediaService.uploadMedia(
    req.params.planId,
    req.user.id,
    req.file,
    req.body
  );

  ApiResponse.created(media, 'Media uploaded successfully').send(res);
});

/**
 * @route   POST /api/plans/:planId/media/multiple
 * @desc    Upload multiple media files to a plan
 * @access  Private (Member)
 */
const uploadMultipleMedia = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw ApiError.badRequest('No files uploaded');
  }

  const media = await mediaService.uploadMultipleMedia(
    req.params.planId,
    req.user.id,
    req.files,
    req.body
  );

  ApiResponse.created(media, 'Media uploaded successfully').send(res);
});

/**
 * @route   GET /api/plans/:planId/media
 * @desc    Get media for a plan
 * @access  Private (Member)
 */
const getPlanMedia = asyncHandler(async (req, res) => {
  const { page, limit, type } = req.query;

  const media = await mediaService.getPlanMedia(req.params.planId, req.user.id, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    type,
  });

  ApiResponse.success(media).send(res);
});

/**
 * @route   GET /api/activities/:activityId/media
 * @desc    Get media for an activity
 * @access  Private (Member)
 */
const getActivityMedia = asyncHandler(async (req, res) => {
  const media = await mediaService.getActivityMedia(req.params.activityId, req.user.id);

  ApiResponse.success(media).send(res);
});

/**
 * @route   DELETE /api/media/:mediaId
 * @desc    Delete media
 * @access  Private (Uploader/Admin)
 */
const deleteMedia = asyncHandler(async (req, res) => {
  await mediaService.deleteMedia(req.params.mediaId, req.user.id);

  ApiResponse.success(null, 'Media deleted successfully').send(res);
});

/**
 * @route   PUT /api/media/:mediaId/caption
 * @desc    Update media caption
 * @access  Private (Uploader)
 */
const updateMediaCaption = asyncHandler(async (req, res) => {
  const media = await mediaService.updateMediaCaption(
    req.params.mediaId,
    req.user.id,
    req.body.caption
  );

  ApiResponse.success(media, 'Caption updated successfully').send(res);
});

module.exports = {
  uploadMedia,
  uploadMultipleMedia,
  getPlanMedia,
  getActivityMedia,
  deleteMedia,
  updateMediaCaption,
};
