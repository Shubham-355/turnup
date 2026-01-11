import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  TextInput,
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

const FAQ_DATA = [
  {
    question: 'How do I create a new plan?',
    answer: 'Tap the "+" button on the home screen to create a new plan. You can choose between a Night Out or a Trip, add details, and invite friends.',
  },
  {
    question: 'How do I invite friends to my plan?',
    answer: 'Open your plan and tap "Invite". You can share an invite link or invite code with your friends. They can join using the link or by entering the code.',
  },
  {
    question: 'How do I add activities to a plan?',
    answer: 'Open your plan and go to the Activities tab. Tap "Add Activity" to add stops, venues, or events to your itinerary.',
  },
  {
    question: 'How do I split expenses with my group?',
    answer: 'Go to the Expenses tab in your plan. Add expenses and assign who participated. The app will automatically calculate who owes what.',
  },
  {
    question: 'How do I share photos with my group?',
    answer: 'Go to the Media tab in your plan. Tap the camera button to upload photos from your camera roll or take a new photo.',
  },
  {
    question: 'Can I use the app offline?',
    answer: 'Some features require an internet connection, but you can view cached plans and activities offline.',
  },
];

export default function HelpSupportScreen() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@turnup.app?subject=Help Request');
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+1234567890');
  };

  const handleSubmitFeedback = () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter your message');
      return;
    }
    // TODO: Send feedback to server
    Alert.alert('Thank You!', 'Your feedback has been submitted. We\'ll get back to you soon.');
    setMessage('');
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <SafeAreaView style={styles.container as ViewStyle} edges={['top']}>
      {/* Header */}
      <View style={styles.header as ViewStyle}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton as ViewStyle}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title as TextStyle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView as ViewStyle}
        contentContainerStyle={styles.content as ViewStyle}
        showsVerticalScrollIndicator={false}
      >
        {/* Contact Options */}
        <View style={styles.section as ViewStyle}>
          <Text style={styles.sectionTitle as TextStyle}>Contact Us</Text>
          <View style={styles.contactGrid as ViewStyle}>
            <TouchableOpacity style={styles.contactCard as ViewStyle} onPress={handleEmailSupport}>
              <View style={StyleSheet.flatten([styles.contactIcon, { backgroundColor: '#DBEAFE' }]) as ViewStyle}>
                <Ionicons name="mail" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.contactLabel as TextStyle}>Email</Text>
              <Text style={styles.contactSubtext as TextStyle}>support@turnup.app</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactCard as ViewStyle} onPress={handleCallSupport}>
              <View style={StyleSheet.flatten([styles.contactIcon, { backgroundColor: '#D1FAE5' }]) as ViewStyle}>
                <Ionicons name="call" size={24} color="#10B981" />
              </View>
              <Text style={styles.contactLabel as TextStyle}>Phone</Text>
              <Text style={styles.contactSubtext as TextStyle}>Mon-Fri, 9-5</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section as ViewStyle}>
          <Text style={styles.sectionTitle as TextStyle}>Frequently Asked Questions</Text>
          {FAQ_DATA.map((faq, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.faqItem as ViewStyle}
              onPress={() => toggleFaq(index)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader as ViewStyle}>
                <Text style={styles.faqQuestion as TextStyle}>{faq.question}</Text>
                <Ionicons 
                  name={expandedFaq === index ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color={COLORS.textSecondary} 
                />
              </View>
              {expandedFaq === index && (
                <Text style={styles.faqAnswer as TextStyle}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Feedback Form */}
        <View style={styles.section as ViewStyle}>
          <Text style={styles.sectionTitle as TextStyle}>Send Feedback</Text>
          <View style={styles.feedbackCard as ViewStyle}>
            <Text style={styles.feedbackLabel as TextStyle}>
              Have a question or suggestion? We'd love to hear from you!
            </Text>
            <TextInput
              style={styles.feedbackInput as TextStyle}
              placeholder="Type your message here..."
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={4}
              value={message}
              onChangeText={setMessage}
              textAlignVertical="top"
            />
            <TouchableOpacity 
              style={styles.submitButton as ViewStyle}
              onPress={handleSubmitFeedback}
            >
              <Text style={styles.submitButtonText as TextStyle}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer as ViewStyle}>
          <Text style={styles.versionText as TextStyle}>TurnUp v1.0.0</Text>
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h4,
    color: COLORS.text,
    marginBottom: spacing.md,
  },
  contactGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  contactCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  contactLabel: {
    ...typography.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  contactSubtext: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  faqItem: {
    backgroundColor: COLORS.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    ...typography.body,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  faqAnswer: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  feedbackCard: {
    backgroundColor: COLORS.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  feedbackLabel: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginBottom: spacing.md,
  },
  feedbackInput: {
    backgroundColor: COLORS.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: spacing.md,
    minHeight: 100,
    ...typography.body,
    color: COLORS.text,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  submitButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  versionText: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
});
