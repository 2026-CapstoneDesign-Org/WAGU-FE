import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

type WorldCupSelectionEffectProps = {
  effectKey: number;
  side: 'left' | 'right' | null;
  visible: boolean;
};

const PARTICLE_CONFIGS = [
  { x: -88, y: -72, scale: 0.7 },
  { x: -56, y: -100, scale: 1 },
  { x: 0, y: -116, scale: 0.82 },
  { x: 58, y: -98, scale: 1.1 },
  { x: 92, y: -66, scale: 0.72 },
  { x: 90, y: 0, scale: 0.9 },
  { x: 66, y: 66, scale: 1.12 },
  { x: 10, y: 94, scale: 0.8 },
  { x: -58, y: 76, scale: 1 },
  { x: -94, y: 18, scale: 0.7 },
];

export function WorldCupSelectionEffect({
  effectKey,
  side,
  visible,
}: WorldCupSelectionEffectProps) {
  const particleProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible || !side) {
      return;
    }

    particleProgress.setValue(0);

    Animated.timing(particleProgress, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [effectKey, particleProgress, side, visible]);

  if (!visible || !side) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={[styles.overlay, side === 'left' ? styles.leftAnchor : styles.rightAnchor]}
    >
      {PARTICLE_CONFIGS.map((particle, index) => (
        <Animated.View
          key={`${effectKey}-${index}`}
          style={[
            styles.particle,
            {
              opacity: particleProgress.interpolate({
                inputRange: [0, 0.45, 1],
                outputRange: [0, 1, 0],
              }),
              transform: [
                {
                  translateX: particleProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, particle.x],
                  }),
                },
                {
                  translateY: particleProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, particle.y],
                  }),
                },
                {
                  scale: particleProgress.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.6, particle.scale, particle.scale * 0.82],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: '34%',
    marginLeft: -8,
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftAnchor: {
    left: '25%',
  },
  rightAnchor: {
    left: '75%',
  },
  particle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 3,
    backgroundColor: '#FF5A4F',
  },
});
