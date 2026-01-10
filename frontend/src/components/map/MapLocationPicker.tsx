import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput as RNTextInput,
  ActivityIndicator,
  FlatList,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Mapbox from '@rnmapbox/maps';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Place, PlaceDetails } from '../../services/location';

// Set your Mapbox access token
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '');

interface MapLocationPickerProps {
  onLocationSelect: (location: PlaceDetails) => void;
  onCancel: () => void;
  initialLocation?: {
    latitude: number;
    longitude: number;
  };
}

export function MapLocationPicker({
  onLocationSelect,
  onCancel,
  initialLocation,
}: MapLocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const [showResults, setShowResults] = useState(false);
  const mapRef = useRef<Mapbox.MapView>(null);
  const cameraRef = useRef<Mapbox.Camera>(null);

  const defaultCenter = initialLocation
    ? [initialLocation.longitude, initialLocation.latitude]
    : [-73.985428, 40.758896]; // New York

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setSearching(true);
    setShowResults(true);

    try {
      // Use Mapbox Geocoding API
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${process.env.EXPO_PUBLIC_MAPBOX_TOKEN}&limit=5`
      );
      const data = await response.json();

      const places: Place[] = data.features.map((feature: any) => ({
        placeId: feature.id,
        name: feature.text,
        address: feature.place_name,
        types: feature.place_type,
      }));

      setSearchResults(places);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectPlace = async (place: Place) => {
    try {
      Keyboard.dismiss();
      setShowResults(false);
      setSearching(true);

      // Get place details from Mapbox
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          place.address
        )}.json?access_token=${process.env.EXPO_PUBLIC_MAPBOX_TOKEN}&limit=1`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [longitude, latitude] = feature.center;

        const placeDetails: PlaceDetails = {
          placeId: feature.id,
          name: place.name,
          address: feature.place_name,
          latitude,
          longitude,
        };

        setSelectedPlace(placeDetails);

        // Animate camera to location
        cameraRef.current?.setCamera({
          centerCoordinate: [longitude, latitude],
          zoomLevel: 15,
          animationDuration: 1000,
        });
      }
    } catch (error) {
      console.error('Error getting place details:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleMapPress = async (feature: any) => {
    const { geometry } = feature;
    if (geometry?.coordinates) {
      const [longitude, latitude] = geometry.coordinates;

      // Reverse geocode to get address
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${process.env.EXPO_PUBLIC_MAPBOX_TOKEN}`
        );
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          const feature = data.features[0];

          const placeDetails: PlaceDetails = {
            placeId: feature.id,
            name: feature.text || 'Selected Location',
            address: feature.place_name,
            latitude,
            longitude,
          };

          setSelectedPlace(placeDetails);
        }
      } catch (error) {
        console.error('Reverse geocode error:', error);
      }
    }
  };

  const handleConfirm = () => {
    if (selectedPlace) {
      onLocationSelect(selectedPlace);
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={colors.text.tertiary} />
          <RNTextInput
            style={styles.searchInput}
            placeholder="Search for a place..."
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {searching && <ActivityIndicator size="small" color={colors.primary} />}
        </View>
      </View>

      {/* Search Results */}
      {showResults && searchResults.length > 0 && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.placeId}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleSelectPlace(item)}
              >
                <Ionicons name="location" size={20} color={colors.primary} />
                <View style={styles.resultInfo}>
                  <Text style={styles.resultName}>{item.name}</Text>
                  <Text style={styles.resultAddress} numberOfLines={1}>
                    {item.address}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      {/* Map */}
      <Mapbox.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={Mapbox.StyleURL.Street}
        onPress={handleMapPress}
      >
        <Mapbox.Camera
          ref={cameraRef}
          centerCoordinate={defaultCenter}
          zoomLevel={12}
        />

        {selectedPlace && (
          <Mapbox.PointAnnotation
            id="selected-location"
            coordinate={[selectedPlace.longitude, selectedPlace.latitude]}
          >
            <View style={styles.markerContainer}>
              <Ionicons name="location" size={40} color={colors.primary} />
            </View>
          </Mapbox.PointAnnotation>
        )}
      </Mapbox.MapView>

      {/* Selected Location Card */}
      {selectedPlace && (
        <View style={styles.selectionCard}>
          <View style={styles.selectionInfo}>
            <Text style={styles.selectionName}>{selectedPlace.name}</Text>
            <Text style={styles.selectionAddress} numberOfLines={2}>
              {selectedPlace.address}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>Confirm</Text>
            <Ionicons name="checkmark-circle" size={24} color={colors.text.inverse} />
          </TouchableOpacity>
        </View>
      )}

      {/* Instruction */}
      {!selectedPlace && !showResults && (
        <View style={styles.instructionCard}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <Text style={styles.instructionText}>
            Search for a place or tap on the map to select a location
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    gap: spacing.sm,
    zIndex: 10,
  },
  closeButton: {
    padding: spacing.xs,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.text.primary,
  },
  resultsContainer: {
    position: 'absolute',
    top: 80,
    left: spacing.md,
    right: spacing.md,
    maxHeight: 300,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 20,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    gap: spacing.sm,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultAddress: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },
  selectionCard: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  selectionInfo: {
    flex: 1,
  },
  selectionName: {
    ...typography.subtitle,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  selectionAddress: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  confirmButtonText: {
    ...typography.body,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  instructionCard: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.primary + '20',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  instructionText: {
    ...typography.caption,
    color: colors.text.primary,
    flex: 1,
  },
});
