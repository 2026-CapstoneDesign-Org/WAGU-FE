import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { radii } from '../theme/radii';

type SocialLoginButtonProps = {
  buttonBackgroundColor?: string;
  buttonBorderColor?: string;
  iconBackgroundColor: string;
  iconLabel: string;
  iconVariant?: 'badge' | 'plain';
  iconTextColor?: string;
  label: string;
  labelColor?: string;
  onPress?: () => void;
};

export function SocialLoginButton({
  buttonBackgroundColor = '#FFFFFF',
  buttonBorderColor = colors.border,
  iconBackgroundColor,
  iconLabel,
  iconVariant = 'plain',
  iconTextColor = '#FFFFFF',
  label,
  labelColor = '#2A2A2A',
  onPress,
}: SocialLoginButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: buttonBackgroundColor,
          borderColor: buttonBorderColor,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.content}>
        {iconVariant === 'badge' ? (
          <View style={[styles.iconBadge, { backgroundColor: iconBackgroundColor }]}>
            <Text style={[styles.iconLabel, { color: iconTextColor }]}>{iconLabel}</Text>
          </View>
        ) : (
          <Text style={[styles.iconPlainLabel, { color: iconTextColor }]}>{iconLabel}</Text>
        )}
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 54,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  pressed: {
    opacity: 0.75,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  iconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconLabel: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  iconPlainLabel: {
    width: 22,
    fontSize: 18,
    lineHeight: 20,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#2A2A2A',
    letterSpacing: -0.25,
  },
});
