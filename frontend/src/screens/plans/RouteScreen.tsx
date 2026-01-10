import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { locationService } from '../../services/location';
import { usePlanStore } from '../../stores';

interface RouteWaypoint {
  id: string;
  name: string;
  locationName?: string;
  locationAddress?: string;
  latitude: number;
  longitude: number;
  order: number;
  distanceToNext?: string;
}

interface RouteInfo {
  waypoints: RouteWaypoint[];
  totalDistance: string;
  totalStops: number;
}

export default function RouteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activities } = usePlanStore();
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadRouteInfo();
    }
  }, [id]);

  const loadRouteInfo = async () => {
    try {
      setLoading(true);
      const response = await locationService.getActivityRoute(id!);
      setRouteInfo(response.data);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load route information');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openInMaps = (waypoint: RouteWaypoint) => {
    // Open in device's default maps app
    const url = `https://www.google.com/maps/search/?api=1&query=${waypoint.latitude},${waypoint.longitude}`;
    Alert.alert(
      'Open in Maps',
      `Open ${waypoint.name} in your maps app?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open',
          onPress: () => {
            // Use Linking to open URL
            const { Linking } = require('react-native');
            Linking.openURL(url);
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Route Map</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading route...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!routeInfo || routeInfo.waypoints.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Route Map</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="location-outline" size={64} color={colors.text.tertiary} />
          <Text style={styles.emptyTitle}>No Route Available</Text>
          <Text style={styles.emptyText}>
            Add activities with locations to see the route
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Route Map</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Route Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Ionicons name="location" size={24} color={colors.primary} />
              <Text style={styles.summaryValue}>{routeInfo.totalStops}</Text>
              <Text style={styles.summaryLabel}>Stops</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Ionicons name="navigate" size={24} color={colors.primary} />
              <Text style={styles.summaryValue}>{routeInfo.totalDistance}</Text>
              <Text style={styles.summaryLabel}>Total Distance</Text>
            </View>
          </View>
        </View>

        {/* Waypoints */}
        <View style={styles.waypointsContainer}>
          {routeInfo.waypoints.map((waypoint, index) => (
            <View key={waypoint.id}>
              <View style={styles.waypointCard}>
                <View style={styles.waypointNumber}>
                  <Text style={styles.waypointNumberText}>{index + 1}</Text>
                </View>
                
                <View style={styles.waypointInfo}>
                  <Text style={styles.waypointName}>{waypoint.name}</Text>
                  {waypoint.locationName && (
                    <View style={styles.locationRow}>
                      <Ionicons name="location-outline" size={14} color={colors.text.secondary} />
                      <Text style={styles.locationText} numberOfLines={1}>
                        {waypoint.locationName}
                      </Text>
                    </View>
                  )}
                  {waypoint.locationAddress && (
                    <Text style={styles.addressText} numberOfLines={2}>
                      {waypoint.locationAddress}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.navigateButton}
                  onPress={() => openInMaps(waypoint)}
                >
                  <Ionicons name="navigate-circle" size={32} color={colors.primary} />
                </TouchableOpacity>
              </View>

              {index < routeInfo.waypoints.length - 1 && (
                <View style={styles.routeConnector}>
                  <View style={styles.routeLine} />
                  {waypoint.distanceToNext && (
                    <View style={styles.distanceBadge}>
                      <Ionicons name="arrow-down" size={12} color={colors.text.secondary} />
                      <Text style={styles.distanceText}>{waypoint.distanceToNext}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Info Note */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            Tap the navigate icon on any location to open it in your maps app for turn-by-turn directions.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  headerSpacer: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  summaryCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  summaryValue: {
    ...typography.h2,
    color: colors.text.primary,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  summaryDivider: {
    width: 1,
    height: 60,
    backgroundColor: colors.border.light,
  },
  waypointsContainer: {
    marginBottom: spacing.lg,
  },
  waypointCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  waypointNumber: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waypointNumberText: {
    ...typography.h4,
    color: colors.text.inverse,
  },
  waypointInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  waypointName: {
    ...typography.subtitle,
    color: colors.text.primary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  locationText: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
  },
  addressText: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  navigateButton: {
    padding: spacing.xs,
  },
  routeConnector: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
    position: 'relative',
  },
  routeLine: {
    width: 2,
    height: 40,
    backgroundColor: colors.border.light,
  },
  distanceBadge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  distanceText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary + '20',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  infoText: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
  },
});
