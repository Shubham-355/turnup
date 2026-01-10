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
   * Search places using Google Places API
   */
  async searchPlaces(query, location) {
    if (!config.mapApiKey) {
      throw ApiError.internal('Map API not configured');
    }

    try {
      const axios = require('axios');
      const params = {
        input: query,
        key: config.mapApiKey,
        types: 'establishment|geocode',
      };

      if (location && location.lat && location.lng) {
        params.location = `${location.lat},${location.lng}`;
        params.radius = 50000; // 50km radius
      }

      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/autocomplete/json',
        { params }
      );

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Places API error: ${response.data.status}`);
      }

      return response.data.predictions.map(prediction => ({
        placeId: prediction.place_id,
        name: prediction.structured_formatting.main_text,
        address: prediction.description,
        types: prediction.types,
      }));
    } catch (error) {
      console.error('Search places error:', error);
      throw ApiError.internal('Failed to search places');
    }
  }

  /**
   * Get place details by place ID
   */
  async getPlaceDetails(placeId) {
    if (!config.mapApiKey) {
      throw ApiError.internal('Map API not configured');
    }

    try {
      const axios = require('axios');
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/details/json',
        {
          params: {
            place_id: placeId,
            fields: 'name,formatted_address,geometry,place_id,types,rating',
            key: config.mapApiKey,
          },
        }
      );

      if (response.data.status !== 'OK') {
        throw new Error(`Google Places API error: ${response.data.status}`);
      }

      const place = response.data.result;
      return {
        placeId: place.place_id,
        name: place.name,
        address: place.formatted_address,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        types: place.types,
        rating: place.rating,
      };
    } catch (error) {
      console.error('Get place details error:', error);
      throw ApiError.internal('Failed to get place details');
    }
  }

  /**
   * Get directions between waypoints using Google Directions API
   */
  async getDirections(origin, destination, waypoints = []) {
    if (!config.mapApiKey) {
      throw ApiError.internal('Map API not configured');
    }

    try {
      const axios = require('axios');
      const params = {
        origin: `${origin.latitude},${origin.longitude}`,
        destination: `${destination.latitude},${destination.longitude}`,
        key: config.mapApiKey,
        mode: 'driving',
        alternatives: false,
      };

      // Add intermediate waypoints if any
      if (waypoints && waypoints.length > 0) {
        const waypointsStr = waypoints
          .map(wp => `${wp.latitude},${wp.longitude}`)
          .join('|');
        params.waypoints = `optimize:true|${waypointsStr}`;
      }

      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/directions/json',
        { params }
      );

      if (response.data.status !== 'OK') {
        throw new Error(`Directions API error: ${response.data.status}`);
      }

      const route = response.data.routes[0];

      // Extract route information
      const routeData = {
        distance: {
          text: route.legs.reduce((sum, l) => sum + l.distance.value, 0) / 1000 + ' km',
          value: route.legs.reduce((sum, l) => sum + l.distance.value, 0),
        },
        duration: {
          text: this.formatDuration(route.legs.reduce((sum, l) => sum + l.duration.value, 0)),
          value: route.legs.reduce((sum, l) => sum + l.duration.value, 0),
        },
        polyline: route.overview_polyline.points,
        bounds: route.bounds,
        legs: route.legs.map(leg => ({
          distance: leg.distance,
          duration: leg.duration,
          startAddress: leg.start_address,
          endAddress: leg.end_address,
          startLocation: leg.start_location,
          endLocation: leg.end_location,
          steps: leg.steps.map(step => ({
            distance: step.distance,
            duration: step.duration,
            instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
            polyline: step.polyline.points,
          })),
        })),
      };

      // If optimized, return the waypoint order
      if (route.waypoint_order) {
        routeData.waypointOrder = route.waypoint_order;
      }

      return routeData;
    } catch (error) {
      console.error('Get directions error:', error);
      throw ApiError.internal('Failed to get directions');
    }
  }

  /**
   * Format duration in seconds to readable string
   */
  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
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
