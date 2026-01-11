import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Dimensions,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Pressable,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { mediaService } from '../../services/media';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Media } from '../../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const GAP = 2;
const ITEM_SIZE = (SCREEN_WIDTH - GAP * (COLUMN_COUNT + 1)) / COLUMN_COUNT;

// Color constants to avoid type issues with nested colors
const COLORS = {
  primary: '#FF6B35',
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  surfaceLight: '#F3F4F6',
  surfaceLighter: '#E5E7EB',
  border: '#E5E7EB',
};

export default function MediaGalleryScreen() {
  const { id: planId } = useLocalSearchParams<{ id: string }>();
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showActionSheet, setShowActionSheet] = useState(false);

  useEffect(() => {
    if (planId) {
      fetchMedia();
    }
  }, [planId]);

  const fetchMedia = async () => {
    if (!planId) return;
    try {
      const response = await mediaService.getMedia(planId);
      setMedia(response.data?.items || []);
    } catch (error) {
      console.error('Failed to fetch media:', error);
      Alert.alert('Error', 'Failed to load photos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMedia();
  }, [planId]);

  const handlePickImages = async () => {
    setShowActionSheet(false);
    const assets = await mediaService.pickImages(true);
    if (assets && assets.length > 0) {
      await uploadAssets(assets);
    }
  };

  const handleTakePhoto = async () => {
    setShowActionSheet(false);
    const hasPermission = await mediaService.requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant camera permissions to take photos.');
      return;
    }
    const asset = await mediaService.takePhoto();
    if (asset) {
      await uploadAssets([asset]);
    }
  };

  const uploadAssets = async (assets: ImagePicker.ImagePickerAsset[]) => {
    if (!planId) return;
    setUploading(true);
    setUploadProgress(0);

    try {
      if (assets.length === 1) {
        await mediaService.uploadMedia(planId, assets[0], {
          onProgress: setUploadProgress,
        });
      } else {
        await mediaService.uploadMultipleMedia(planId, assets, {
          onProgress: setUploadProgress,
        });
      }
      Alert.alert('Success', `${assets.length} photo(s) uploaded successfully!`);
      fetchMedia();
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to upload photos');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteMedia = async (mediaItem: Media) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await mediaService.deleteMedia(mediaItem.id);
              setMedia(prev => prev.filter(m => m.id !== mediaItem.id));
              if (selectedMedia?.id === mediaItem.id) {
                setSelectedMedia(null);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete photo');
            }
          },
        },
      ]
    );
  };

  const openMediaViewer = (item: Media, index: number) => {
    setSelectedMedia(item);
    setSelectedIndex(index);
  };

  const navigateMedia = (direction: number) => {
    const newIndex = selectedIndex + direction;
    if (newIndex >= 0 && newIndex < media.length) {
      setSelectedIndex(newIndex);
      setSelectedMedia(media[newIndex]);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderMediaItem = ({ item, index }: { item: Media; index: number }) => (
    <TouchableOpacity
      style={styles.mediaItem}
      onPress={() => openMediaViewer(item, index)}
      activeOpacity={0.8}
    >
      <ExpoImage
        source={{ uri: item.type === 'VIDEO' ? item.thumbnail || item.url : item.url }}
        style={styles.mediaImage}
        contentFit="cover"
        transition={200}
      />
      {item.type === 'VIDEO' && (
        <View style={styles.videoOverlay}>
          <View style={styles.playButton}>
            <Ionicons name="play" size={20} color="#fff" />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="images-outline" size={64} color={COLORS.textTertiary} />
      <Text style={styles.emptyTitle}>No Photos Yet</Text>
      <Text style={styles.emptyText}>
        Share photos and videos from your trip with the group
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => setShowActionSheet(true)}
      >
        <Ionicons name="camera" size={20} color="#fff" />
        <Text style={styles.emptyButtonText}>Add Photos</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Photos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowActionSheet(true)}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color={COLORS.primary} size="small" />
          ) : (
            <Ionicons name="add" size={28} color={COLORS.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Upload Progress */}
      {uploading && (
        <View style={styles.uploadProgress}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
          </View>
          <Text style={styles.progressText}>Uploading... {uploadProgress}%</Text>
        </View>
      )}

      {/* Media Grid */}
      <FlatList
        data={media}
        renderItem={renderMediaItem}
        keyExtractor={(item) => item.id}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={media.length === 0 ? styles.emptyList : styles.gridContainer}
        columnWrapperStyle={media.length > 0 ? styles.row : undefined}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      />

      {/* Action Sheet Modal */}
      <Modal
        visible={showActionSheet}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionSheet(false)}
      >
        <Pressable
          style={styles.actionSheetOverlay}
          onPress={() => setShowActionSheet(false)}
        >
          <View style={styles.actionSheet}>
            <Text style={styles.actionSheetTitle}>Add Photos</Text>
            
            <TouchableOpacity
              style={styles.actionSheetItem}
              onPress={handleTakePhoto}
            >
              <Ionicons name="camera" size={24} color={COLORS.text} />
              <Text style={styles.actionSheetText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionSheetItem}
              onPress={handlePickImages}
            >
              <Ionicons name="images" size={24} color={COLORS.text} />
              <Text style={styles.actionSheetText}>Choose from Library</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionSheetItem, styles.cancelButton]}
              onPress={() => setShowActionSheet(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Media Viewer Modal */}
      <Modal
        visible={!!selectedMedia}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMedia(null)}
      >
        <View style={styles.viewerContainer}>
          {/* Header */}
          <View style={styles.viewerHeader}>
            <TouchableOpacity
              style={styles.viewerButton}
              onPress={() => setSelectedMedia(null)}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.viewerInfo}>
              <Text style={styles.viewerUploader}>
                {selectedMedia?.uploader?.displayName || selectedMedia?.uploader?.username}
              </Text>
              <Text style={styles.viewerDate}>
                {selectedMedia && formatDate(selectedMedia.createdAt)}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.viewerButton}
              onPress={() => selectedMedia && handleDeleteMedia(selectedMedia)}
            >
              <Ionicons name="trash-outline" size={24} color="#ff6b6b" />
            </TouchableOpacity>
          </View>

          {/* Media Content */}
          <View style={styles.viewerContent}>
            {selectedMedia && (
              <ExpoImage
                source={{ uri: selectedMedia.url }}
                style={styles.viewerImage}
                contentFit="contain"
              />
            )}
          </View>

          {/* Navigation */}
          <View style={styles.viewerNavigation}>
            <TouchableOpacity
              style={[styles.navButton, selectedIndex === 0 && styles.navButtonDisabled]}
              onPress={() => navigateMedia(-1)}
              disabled={selectedIndex === 0}
            >
              <Ionicons
                name="chevron-back"
                size={32}
                color={selectedIndex === 0 ? 'rgba(255,255,255,0.3)' : '#fff'}
              />
            </TouchableOpacity>
            
            <Text style={styles.viewerCounter}>
              {selectedIndex + 1} / {media.length}
            </Text>
            
            <TouchableOpacity
              style={[styles.navButton, selectedIndex === media.length - 1 && styles.navButtonDisabled]}
              onPress={() => navigateMedia(1)}
              disabled={selectedIndex === media.length - 1}
            >
              <Ionicons
                name="chevron-forward"
                size={32}
                color={selectedIndex === media.length - 1 ? 'rgba(255,255,255,0.3)' : '#fff'}
              />
            </TouchableOpacity>
          </View>

          {/* Caption */}
          {selectedMedia?.caption && (
            <View style={styles.captionContainer}>
              <Text style={styles.caption}>{selectedMedia.caption}</Text>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  } as ViewStyle,
  backButton: {
    padding: spacing.xs,
  } as ViewStyle,
  headerTitle: {
    ...typography.h3,
    color: COLORS.text,
  } as TextStyle,
  addButton: {
    padding: spacing.xs,
  } as ViewStyle,
  uploadProgress: {
    backgroundColor: COLORS.surface,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  } as ViewStyle,
  progressBar: {
    height: 4,
    backgroundColor: COLORS.surfaceLighter,
    borderRadius: 2,
    overflow: 'hidden',
  } as ViewStyle,
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  } as ViewStyle,
  progressText: {
    ...typography.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  } as TextStyle,
  gridContainer: {
    padding: GAP,
  } as ViewStyle,
  row: {
    gap: GAP,
    marginBottom: GAP,
  } as ViewStyle,
  emptyList: {
    flex: 1,
  } as ViewStyle,
  mediaItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  } as ViewStyle,
  mediaImage: {
    width: '100%',
    height: '100%',
  } as ImageStyle,
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 3,
  } as ViewStyle,
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  } as ViewStyle,
  emptyTitle: {
    ...typography.h3,
    color: COLORS.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  } as TextStyle,
  emptyText: {
    ...typography.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  } as TextStyle,
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  } as ViewStyle,
  emptyButtonText: {
    ...typography.button,
    color: '#fff',
  } as TextStyle,
  actionSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  } as ViewStyle,
  actionSheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xl + 20,
  } as ViewStyle,
  actionSheetTitle: {
    ...typography.h4,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  } as TextStyle,
  actionSheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  } as ViewStyle,
  actionSheetText: {
    ...typography.body,
    color: COLORS.text,
  } as TextStyle,
  cancelButton: {
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: spacing.md,
    paddingTop: spacing.lg,
  } as ViewStyle,
  cancelText: {
    ...typography.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  } as TextStyle,
  viewerContainer: {
    flex: 1,
    backgroundColor: '#000',
  } as ViewStyle,
  viewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 50,
    paddingBottom: spacing.md,
  } as ViewStyle,
  viewerButton: {
    padding: spacing.sm,
  } as ViewStyle,
  viewerInfo: {
    alignItems: 'center',
  } as ViewStyle,
  viewerUploader: {
    ...typography.subtitle,
    color: '#fff',
  } as TextStyle,
  viewerDate: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.7)',
  } as TextStyle,
  viewerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  viewerImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.6,
  } as ImageStyle,
  viewerNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  } as ViewStyle,
  navButton: {
    padding: spacing.sm,
  } as ViewStyle,
  navButtonDisabled: {
    opacity: 0.5,
  } as ViewStyle,
  viewerCounter: {
    ...typography.body,
    color: 'rgba(255,255,255,0.7)',
  } as TextStyle,
  captionContainer: {
    padding: spacing.lg,
    paddingBottom: 50,
  } as ViewStyle,
  caption: {
    ...typography.body,
    color: '#fff',
    textAlign: 'center',
  } as TextStyle,
});
