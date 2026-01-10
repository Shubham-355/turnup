import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography } from '../../theme';
import { User } from '../../types';

interface AvatarProps {
  user?: Pick<User, 'avatar' | 'displayName' | 'username'>;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  onPress?: () => void;
  showBadge?: boolean;
  badgeColor?: string;
}

const sizes = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

const fontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 20,
  xl: 28,
};

export const Avatar: React.FC<AvatarProps> = ({
  user,
  size = 'md',
  onPress,
  showBadge,
  badgeColor = colors.success,
}) => {
  const dimension = sizes[size];
  const fontSize = fontSizes[size];
  
  const getInitials = () => {
    if (!user) return '?';
    const name = user.displayName || user.username || '';
    return name.charAt(0).toUpperCase();
  };

  const content = (
    <View style={[styles.container, { width: dimension, height: dimension }]}>
      {user?.avatar ? (
        <Image
          source={{ uri: user.avatar }}
          style={[
            styles.image,
            { width: dimension, height: dimension, borderRadius: dimension / 2 },
          ]}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            { width: dimension, height: dimension, borderRadius: dimension / 2 },
          ]}
        >
          <Text style={[styles.initials, { fontSize }]}>{getInitials()}</Text>
        </View>
      )}
      {showBadge && (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: badgeColor,
              width: dimension * 0.3,
              height: dimension * 0.3,
              borderRadius: (dimension * 0.3) / 2,
            },
          ]}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    backgroundColor: colors.surface,
  },
  placeholder: {
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.text,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: colors.background,
  },
});
