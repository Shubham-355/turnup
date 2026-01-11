import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import { spacing, typography, borderRadius } from '../../theme';
import { usePlanStore } from '../../stores';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Avatar } from '../../components/ui/Avatar';

// Define colors inline to avoid TypeScript issues with theme's nested structure
const COLORS = {
  background: '#FFFFFF',
  surface: '#F9FAFB',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  primary: '#FF6B35',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_HEIGHT = 350;

// Get API key from environment
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// Debug: Log if API key is loaded
console.log('Google Maps API Key loaded:', GOOGLE_MAPS_API_KEY ? 'Yes (length: ' + GOOGLE_MAPS_API_KEY.length + ')' : 'No');

export default function MapScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentPlan, members, activities, fetchPlanById } = usePlanStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    if (id) {
      loadData();
    }
    requestLocationPermission();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    setIsLoading(true);
    
    try {
      await fetchPlanById(id);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load plan:', error);
      Alert.alert('Error', 'Failed to load plan details');
      setIsLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Could not get your location');
    }
  };

  // Generate HTML for Google Maps
  const getMapHTML = () => {
    // Get activity locations (venues)
    const activityMarkers = activities
      .filter((a: any) => a.latitude && a.longitude)
      .map((a: any, index: number) => ({
        lat: a.latitude,
        lng: a.longitude,
        name: a.locationName || a.name || `Stop ${index + 1}`,
        order: index + 1,
      }));
    
    // First activity as primary destination
    const primaryDestination = activityMarkers[0] || null;
    
    // Calculate center - prioritize first activity, then user location, then default
    const centerLat = primaryDestination?.lat || userLocation?.latitude || 37.7749;
    const centerLng = primaryDestination?.lng || userLocation?.longitude || -122.4194;
    
    // Create markers for members with locations
    const memberMarkers = members
      .filter((m: any) => m.location?.latitude && m.location?.longitude)
      .map((m: any, index: number) => ({
        lat: m.location.latitude,
        lng: m.location.longitude,
        name: m.user?.displayName || m.user?.username || 'Member',
        color: index === 0 ? '#FF6B35' : '#6366F1',
      }));

    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #6B7280;
    }
    .venue-label {
      background: #10B981;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div id="map"><div class="loading">Loading map...</div></div>
  <script>
    let map;
    let directionsService;
    let directionsRenderer;
    
    function initMap() {
      map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: { lat: ${centerLat}, lng: ${centerLng} },
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        styles: [
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }
        ]
      });

      directionsService = new google.maps.DirectionsService();
      directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#7C3AED',
          strokeOpacity: 0.8,
          strokeWeight: 5,
        }
      });

      const bounds = new google.maps.LatLngBounds();

      // User location marker (blue dot)
      ${userLocation ? `
      const userMarker = new google.maps.Marker({
        position: { lat: ${userLocation.latitude}, lng: ${userLocation.longitude} },
        map: map,
        title: 'Your Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 3,
        },
        zIndex: 1000
      });
      bounds.extend({ lat: ${userLocation.latitude}, lng: ${userLocation.longitude} });
      ` : ''}

      // Activity/Venue markers (green with numbers)
      const activityLocations = ${JSON.stringify(activityMarkers)};
      activityLocations.forEach((activity, index) => {
        const marker = new google.maps.Marker({
          position: { lat: activity.lat, lng: activity.lng },
          map: map,
          title: activity.name,
          label: {
            text: String(index + 1),
            color: '#FFFFFF',
            fontWeight: 'bold',
            fontSize: '14px'
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 18,
            fillColor: '#10B981',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 3,
          },
          zIndex: 500
        });
        
        // Info window for venue
        const infoWindow = new google.maps.InfoWindow({
          content: '<div style="font-weight:600;padding:4px;">' + activity.name + '</div>'
        });
        marker.addListener('click', () => infoWindow.open(map, marker));
        
        bounds.extend({ lat: activity.lat, lng: activity.lng });
      });

      // Member markers (orange/purple circles)
      const memberLocations = ${JSON.stringify(memberMarkers)};
      memberLocations.forEach((member, index) => {
        new google.maps.Marker({
          position: { lat: member.lat, lng: member.lng },
          map: map,
          title: member.name,
          label: {
            text: member.name.charAt(0).toUpperCase(),
            color: '#FFFFFF',
            fontWeight: 'bold',
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 16,
            fillColor: member.color,
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          },
          zIndex: 100
        });
        bounds.extend({ lat: member.lat, lng: member.lng });
      });

      // Draw route from user to first activity if both exist
      ${userLocation && activityMarkers.length > 0 ? `
      const origin = { lat: ${userLocation.latitude}, lng: ${userLocation.longitude} };
      const destination = { lat: ${activityMarkers[0].lat}, lng: ${activityMarkers[0].lng} };
      
      // If multiple activities, create waypoints
      const waypoints = activityLocations.slice(1).map(loc => ({
        location: { lat: loc.lat, lng: loc.lng },
        stopover: true
      }));
      
      directionsService.route({
        origin: origin,
        destination: waypoints.length > 0 ? { lat: activityLocations[activityLocations.length - 1].lat, lng: activityLocations[activityLocations.length - 1].lng } : destination,
        waypoints: waypoints.slice(0, -1), // Remove last as it becomes destination
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false
      }, (response, status) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(response);
        } else {
          console.log('Directions request failed:', status);
        }
      });
      ` : ''}

      // Fit bounds to show all markers
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
      }
    }

    // Error handling
    window.gm_authFailure = function() {
      document.getElementById('map').innerHTML = '<div class="loading" style="flex-direction:column;text-align:center;padding:20px;"><div style="font-weight:600;margin-bottom:8px;">API Key Error</div><div style="font-size:12px;">Please enable Maps JavaScript API in Google Cloud Console</div></div>';
    };
    
    window.onerror = function(msg, url, lineNo, columnNo, error) {
      console.log('Map error:', msg);
      return false;
    };
  </script>
  <script 
    src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap" 
    async 
    defer
    onerror="document.getElementById('map').innerHTML='<div class=\\'loading\\'>Failed to load Google Maps script</div>'"
  ></script>
</body>
</html>
    `;
  };

  if (isLoading) {
    return (
      <View style={styles.centered as ViewStyle}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  if (!currentPlan) {
    return (
      <SafeAreaView style={styles.container as ViewStyle}>
        <View style={styles.header as ViewStyle}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton as ViewStyle}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title as TextStyle}>Map</Text>
        </View>
        <View style={styles.centered as ViewStyle}>
          <Text style={styles.errorText as TextStyle}>Plan not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container as ViewStyle} edges={['top']}>
      <View style={styles.header as ViewStyle}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton as ViewStyle}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title as TextStyle} numberOfLines={1}>
          {currentPlan.name}
        </Text>
        <TouchableOpacity 
          onPress={() => webViewRef.current?.reload()}
          style={styles.refreshButton as ViewStyle}
        >
          <Ionicons name="refresh" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={styles.mapContainer as ViewStyle}>
        {GOOGLE_MAPS_API_KEY ? (
          <WebView
            ref={webViewRef}
            source={{ html: getMapHTML() }}
            style={styles.map}
            scrollEnabled={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.mapLoading as ViewStyle}>
                <LoadingSpinner size="large" />
              </View>
            )}
          />
        ) : (
          <View style={styles.mapPlaceholder as ViewStyle}>
            <Ionicons name="map-outline" size={48} color={COLORS.textSecondary} />
            <Text style={styles.placeholderTitle as TextStyle}>Map Unavailable</Text>
            <Text style={styles.placeholderText as TextStyle}>
              Add EXPO_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file
            </Text>
          </View>
        )}
        
        {/* Legend */}
        <View style={styles.legend as ViewStyle}>
          <View style={styles.legendItem as ViewStyle}>
            <View style={[styles.legendDot, { backgroundColor: '#4285F4' }]} />
            <Text style={styles.legendText as TextStyle}>You</Text>
          </View>
          <View style={styles.legendItem as ViewStyle}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText as TextStyle}>Stops</Text>
          </View>
          <View style={styles.legendItem as ViewStyle}>
            <View style={[styles.legendDot, { backgroundColor: '#7C3AED', width: 16, borderRadius: 2 }]} />
            <Text style={styles.legendText as TextStyle}>Route</Text>
          </View>
        </View>
      </View>

      {/* Members List */}
      <View style={styles.membersSection as ViewStyle}>
        <Text style={styles.sectionTitle as TextStyle}>
          Plan Members ({members.length})
        </Text>
        <ScrollView 
          style={styles.membersList as ViewStyle}
          showsVerticalScrollIndicator={false}
        >
          {members.map((member: any) => (
            <View key={member.userId} style={styles.memberItem as ViewStyle}>
              <Avatar user={member.user} size="md" />
              <View style={styles.memberInfo as ViewStyle}>
                <Text style={styles.memberName as TextStyle}>
                  {member.user?.displayName || member.user?.username}
                </Text>
                <Text style={styles.memberStatus as TextStyle}>
                  {member.location?.latitude 
                    ? '📍 Location shared' 
                    : '⚪ Location not shared'}
                </Text>
              </View>
              <View style={[
                styles.roleBadge,
                { backgroundColor: member.role === 'ADMIN' ? COLORS.primary : COLORS.surface }
              ]}>
                <Text style={[
                  styles.roleText,
                  { color: member.role === 'ADMIN' ? '#FFFFFF' : COLORS.textSecondary }
                ]}>
                  {member.role}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  refreshButton: {
    padding: spacing.xs,
  },
  title: {
    ...typography.h3,
    color: COLORS.text,
    flex: 1,
  },
  errorText: {
    ...typography.body,
    color: COLORS.textSecondary,
  },
  mapContainer: {
    height: MAP_HEIGHT,
    backgroundColor: COLORS.surface,
  },
  map: {
    flex: 1,
  },
  mapLoading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  placeholderTitle: {
    ...typography.h4,
    color: COLORS.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  placeholderText: {
    ...typography.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  legend: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    paddingHorizontal: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.xs,
  },
  legendText: {
    ...typography.caption,
    color: COLORS.text,
  },
  membersSection: {
    flex: 1,
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: COLORS.text,
    marginBottom: spacing.md,
  },
  membersList: {
    flex: 1,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: COLORS.surface,
    borderRadius: borderRadius.md,
  },
  memberInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  memberName: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  memberStatus: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  roleText: {
    ...typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
