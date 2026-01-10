import api from './api';
import { ApiResponse, UserLocation } from '../types';

export interface UpdateLocationData {
  latitude: number;
  longitude: number;
}

export interface Place {
  placeId: string;
  name: string;
  address: string;
  types?: string[];
}

export interface PlaceDetails extends Place {
  latitude: number;
  longitude: number;
  rating?: number;
}

export interface RouteWaypoint {
  latitude: number;
  longitude: number;
  name?: string;
}

export interface RouteData {
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  polyline: string;
  bounds: any;
  legs: Array<{
    distance: any;
    duration: any;
    startAddress: string;
    endAddress: string;
    startLocation: any;
    endLocation: any;
    steps: Array<{
      distance: any;
      duration: any;
      instruction: string;
      polyline: string;
    }>;
  }>;
  waypointOrder?: number[];
}

export const locationService = {
  updateLocation: async (
    planId: string,
    data: UpdateLocationData
  ): Promise<ApiResponse<UserLocation>> => {
    const response = await api.put(`/plans/${planId}/location`, data);
    return response.data;
  },

  getMemberLocations: async (planId: string): Promise<ApiResponse<UserLocation[]>> => {
    const response = await api.get(`/plans/${planId}/locations`);
    return response.data;
  },

  stopSharing: async (planId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/plans/${planId}/location`);
    return response.data;
  },

  /**
   * Search for places using Google Places API
   */
  searchPlaces: async (
    query: string,
    latitude?: number,
    longitude?: number
  ): Promise<ApiResponse<Place[]>> => {
    const params: any = { q: query };
    if (latitude !== undefined && longitude !== undefined) {
      params.lat = latitude;
      params.lng = longitude;
    }
    const response = await api.get('/maps/search', { params });
    return response.data;
  },

  /**
   * Get place details by place ID
   */
  getPlaceDetails: async (placeId: string): Promise<ApiResponse<PlaceDetails>> => {
    const response = await api.get(`/maps/place/${placeId}`);
    return response.data;
  },

  /**
   * Get directions/route between waypoints
   */
  getDirections: async (
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number },
    waypoints?: RouteWaypoint[]
  ): Promise<ApiResponse<RouteData>> => {
    const params: any = {
      originLat: origin.latitude,
      originLng: origin.longitude,
      destLat: destination.latitude,
      destLng: destination.longitude,
    };
    if (waypoints && waypoints.length > 0) {
      params.waypoints = JSON.stringify(waypoints);
    }
    const response = await api.get('/maps/directions', { params });
    return response.data;
  },

  /**
   * Get activity route for a plan
   */
  getActivityRoute: async (planId: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/plans/${planId}/route`);
    return response.data;
  },
};

