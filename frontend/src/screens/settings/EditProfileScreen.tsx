import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { spacing, typography, borderRadius } from '../../theme';
import { useAuthStore } from '../../stores';
import { TextInput } from '../../components/ui/TextInput';
import { Button } from '../../components/ui/Button';

const COLORS = {
  background: '#FFFFFF',
  surface: '#F9FAFB',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  primary: '#FF6B35',
  error: '#EF4444',
};

export default function EditProfileScreen() {
  const { user, updateProfile, isLoading } = useAuthStore();
  
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatar || null);
  const [isUploading, setIsUploading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Check for changes
    const changed = 
      displayName !== (user?.displayName || '') ||
      username !== (user?.username || '') ||
      phone !== (user?.phone || '');
    setHasChanges(changed);
  }, [displayName, username, phone, user]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to change your avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
      setHasChanges(true);
      // TODO: Upload avatar to server
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera permissions to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
      setHasChanges(true);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Change Profile Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: handleTakePhoto },
        { text: 'Choose from Library', onPress: handlePickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    try {
      await updateProfile({
        displayName: displayName.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    }
  };

  const getInitials = () => {
    const name = displayName || username || 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container as ViewStyle} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView as ViewStyle}
      >
        {/* Header */}
        <View style={styles.header as ViewStyle}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton as ViewStyle}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title as TextStyle}>Edit Profile</Text>
          <TouchableOpacity 
            onPress={handleSave} 
            disabled={!hasChanges || isLoading}
            style={styles.saveButton as ViewStyle}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text style={StyleSheet.flatten([
                styles.saveText,
                { color: hasChanges ? COLORS.primary : COLORS.textSecondary }
              ]) as TextStyle}>
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView as ViewStyle}
          contentContainerStyle={styles.content as ViewStyle}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection as ViewStyle}>
            <TouchableOpacity onPress={showImageOptions} style={styles.avatarContainer as ViewStyle}>
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.avatar}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.avatarPlaceholder as ViewStyle}>
                  <Text style={styles.avatarInitial as TextStyle}>{getInitials()}</Text>
                </View>
              )}
              <View style={styles.editBadge as ViewStyle}>
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={showImageOptions}>
              <Text style={styles.changePhotoText as TextStyle}>Change Profile Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form as ViewStyle}>
            <View style={styles.inputGroup as ViewStyle}>
              <Text style={styles.label as TextStyle}>Display Name</Text>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter your display name"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup as ViewStyle}>
              <Text style={styles.label as TextStyle}>Username</Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your username"
                autoCapitalize="none"
                editable={false}
              />
              <Text style={styles.helperText as TextStyle}>Username cannot be changed</Text>
            </View>

            <View style={styles.inputGroup as ViewStyle}>
              <Text style={styles.label as TextStyle}>Email</Text>
              <TextInput
                value={user?.email || ''}
                editable={false}
                placeholder="Email"
              />
              <Text style={styles.helperText as TextStyle}>Email cannot be changed</Text>
            </View>

            <View style={styles.inputGroup as ViewStyle}>
              <Text style={styles.label as TextStyle}>Phone Number</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup as ViewStyle}>
              <Text style={styles.label as TextStyle}>Bio</Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself..."
                multiline
                numberOfLines={4}
                style={styles.bioInput}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    ...typography.h3,
    color: COLORS.text,
  },
  saveButton: {
    padding: spacing.xs,
  },
  saveText: {
    ...typography.body,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.background,
  },
  changePhotoText: {
    ...typography.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  helperText: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
});
