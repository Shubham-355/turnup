const prisma = require('../config/database');
const ApiError = require('../utils/ApiError');
const config = require('../config');
const { calculateDistance } = require('../utils/helpers');

class LocationService {
  /**
   * Update user location for a plan
   */
  async updateUserLocation(planId, userId, data) {
    const { latitude, longitude } = data;

    // Verify membership
    const membership = await prisma.planMember.findUnique({
      where: {
        planId_userId: { planId, userId },
      },
    });

    if (!membership || membership.status !== 'ACTIVE') {
      throw ApiError.forbidden('You are not a member of this plan');
    }

    const location = await prisma.userLocation.upsert({
      where: {
        userId_planId: { userId, planId },
      },
      update: {
        latitude,
        longitude,
      },
      create: {
        userId,
        planId,
        latitude,
        longitude,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    return location;
  }

  /**
   * Get all member locations for a plan
   */
  async getPlanMemberLocations(planId, userId) {
    // Verify membership
    const membership = await prisma.planMember.findUnique({
      where: {
        planId_userId: { planId, userId },
      },
    });

    if (!membership || membership.status !== 'ACTIVE') {
      throw ApiError.forbidden('You are not a member of this plan');
    }

    const locations = await prisma.userLocation.findMany({
      where: { planId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    return locations;
  }

  /**
   * Get route between activities (for navigation)
   * This returns the activity coordinates in order for client-side routing
   */
  async getActivityRoute(planId, userId) {
    // Verify membership
    const membership = await prisma.planMember.findUnique({
      where: {
        planId_userId: { planId, userId },
      },
    });

    if (!membership || membership.status !== 'ACTIVE') {
      throw ApiError.forbidden('You are not a member of this plan');
    }

    const activities = await prisma.activity.findMany({
      where: {
        planId,
        latitude: { not: null },
        longitude: { not: null },
      },
      orderBy: [{ date: 'asc' }, { order: 'asc' }],
      select: {
        id: true,
        name: true,
        locationName: true,
        locationAddress: true,
        latitude: true,
        longitude: true,
        date: true,
        time: true,
        order: true,
      },
    });

    // Calculate distances between consecutive activities
    const waypoints = activities.map((activity, index) => {
      let distanceToNext = null;
      if (index < activities.length - 1) {
        const next = activities[index + 1];
        distanceToNext = calculateDistance(
          activity.latitude,
          activity.longitude,
          next.latitude,
          next.longitude
        );
      }

      return {
        ...activity,
        distanceToNext: distanceToNext ? `${distanceToNext.toFixed(2)} km` : null,
      };
    });

    // Calculate total distance
    let totalDistance = 0;
    for (let i = 0; i < activities.length - 1; i++) {
      totalDistance += calculateDistance(
        activities[i].latitude,
        activities[i].longitude,
        activities[i + 1].latitude,
        activities[i + 1].longitude
      );
    }

    return {
      waypoints,
      totalDistance: `${totalDistance.toFixed(2)} km`,
      totalStops: activities.length,
    };
  }

  /**
   * Search places using map API
   * This is a proxy to the map API (Google Maps or Mapbox)
   */
  async searchPlaces(query, location) {
    // This is a placeholder - in production, you would call the actual map API
    // For Google Maps: https://maps.googleapis.com/maps/api/place/textsearch/json
    // For Mapbox: https://api.mapbox.com/geocoding/v5/mapbox.places/{query}.json

    if (!config.mapApiKey) {
      throw ApiError.internal('Map API not configured');
    }

    // Example response format (to be replaced with actual API call)
    // You would use fetch or axios to call the API
    return {
      message: 'Place search endpoint ready. Configure MAP_API_KEY and implement the API call.',
      query,
      location,
    };
  }

  /**
   * Get place details
   */
  async getPlaceDetails(placeId) {
    if (!config.mapApiKey) {
      throw ApiError.internal('Map API not configured');
    }

    // Placeholder for actual API implementation
    return {
      message: 'Place details endpoint ready. Configure MAP_API_KEY and implement the API call.',
      placeId,
    };
  }

  /**
   * Get directions between two points
   * This returns data for client-side map rendering
   */
  async getDirections(origin, destination, waypoints = []) {
    if (!config.mapApiKey) {
      throw ApiError.internal('Map API not configured');
    }

    // Placeholder for actual API implementation
    return {
      message: 'Directions endpoint ready. Configure MAP_API_KEY and implement the API call.',
      origin,
      destination,
      waypoints,
    };
  }

  /**
   * Delete user location
   */
  async deleteUserLocation(planId, userId) {
    await prisma.userLocation.deleteMany({
      where: {
        planId,
        userId,
      },
    });

    return { message: 'Location removed' };
  }
}

module.exports = new LocationService();
