import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { spacing, typography, borderRadius } from '../../theme';

const COLORS = {
  background: '#FFFFFF',
  surface: '#F9FAFB',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  primary: '#FF6B35',
};

const APP_VERSION = Constants.expoConfig?.version || '1.0.0';
const BUILD_NUMBER = Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || '1';

export default function AboutScreen() {
  const handleOpenWebsite = () => {
    Linking.openURL('https://turnup.app');
  };

  const handleOpenTwitter = () => {
    Linking.openURL('https://twitter.com/turnupapp');
  };

  const handleOpenInstagram = () => {
    Linking.openURL('https://instagram.com/turnupapp');
  };

  const handleRateApp = () => {
    // TODO: Link to app store
    Linking.openURL('https://apps.apple.com');
  };

  return (
    <SafeAreaView style={styles.container as ViewStyle} edges={['top']}>
      {/* Header */}
      <View style={styles.header as ViewStyle}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton as ViewStyle}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title as TextStyle}>About</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView as ViewStyle}
        contentContainerStyle={styles.content as ViewStyle}
        showsVerticalScrollIndicator={false}
      >
        {/* App Logo & Info */}
        <View style={styles.appInfo as ViewStyle}>
          <View style={styles.logoContainer as ViewStyle}>
            <Ionicons name="calendar" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.appName as TextStyle}>TurnUp</Text>
          <Text style={styles.tagline as TextStyle}>Plan. Connect. Experience.</Text>
          <Text style={styles.version as TextStyle}>Version {APP_VERSION} ({BUILD_NUMBER})</Text>
        </View>

        {/* Description */}
        <View style={styles.section as ViewStyle}>
          <Text style={styles.description as TextStyle}>
            TurnUp is the ultimate group planning app that helps you organize unforgettable 
            experiences with friends and family. From night outs to road trips, we make 
            coordinating activities, splitting expenses, and sharing memories effortless.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.section as ViewStyle}>
          <Text style={styles.sectionTitle as TextStyle}>Features</Text>
          <View style={styles.featureGrid as ViewStyle}>
            <View style={styles.featureItem as ViewStyle}>
              <Ionicons name="people" size={24} color={COLORS.primary} />
              <Text style={styles.featureText as TextStyle}>Group Planning</Text>
            </View>
            <View style={styles.featureItem as ViewStyle}>
              <Ionicons name="chatbubbles" size={24} color={COLORS.primary} />
              <Text style={styles.featureText as TextStyle}>Real-time Chat</Text>
            </View>
            <View style={styles.featureItem as ViewStyle}>
              <Ionicons name="wallet" size={24} color={COLORS.primary} />
              <Text style={styles.featureText as TextStyle}>Expense Splitting</Text>
            </View>
            <View style={styles.featureItem as ViewStyle}>
              <Ionicons name="images" size={24} color={COLORS.primary} />
              <Text style={styles.featureText as TextStyle}>Photo Sharing</Text>
            </View>
            <View style={styles.featureItem as ViewStyle}>
              <Ionicons name="map" size={24} color={COLORS.primary} />
              <Text style={styles.featureText as TextStyle}>Location Tracking</Text>
            </View>
            <View style={styles.featureItem as ViewStyle}>
              <Ionicons name="sparkles" size={24} color={COLORS.primary} />
              <Text style={styles.featureText as TextStyle}>AI Suggestions</Text>
            </View>
          </View>
        </View>

        {/* Links */}
        <View style={styles.section as ViewStyle}>
          <Text style={styles.sectionTitle as TextStyle}>Connect With Us</Text>
          <View style={styles.linksList as ViewStyle}>
            <TouchableOpacity style={styles.linkItem as ViewStyle} onPress={handleOpenWebsite}>
              <View style={styles.linkIcon as ViewStyle}>
                <Ionicons name="globe-outline" size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.linkText as TextStyle}>Visit our Website</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkItem as ViewStyle} onPress={handleOpenTwitter}>
              <View style={styles.linkIcon as ViewStyle}>
                <Ionicons name="logo-twitter" size={22} color="#1DA1F2" />
              </View>
              <Text style={styles.linkText as TextStyle}>Follow on Twitter</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkItem as ViewStyle} onPress={handleOpenInstagram}>
              <View style={styles.linkIcon as ViewStyle}>
                <Ionicons name="logo-instagram" size={22} color="#E4405F" />
              </View>
              <Text style={styles.linkText as TextStyle}>Follow on Instagram</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkItem as ViewStyle} onPress={handleRateApp}>
              <View style={styles.linkIcon as ViewStyle}>
                <Ionicons name="star-outline" size={22} color="#FFB800" />
              </View>
              <Text style={styles.linkText as TextStyle}>Rate the App</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section as ViewStyle}>
          <Text style={styles.sectionTitle as TextStyle}>Legal</Text>
          <View style={styles.linksList as ViewStyle}>
            <TouchableOpacity 
              style={styles.linkItem as ViewStyle} 
              onPress={() => router.push('/settings/privacy')}
            >
              <View style={styles.linkIcon as ViewStyle}>
                <Ionicons name="shield-outline" size={22} color={COLORS.textSecondary} />
              </View>
              <Text style={styles.linkText as TextStyle}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.linkItem as ViewStyle} 
              onPress={() => router.push('/settings/terms')}
            >
              <View style={styles.linkIcon as ViewStyle}>
                <Ionicons name="document-text-outline" size={22} color={COLORS.textSecondary} />
              </View>
              <Text style={styles.linkText as TextStyle}>Terms of Service</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Credits */}
        <View style={styles.credits as ViewStyle}>
          <Text style={styles.creditsText as TextStyle}>Made with ❤️ by the TurnUp Team</Text>
          <Text style={styles.copyright as TextStyle}>© 2026 TurnUp. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  appInfo: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  appName: {
    ...typography.h1,
    color: COLORS.text,
    marginBottom: spacing.xs,
  },
  tagline: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginBottom: spacing.sm,
  },
  version: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h4,
    color: COLORS.text,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: COLORS.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  featureItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  featureText: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  linksList: {
    backgroundColor: COLORS.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  linkIcon: {
    width: 32,
    alignItems: 'center',
  },
  linkText: {
    ...typography.body,
    color: COLORS.text,
    flex: 1,
    marginLeft: spacing.sm,
  },
  credits: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  creditsText: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginBottom: spacing.xs,
  },
  copyright: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
});
