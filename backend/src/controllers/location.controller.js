const locationService = require('../services/location.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @route   PUT /api/plans/:planId/location
 * @desc    Update user location for a plan
 * @access  Private (Member)
 */
const updateUserLocation = asyncHandler(async (req, res) => {
  const location = await locationService.updateUserLocation(
    req.params.planId,
    req.user.id,
    req.body
  );

  // Emit socket event for real-time updates
  const io = req.app.get('io');
  if (io) {
    io.to(`plan:${req.params.planId}`).emit('location_updated', {
      user: location.user,
      latitude: location.latitude,
      longitude: location.longitude,
    });
  }

  ApiResponse.success(location, 'Location updated').send(res);
});

/**
 * @route   GET /api/plans/:planId/locations
 * @desc    Get all member locations for a plan
 * @access  Private (Member)
 */
const getPlanMemberLocations = asyncHandler(async (req, res) => {
  const locations = await locationService.getPlanMemberLocations(
    req.params.planId,
    req.user.id
  );

  ApiResponse.success(locations).send(res);
});

/**
 * @route   GET /api/plans/:planId/route
 * @desc    Get activity route for a plan
 * @access  Private (Member)
 */
const getActivityRoute = asyncHandler(async (req, res) => {
  const route = await locationService.getActivityRoute(req.params.planId, req.user.id);

  ApiResponse.success(route).send(res);
});

/**
 * @route   DELETE /api/plans/:planId/location
 * @desc    Remove user location from a plan
 * @access  Private (Member)
 */
const deleteUserLocation = asyncHandler(async (req, res) => {
  await locationService.deleteUserLocation(req.params.planId, req.user.id);

  // Emit socket event
  const io = req.app.get('io');
  if (io) {
    io.to(`plan:${req.params.planId}`).emit('location_removed', {
      userId: req.user.id,
    });
  }

  ApiResponse.success(null, 'Location removed').send(res);
});

/**
 * @route   GET /api/maps/search
 * @desc    Search places
 * @access  Private
 */
const searchPlaces = asyncHandler(async (req, res) => {
  const { q, lat, lng } = req.query;
  const location = lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null;

  const places = await locationService.searchPlaces(q, location);

  ApiResponse.success(places).send(res);
});

/**
 * @route   GET /api/maps/place/:placeId
 * @desc    Get place details
 * @access  Private
 */
const getPlaceDetails = asyncHandler(async (req, res) => {
  const details = await locationService.getPlaceDetails(req.params.placeId);

  ApiResponse.success(details).send(res);
});

/**
 * @route   GET /api/maps/directions
 * @desc    Get directions between points
 * @access  Private
 */
const getDirections = asyncHandler(async (req, res) => {
  const { originLat, originLng, destLat, destLng, waypoints } = req.query;

  const directions = await locationService.getDirections(
    { lat: parseFloat(originLat), lng: parseFloat(originLng) },
    { lat: parseFloat(destLat), lng: parseFloat(destLng) },
    waypoints ? JSON.parse(waypoints) : []
  );

  ApiResponse.success(directions).send(res);
});

module.exports = {
  updateUserLocation,
  getPlanMemberLocations,
  getActivityRoute,
  deleteUserLocation,
  searchPlaces,
  getPlaceDetails,
  getDirections,
};
