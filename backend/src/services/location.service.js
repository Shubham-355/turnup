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
   * Search places using Google Maps Places API - Best quality!
   */
  async searchPlacesGoogle(query) {
    try {
      const axios = require('axios');
      const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
        params: {
          query: query,
          key: config.mapApiKey,
        }
      });

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google API error: ${response.data.status}`);
      }

      if (!response.data.results || response.data.results.length === 0) {
        return [];
      }

      return response.data.results.map(place => ({
        placeId: `google_${place.place_id}`,
        name: place.name,
        address: place.formatted_address,
        types: place.types,
        category: place.types?.[0]?.replace(/_/g, ' ') || '',
        rating: place.rating,
        user_ratings_total: place.user_ratings_total,
        coordinates: { 
          lat: place.geometry.location.lat, 
          lng: place.geometry.location.lng 
        },
      }));
    } catch (error) {
      console.error('Google Maps search error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Search places using MapTiler Geocoding API - FREE 100k/month!
   * Excellent worldwide coverage including India
   */
  async searchPlacesMapTiler(query) {
    try {
      const axios = require('axios');
      const response = await axios.get('https://api.maptiler.com/geocoding/' + encodeURIComponent(query) + '.json', {
        params: {
          key: config.maptilerKey,
          limit: 10,
          types: 'poi,address,place', // Include Points of Interest!
        }
      });

      if (!response.data.features || response.data.features.length === 0) {
        return [];
      }

      return response.data.features.map(place => ({
        placeId: `mt_${place.id}`,
        name: place.text || place.place_name,
        address: place.place_name,
        types: place.place_type || ['place'],
        category: place.properties?.category || place.properties?.maki || null,
        coordinates: { 
          lat: place.center[1], // MapTiler uses [lng, lat]
          lng: place.center[0] 
        },
      }));
    } catch (error) {
      console.error('MapTiler search error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Search places using LocationIQ - Simple text search like Google Maps!
   * Searches by place NAME, not by category
   */
  async searchLocalPlaces(query) {
    try {
      const axios = require('axios');
      const response = await axios.get('https://us1.locationiq.com/v1/search', {
        params: {
          q: query,
          key: config.locationIqKey,
          format: 'json',
          limit: 20,
          addressdetails: 1,
          extratags: 1,
          namedetails: 1,
          dedupe: 0,
        }
      });

      return response.data.map(place => {
        const amenity = place.extratags?.amenity || place.type || 'place';
        const cuisine = place.extratags?.cuisine;
        const shop = place.extratags?.shop;
        const brand = place.extratags?.brand;
        
        let displayName = place.display_name.split(',')[0];
        let category = '';
        
        if (brand) displayName = brand;
        if (amenity === 'restaurant') category = cuisine ? `${cuisine} Restaurant` : 'Restaurant';
        else if (amenity === 'cafe') category = 'Cafe';
        else if (shop) category = `${shop} Shop`;
        else if (amenity !== 'place') category = amenity.charAt(0).toUpperCase() + amenity.slice(1);
        
        return {
          placeId: `liq_${place.place_id}`,
          name: displayName,
          address: place.display_name,
          types: [amenity],
          category: category,
          coordinates: { 
            lat: parseFloat(place.lat), 
            lng: parseFloat(place.lon) 
          },
        };
      });
    } catch (error) {
      console.error('LocationIQ search error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Search places using FREE LocationIQ API (5000/day, no credit card!)
   * Uses OpenStreetMap data - same coverage as Google Maps
   */
  async searchPlacesLocationIQ(query) {
    try {
      const axios = require('axios');
      const response = await axios.get('https://us1.locationiq.com/v1/search', {
        params: {
          q: query,
          key: config.locationIqKey,
          format: 'json',
          limit: 10,
          addressdetails: 1,
        }
      });

      return response.data.map(place => ({
        placeId: `liq_${place.place_id}`,
        name: place.display_name.split(',')[0],
        address: place.display_name,
        types: [place.type || place.class || 'place'],
        coordinates: { 
          lat: parseFloat(place.lat), 
          lng: parseFloat(place.lon) 
        },
      }));
    } catch (error) {
      console.error('LocationIQ search error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Search places - Google Maps first, then MapTiler fallback!
   */
  async searchPlaces(query, location) {
    try {
      console.log(`🗺️  Searching for: "${query}"`);
      
      // Try Google Maps first (best quality!)
      if (config.mapApiKey) {
        try {
          console.log('🔍 Using Google Maps...');
          const results = await this.searchPlacesGoogle(query);
          if (results && results.length > 0) {
            console.log(`✅ Found ${results.length} places via Google Maps`);
            return results;
          }
        } catch (googleError) {
          console.log('⚠️  Google Maps failed, trying MapTiler...');
        }
      }
      
      // Fallback to MapTiler
      if (config.maptilerKey) {
        console.log('🔄 Using MapTiler...');
        const results = await this.searchPlacesMapTiler(query);
        if (results && results.length > 0) {
          console.log(`✅ Found ${results.length} places via MapTiler`);
          return results;
        }
      }
      
      // Last fallback to LocationIQ
      console.log('🔄 Using LocationIQ...');
      const results = await this.searchLocalPlaces(query);
      if (results && results.length > 0) {
        console.log(`✅ Found ${results.length} places via LocationIQ`);
        return results;
      }
      
      return [];
    } catch (error) {
      console.error('Search error:', error);
      throw ApiError.internal('Failed to search places');
    }
  }

  /**
   * Get place details using Google, MapTiler or LocationIQ
   */
  async getPlaceDetails(placeId) {
    try {
      // Handle Google place ID
      if (placeId.startsWith('google_')) {
        const googleId = placeId.replace('google_', '');
        const axios = require('axios');
        
        const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
          params: {
            place_id: googleId,
            key: config.mapApiKey,
            fields: 'name,formatted_address,geometry,rating,user_ratings_total,types',
          }
        });

        if (response.data.status === 'OK' && response.data.result) {
          const place = response.data.result;
          return {
            placeId: placeId,
            name: place.name,
            address: place.formatted_address,
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
            types: place.types,
            rating: place.rating,
          };
        }
      }

      // Handle MapTiler place ID
      if (placeId.startsWith('mt_')) {
        return {
          placeId: placeId,
          name: 'Location',
          address: 'Selected Location',
          latitude: 0,
          longitude: 0,
          types: ['place'],
          rating: null,
        };
      }

      // Handle LocationIQ place ID
      const liqId = placeId.replace('liq_', '');
      
      const axios = require('axios');
      const response = await axios.get('https://us1.locationiq.com/v1/reverse', {
        params: {
          key: config.locationIqKey,
          format: 'json',
          osm_id: liqId,
          addressdetails: 1,
        }
      });

      const place = response.data;
      return {
        placeId: placeId,
        name: place.display_name.split(',')[0],
        address: place.display_name,
        latitude: parseFloat(place.lat),
        longitude: parseFloat(place.lon),
        types: [place.type || place.class || 'place'],
        rating: null,
      };
    } catch (error) {
      console.error('Get place details error:', error);
      throw ApiError.internal('Failed to get place details');
    }
  }

  /**
   * Get directions using FREE OSRM (Open Source Routing Machine)
   */
  async getDirections(origin, destination, waypoints = []) {
    try {
      const axios = require('axios');
      
      // Build array of all points: origin -> waypoints -> destination
      const allPoints = [origin, ...waypoints, destination];
      
      // Format coordinates for OSRM: lng,lat (note: reversed!)
      const coordinates = allPoints
        .map(wp => `${wp.longitude},${wp.latitude}`)
        .join(';');

      const response = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${coordinates}`,
        {
          params: {
            overview: 'full',
            steps: true,
            geometries: 'polyline',
          }
        }
      );

      if (response.data.code !== 'Ok') {
        throw new Error(`OSRM API error: ${response.data.code}`);
      }

      const route = response.data.routes[0];
      
      // Extract route information
      const routeData = {
        distance: {
          text: (route.distance / 1000).toFixed(1) + ' km',
          value: route.distance, // in meters
        },
        duration: {
          text: this.formatDuration(route.duration),
          value: route.duration, // in seconds
        },
        polyline: route.geometry,
        legs: route.legs.map(leg => ({
          distance: {
            text: (leg.distance / 1000).toFixed(1) + ' km',
            value: leg.distance,
          },
          duration: {
            text: this.formatDuration(leg.duration),
            value: leg.duration,
          },
          steps: leg.steps.map(step => ({
            distance: {
              text: (step.distance / 1000).toFixed(1) + ' km',
              value: step.distance,
            },
            duration: {
              text: this.formatDuration(step.duration),
              value: step.duration,
            },
            instruction: step.maneuver?.modifier || step.name || 'Continue',
          })),
        })),
      };

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
