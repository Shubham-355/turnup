import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/TextInput';
import { usePlanStore } from '../../stores';
import { PlanCategory, PlanType } from '../../types';

export default function CreatePlanScreen() {
  const { category: initialCategory } = useLocalSearchParams<{ category?: string }>();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PlanCategory>(
    (initialCategory as PlanCategory) || 'NIGHTOUT'
  );
  const [type, setType] = useState<PlanType>('PRIVATE');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { createPlan, isLoading } = usePlanStore();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Plan name is required';
    } else if (name.length < 3) {
      newErrors.name = 'Plan name must be at least 3 characters';
    }

    if (endDate && startDate && endDate < startDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;

    try {
      const plan = await createPlan({
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        type,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      });
      
      router.replace(`/plans/${plan.id}`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create plan');
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Select date';
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Plan</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Category Selection */}
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryContainer}>
            <TouchableOpacity
              style={[
                styles.categoryButton,
                category === 'NIGHTOUT' && styles.categorySelected,
                category === 'NIGHTOUT' && { borderColor: colors.nightout },
              ]}
              onPress={() => setCategory('NIGHTOUT')}
            >
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: category === 'NIGHTOUT' ? colors.nightout : colors.surface },
                ]}
              >
                <Ionicons name="moon" size={24} color={colors.text} />
              </View>
              <Text style={styles.categoryText}>Night Out</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.categoryButton,
                category === 'TRIP' && styles.categorySelected,
                category === 'TRIP' && { borderColor: colors.trip },
              ]}
              onPress={() => setCategory('TRIP')}
            >
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: category === 'TRIP' ? colors.trip : colors.surface },
                ]}
              >
                <Ionicons name="airplane" size={24} color={colors.text} />
              </View>
              <Text style={styles.categoryText}>Trip</Text>
            </TouchableOpacity>
          </View>

          {/* Name */}
          <TextInput
            label="Plan Name"
            placeholder="Give your plan a name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
            error={errors.name}
          />

          {/* Description */}
          <TextInput
            label="Description (Optional)"
            placeholder="What's this plan about?"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={styles.textArea}
          />

          {/* Type Selection */}
          <Text style={styles.label}>Visibility</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[styles.typeButton, type === 'PRIVATE' && styles.typeSelected]}
              onPress={() => setType('PRIVATE')}
            >
              <Ionicons
                name={type === 'PRIVATE' ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={type === 'PRIVATE' ? colors.primary : colors.textSecondary}
              />
              <View style={styles.typeContent}>
                <Text style={styles.typeTitle}>Private</Text>
                <Text style={styles.typeDescription}>Only invited members can join</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, type === 'PUBLIC' && styles.typeSelected]}
              onPress={() => setType('PUBLIC')}
            >
              <Ionicons
                name={type === 'PUBLIC' ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={type === 'PUBLIC' ? colors.primary : colors.textSecondary}
              />
              <View style={styles.typeContent}>
                <Text style={styles.typeTitle}>Public</Text>
                <Text style={styles.typeDescription}>Anyone can request to join</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Dates */}
          <Text style={styles.label}>Dates (Optional)</Text>
          <View style={styles.dateContainer}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowStartPicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.dateText, !startDate && styles.datePlaceholder]}>
                {formatDate(startDate)}
              </Text>
            </TouchableOpacity>

            <Ionicons name="arrow-forward" size={16} color={colors.textTertiary} />

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEndPicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.dateText, !endDate && styles.datePlaceholder]}>
                {formatDate(endDate)}
              </Text>
            </TouchableOpacity>
          </View>
          {errors.endDate && <Text style={styles.error}>{errors.endDate}</Text>}

          {showStartPicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(event, date) => {
                setShowStartPicker(false);
                if (date) setStartDate(date);
              }}
            />
          )}

          {showEndPicker && (
            <DateTimePicker
              value={endDate || startDate || new Date()}
              mode="date"
              display="default"
              minimumDate={startDate || new Date()}
              onChange={(event, date) => {
                setShowEndPicker(false);
                if (date) setEndDate(date);
              }}
            />
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            title="Create Plan"
            onPress={handleCreate}
            loading={isLoading}
            fullWidth
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h4,
    color: colors.text,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  categoryButton: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categorySelected: {
    borderWidth: 2,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  categoryText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  typeContainer: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  typeSelected: {
    backgroundColor: colors.surfaceLight,
  },
  typeContent: {
    flex: 1,
  },
  typeTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  typeDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
  },
  dateText: {
    ...typography.body,
    color: colors.text,
  },
  datePlaceholder: {
    color: colors.textTertiary,
  },
  error: {
    ...typography.caption,
    color: colors.error,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
