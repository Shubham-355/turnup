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

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.container as ViewStyle} edges={['top']}>
      {/* Header */}
      <View style={styles.header as ViewStyle}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton as ViewStyle}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title as TextStyle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView as ViewStyle}
        contentContainerStyle={styles.content as ViewStyle}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated as TextStyle}>Last updated: {LAST_UPDATED}</Text>

        <View style={styles.section as ViewStyle}>
          <Text style={styles.sectionTitle as TextStyle}>1. Introduction</Text>
          <Text style={styles.paragraph as TextStyle}>
            Welcome to TurnUp ("we," "our," or "us"). We are committed to protecting your personal 
            information and your right to privacy. This Privacy Policy explains how we collect, use, 
            disclose, and safeguard your information when you use our mobile application.
          </Text>
        </View>

        <View style={styles.section as ViewStyle}>
          <Text style={styles.sectionTitle as TextStyle}>2. Information We Collect</Text>
          <Text style={styles.paragraph as TextStyle}>
            We collect information that you provide directly to us, including:
          </Text>
          <View style={styles.bulletList as ViewStyle}>
            <Text style={styles.bulletItem as TextStyle}>• Account information (name, email, password)</Text>
            <Text style={styles.bulletItem as TextStyle}>• Profile information (display name, profile photo)</Text>
            <Text style={styles.bulletItem as TextStyle}>• Plan and activity data you create</Text>
            <Text style={styles.bulletItem as TextStyle}>• Messages and communications within the app</Text>
            <Text style={styles.bulletItem as TextStyle}>• Photos and media you upload</Text>
            <Text style={styles.bulletItem as TextStyle}>• Location data (when you enable location services)</Text>
          </View>
        </View>

        <View style={styles.section as ViewStyle}>
          <Text style={styles.sectionTitle as TextStyle}>3. How We Use Your Information</Text>
          <Text style={styles.paragraph as TextStyle}>
            We use the information we collect to:
          </Text>
          <View style={styles.bulletList as ViewStyle}>
            <Text style={styles.bulletItem as TextStyle}>• Provide, maintain, and improve our services</Text>
            <Text style={styles.bulletItem as TextStyle}>• Process and complete transactions</Text>
            <Text style={styles.bulletItem as TextStyle}>• Send you notifications and updates</Text>
            <Text style={styles.bulletItem as TextStyle}>• Respond to your comments and questions</Text>
            <Text style={styles.bulletItem as TextStyle}>• Protect against fraud and abuse</Text>
            <Text style={styles.bulletItem as TextStyle}>• Personalize your experience</Text>
          </View>
        </View>

        <View style={styles.section as ViewStyle}>
          <Text style={styles.sectionTitle as TextStyle}>4. Sharing of Information</Text>
          <Text style={styles.paragraph as TextStyle}>
            We may share your information in the following situations:
          </Text>
          <View style={styles.bulletList as ViewStyle}>
            <Text style={styles.bulletItem as TextStyle}>• With other users as part of plan collaboration</Text>
            <Text style={styles.bulletItem as TextStyle}>• With service providers who assist our operations</Text>
            <Text style={styles.bulletItem as TextStyle}>• To comply with legal obligations</Text>
            <Text style={styles.bulletItem as TextStyle}>• To protect our rights and prevent fraud</Text>
            <Text style={styles.bulletItem as TextStyle}>• With your consent or at your direction</Text>
          </View>
        </View>

        <View style={styles.section as ViewStyle}>
          <Text style={styles.sectionTitle as TextStyle}>5. Data Security</Text>
          <Text style={styles.paragraph as TextStyle}>
            We implement appropriate technical and organizational security measures to protect your 
            personal information. However, no method of transmission over the Internet or electronic 
            storage is 100% secure, and we cannot guarantee absolute security.
          </Text>
        </View>

        <View style={styles.section as ViewStyle}>
          <Text style={styles.sectionTitle as TextStyle}>6. Your Rights</Text>
          <Text style={styles.paragraph as TextStyle}>
            Depending on your location, you may have the right to:
          </Text>
          <View style={styles.bulletList as ViewStyle}>
            <Text style={styles.bulletItem as TextStyle}>• Access your personal information</Text>
            <Text style={styles.bulletItem as TextStyle}>• Correct inaccurate data</Text>
            <Text style={styles.bulletItem as TextStyle}>• Request deletion of your data</Text>
            <Text style={styles.bulletItem as TextStyle}>• Opt out of marketing communications</Text>
            <Text style={styles.bulletItem as TextStyle}>• Data portability</Text>
          </View>
        </View>

        <View style={styles.section as ViewStyle}>
          <Text style={styles.sectionTitle as TextStyle}>7. Children's Privacy</Text>
          <Text style={styles.paragraph as TextStyle}>
            Our service is not directed to children under 13. We do not knowingly collect personal 
            information from children under 13. If you are a parent or guardian and believe your 
            child has provided us with personal information, please contact us.
          </Text>
        </View>

        <View style={styles.section as ViewStyle}>
          <Text style={styles.sectionTitle as TextStyle}>8. Changes to This Policy</Text>
          <Text style={styles.paragraph as TextStyle}>
            We may update this Privacy Policy from time to time. We will notify you of any changes 
            by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </Text>
        </View>

        <View style={styles.section as ViewStyle}>
          <Text style={styles.sectionTitle as TextStyle}>9. Contact Us</Text>
          <Text style={styles.paragraph as TextStyle}>
            If you have questions about this Privacy Policy, please contact us at:
          </Text>
          <View style={styles.contactBox as ViewStyle}>
            <Text style={styles.contactText as TextStyle}>Email: privacy@turnup.app</Text>
            <Text style={styles.contactText as TextStyle}>Address: 123 App Street, San Francisco, CA 94102</Text>
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
    marginBottom: spacing.xs,
  },
});
