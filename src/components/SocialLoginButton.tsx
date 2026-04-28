import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { radii } from '../theme/radii';

type SocialLoginButtonProps = {
  iconUri: string;
  label: string;
  onPress?: () => void;
};

export function SocialLoginButton({
  iconUri,
  label,
  onPress,
}: SocialLoginButtonProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <View style={styles.content}>
        <Image source={{ uri: iconUri }} style={styles.icon} resizeMode="contain" />
        <Text style={styles.label}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 46,
    borderWidth: 2,
    borderColor: '#E1E1E1',
    borderRadius: radii.md,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#2A2A2A',
    letterSpacing: -0.5,
  },
});
