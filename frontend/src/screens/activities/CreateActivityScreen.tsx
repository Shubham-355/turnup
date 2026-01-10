import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  FlatList,
  ActivityIndicator,
  TextInput as RNTextInput,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { usePlanStore } from '../../stores';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/TextInput';
import { locationService, Place, PlaceDetails } from '../../services/location';

export default function CreateActivityScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const { createActivity, isLoading } = usePlanStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  
  // Location states
  const [locationSearch, setLocationSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<PlaceDetails | null>(null);
  const [searchingPlaces, setSearchingPlaces] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Debounced search for places
  useEffect(() => {
    if (locationSearch.length < 3) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearchingPlaces(true);
        const response = await locationService.searchPlaces(locationSearch);
        setSearchResults(response.data || []);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setSearchingPlaces(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [locationSearch]);

  const handleSelectPlace = async (place: Place) => {
    try {
      const response = await locationService.getPlaceDetails(place.placeId);
      const details = response.data;
      setSelectedLocation(details);
      setLocationSearch(details.name);
      setShowLocationModal(false);
      setSearchResults([]);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to get place details');
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an activity name');
      return;
    }

    if (!planId) {
      Alert.alert('Error', 'Plan ID is missing');
      return;
    }

    try {
      await createActivity(planId, {
        name: name.trim(),
        description: description.trim() || undefined,
        date: date?.toISOString().split('T')[0],
        time: time ? `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}` : undefined,
        locationName: selectedLocation?.name || undefined,
        locationAddress: selectedLocation?.address || undefined,
        latitude: selectedLocation?.latitude,
        longitude: selectedLocation?.longitude,
        placeId: selectedLocation?.placeId || undefined,
      });

      Alert.alert('Success', 'Activity created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Create activity error:', error);
      Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to create activity');
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Activity</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Details</Text>

          <TextInput
            label="Activity Name *"
            placeholder="e.g., Dinner at Joe's"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            label="Description"
            placeholder="Add some details..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time</Text>

          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.text.secondary} />
            <Text style={[styles.pickerButtonText, date && styles.pickerButtonTextSelected]}>
              {date ? formatDate(date) : 'Select Date'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Ionicons name="time-outline" size={20} color={colors.text.secondary} />
            <Text style={[styles.pickerButtonText, time && styles.pickerButtonTextSelected]}>
              {time ? formatTime(time) : 'Select Time'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>

          <TouchableOpacity
            style={styles.locationButton}
            onPress={() => setShowLocationModal(true)}
          >
            <Ionicons name="location-outline" size={20} color={colors.text.secondary} />
            <Text style={[
              styles.locationButtonText,
              selectedLocation && styles.locationButtonTextSelected
            ]}>
              {selectedLocation ? selectedLocation.name : 'Search for a place'}
            </Text>
            <Ionicons name="search-outline" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>

          {selectedLocation && (
            <View style={styles.selectedLocationCard}>
              <View style={styles.locationInfo}>
                <Ionicons name="location" size={16} color={colors.primary} />
                <Text style={styles.selectedLocationAddress} numberOfLines={2}>
                  {selectedLocation.address}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setSelectedLocation(null);
                  setLocationSearch('');
                }}
                style={styles.removeLocationButton}
              >
                <Ionicons name="close-circle" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Create Activity"
            onPress={handleCreate}
            loading={isLoading}
          />
        </View>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={time || new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}

      {/* Location Search Modal */}
      <Modal
        visible={showLocationModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowLocationModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Search Location</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color={colors.text.tertiary} />
              <RNTextInput
                style={styles.searchInput}
                placeholder="Search for a place..."
                placeholderTextColor={colors.text.tertiary}
                value={locationSearch}
                onChangeText={setLocationSearch}
                autoFocus
              />
              {searchingPlaces && (
                <ActivityIndicator size="small" color={colors.primary} />
              )}
            </View>
          </View>

          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.placeId}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.placeItem}
                onPress={() => handleSelectPlace(item)}
              >
                <Ionicons name="location" size={20} color={colors.primary} />
                <View style={styles.placeInfo}>
                  <Text style={styles.placeName}>{item.name}</Text>
                  <Text style={styles.placeAddress} numberOfLines={1}>
                    {item.address}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color={colors.text.tertiary} />
                <Text style={styles.emptyStateText}>
                  {locationSearch.length < 3
                    ? 'Type at least 3 characters to search'
                    : searchingPlaces
                    ? 'Searching...'
                    : 'No places found'}
                </Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>
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
  content: {
    flex: 1,
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  pickerButtonText: {
    ...typography.body,
    color: colors.text.tertiary,
    flex: 1,
    marginLeft: spacing.sm,
  },
  pickerButtonTextSelected: {
    color: colors.text.primary,
  },
  buttonContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  locationButtonText: {
    ...typography.body,
    color: colors.text.tertiary,
    flex: 1,
    marginLeft: spacing.sm,
  },
  locationButtonTextSelected: {
    color: colors.text.primary,
  },
  selectedLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  locationInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  selectedLocationAddress: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
  },
  removeLocationButton: {
    padding: spacing.xs,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalCloseButton: {
    padding: spacing.xs,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  searchContainer: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  searchInputContainer: {
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
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    gap: spacing.sm,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: 4,
  },
  placeAddress: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.text.tertiary,
    marginTop: spacing.md,
  },
});
