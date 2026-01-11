import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { spacing, borderRadius } from '../../theme';

// Color constants to avoid type issues with nested colors
const COLORS = {
  primary: '#FF6B35',
  text: '#111827',
  textSecondary: '#6B7280',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  border: '#E5E7EB',
};

interface ImagePickerButtonProps {
  onImagesSelected: (assets: ImagePicker.ImagePickerAsset[]) => void;
  allowMultiple?: boolean;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const ImagePickerButton: React.FC<ImagePickerButtonProps> = ({
  onImagesSelected,
  allowMultiple = true,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  label = 'Add Photos',
}) => {
  const [showActionSheet, setShowActionSheet] = useState(false);

  const requestPermissions = async (): Promise<boolean> => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return cameraStatus === 'granted' && mediaStatus === 'granted';
  };

  const handleTakePhoto = async () => {
    setShowActionSheet(false);
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      exif: false,
    });

    if (!result.canceled && result.assets.length > 0) {
      onImagesSelected(result.assets);
    }
  };

  const handlePickFromLibrary = async () => {
    setShowActionSheet(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: allowMultiple,
      quality: 0.8,
      exif: false,
    });

    if (!result.canceled && result.assets.length > 0) {
      onImagesSelected(result.assets);
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return { paddingHorizontal: spacing.md, paddingVertical: spacing.sm };
      case 'lg':
        return { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg };
      default:
        return { paddingHorizontal: spacing.lg, paddingVertical: spacing.md };
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 18;
      case 'lg':
        return 28;
      default:
        return 22;
    }
  };

  const renderButton = () => {
    if (variant === 'icon') {
      return (
        <TouchableOpacity
          style={[styles.iconButton, disabled && styles.disabled]}
          onPress={() => setShowActionSheet(true)}
          disabled={disabled || loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.primary} size="small" />
          ) : (
            <Ionicons name="camera" size={getIconSize()} color={COLORS.primary} />
          )}
        </TouchableOpacity>
      );
    }

    const buttonStyle = variant === 'primary' ? styles.primaryButton : styles.secondaryButton;
    const textStyle = variant === 'primary' ? styles.primaryText : styles.secondaryText;

    return (
      <TouchableOpacity
        style={[buttonStyle, getSizeStyles(), disabled && styles.disabled]}
        onPress={() => setShowActionSheet(true)}
        disabled={disabled || loading}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'primary' ? '#fff' : COLORS.primary}
            size="small"
          />
        ) : (
          <>
            <Ionicons
              name="camera"
              size={getIconSize()}
              color={variant === 'primary' ? '#fff' : COLORS.primary}
            />
            <Text style={textStyle}>{label}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      {renderButton()}

      <Modal
        visible={showActionSheet}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionSheet(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setShowActionSheet(false)}
        >
          <View style={styles.actionSheet}>
            <Text style={styles.title}>Add Photos</Text>

            <TouchableOpacity style={styles.option} onPress={handleTakePhoto}>
              <View style={styles.optionIcon}>
                <Ionicons name="camera" size={24} color={COLORS.text} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Take Photo</Text>
                <Text style={styles.optionSubtitle}>Use your camera</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={handlePickFromLibrary}>
              <View style={styles.optionIcon}>
                <Ionicons name="images" size={24} color={COLORS.text} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Photo Library</Text>
                <Text style={styles.optionSubtitle}>
                  {allowMultiple ? 'Select multiple photos' : 'Choose a photo'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowActionSheet(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  } as ViewStyle,
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: spacing.sm,
  } as ViewStyle,
  iconButton: {
    padding: spacing.sm,
    backgroundColor: COLORS.surface,
    borderRadius: borderRadius.full,
  } as ViewStyle,
  primaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  } as TextStyle,
  secondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  } as TextStyle,
  disabled: {
    opacity: 0.5,
  } as ViewStyle,
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  } as ViewStyle,
  actionSheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl + 20,
  } as ViewStyle,
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  } as TextStyle,
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  } as ViewStyle,
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  optionContent: {
    flex: 1,
    marginLeft: spacing.md,
  } as ViewStyle,
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  } as TextStyle,
  optionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  } as TextStyle,
  cancelButton: {
    marginTop: spacing.md,
    paddingTop: spacing.lg,
    marginHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  } as ViewStyle,
  cancelText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  } as TextStyle,
});

export default ImagePickerButton;
