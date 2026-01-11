import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, borderRadius } from '../../theme';

const COLORS = {
  background: '#FFFFFF',
  surface: '#F9FAFB',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  primary: '#FF6B35',
};

const LAST_UPDATED = 'January 1, 2026';

export default function TermsOfServiceScreen() {
  return (
    <SafeAreaView style={styles.container as ViewStyle} edges={['top']}>
      {/* Header */}
      <View style={styles.header as ViewStyle}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton as ViewStyle}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title as TextStyle}>Terms of Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView as ViewStyle}
        contentContainerStyle={styles.content as ViewStyle}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated as TextStyle}>Last updated: {LAST_UPDATED}</Text>

        <View style={styles.section as ViewStyle}>
          <Text style={styles.sectionTitle as TextStyle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph as TextStyle}>
            By accessing or using TurnUp ("the App"), you agree to be bound by these Terms of 
            Service. If you do not agree to these terms, please do not use the App.
          </Text>
        </View>

        <View style={styles.section as ViewStyle}>
          <Text style={styles.sectionTitle as TextStyle}>2. Description of Service</Text>
          <Text style={styles.paragraph as TextStyle}>
            TurnUp is a mobile application that enables users to create and manage group plans, 
            coordinate activities, split expenses, and share media with other users. The service 
            includes real-time messaging, location sharing, and AI-powered suggestions.
          </Text>
        </View>

        <View style={styles.section as ViewStyle}>
          <Text style={styles.sectionTitle as TextStyle}>3. User Accounts</Text>
          <Text style={styles.paragraph as TextStyle}>
            To use certain features of the App, you must create an account. You agree to:
          </Text>
          <View style={styles.bulletList as ViewStyle}>
            <Text style={styles.bulletItem as TextStyle}>• Provide accurate and complete information</Text>
            <Text style={styles.bulletItem as TextStyle}>• Maintain the security of your password</Text>
            <Text style={styles.bulletItem as TextStyle}>• Notify us of any unauthorized access</Text>
            <Text style={styles.bulletItem as TextStyle}>• Be responsible for all activities under your account</Text>
          </View>
        </View>

        <View style={styles.section as ViewStyle}>
          <Text style={styles.sectionTitle as TextStyle}>4. Acceptable Use</Text>
          <Text style={styles.paragraph as TextStyle}>
            You agree not to:
          </Text>
          <View style={styles.bulletList as ViewStyle}>
            <Text style={styles.bulletItem as TextStyle}>• Violate any applicable laws or regulations</Text>
            <Text style={styles.bulletItem as TextStyle}>• Infringe on the rights of others</Text>
            <Text style={styles.bulletItem as TextStyle}>• Upload harmful, offensive, or illegal content</Text>
            <Text style={styles.bulletItem as TextStyle}>• Attempt to gain unauthorized access to the App</Text>
            <Text style={styles.bulletItem as TextStyle}>• Use the App for any commercial purposes without permission</Text>
            <Text style={styles.bulletItem as TextStyle}>• Harass, abuse, or harm other users</Text>
          </View>
        </View>

        <View style={styles.section as ViewStyle}>
          <Text style={styles.sectionTitle as TextStyle}>5. User Content</Text>
          <Text style={styles.paragraph as TextStyle}>
            You retain ownership of content you post to the App. By posting content, you grant us 
            a non-exclusive, worldwide, royalty-free license to use, display, and distribute your 
            content in connection with the service.
          </Text>
        </View>

        <View style={styles.section as ViewStyle}>
          <Text style={styles.sectionTitle as TextStyle}>6. Intellectual Property</Text>
          <Text style={styles.paragraph as TextStyle}>
            The App and its original content, features, and functionality are owned by TurnUp and 
            are protected by international copyright, trademark, and other intellectual property laws.
          </Text>
        </View>

        <View style={styles.section as ViewStyle}>
          <Text style={styles.sectionTitle as TextStyle}>7. Disclaimer of Warranties</Text>
          <Text style={styles.paragraph as TextStyle}>
            The App is provided "as is" without warranties of any kind. We do not guarantee that 
            the App will be uninterrupted, secure, or error-free.
          </Text>
        </View>

        <View style={styles.section as ViewStyle}>
          <Text style={styles.sectionTitle as TextStyle}>8. Limitation of Liability</Text>
          <Text style={styles.paragraph as TextStyle}>
            To the maximum extent permitted by law, TurnUp shall not be liable for any indirect, 
            incidental, special, consequential, or punitive damages arising from your use of the App.
          </Text>
        </View>

        <View style={styles.section as ViewStyle}>
          <Text style={styles.sectionTitle as TextStyle}>9. Termination</Text>
          <Text style={styles.paragraph as TextStyle}>
            We may terminate or suspend your account at any time, without prior notice, for conduct 
            that we believe violates these Terms or is harmful to other users, us, or third parties.
          </Text>
        </View>

        <View style={styles.section as ViewStyle}>
          <Text style={styles.sectionTitle as TextStyle}>10. Changes to Terms</Text>
          <Text style={styles.paragraph as TextStyle}>
            We reserve the right to modify these terms at any time. We will notify users of any 
            material changes by posting the new Terms on this page.
          </Text>
        </View>

        <View style={styles.section as ViewStyle}>
          <Text style={styles.sectionTitle as TextStyle}>11. Contact</Text>
          <Text style={styles.paragraph as TextStyle}>
            If you have questions about these Terms, please contact us at:
          </Text>
          <View style={styles.contactBox as ViewStyle}>
            <Text style={styles.contactText as TextStyle}>Email: legal@turnup.app</Text>
          </View>
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
  lastUpdated: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h4,
    color: COLORS.text,
    marginBottom: spacing.sm,
  },
  paragraph: {
    ...typography.body,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  bulletList: {
    marginTop: spacing.sm,
    marginLeft: spacing.sm,
  },
  bulletItem: {
    ...typography.body,
    color: COLORS.textSecondary,
    lineHeight: 26,
  },
  contactBox: {
    backgroundColor: COLORS.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  contactText: {
    ...typography.body,
    color: COLORS.text,
  },
});
