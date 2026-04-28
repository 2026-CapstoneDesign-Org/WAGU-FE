import { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';

const FOOD_IMAGE_URI = 'https://www.figma.com/api/mcp/asset/22e98cac-05de-4218-8827-e7ca4bedf9a1';

type OnboardingIntroScreenProps = {
  onPressNext: () => void;
  userName?: string;
};

export function OnboardingIntroScreen({
  onPressNext,
  userName = '안예준',
}: OnboardingIntroScreenProps) {
  const dotAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    const loops = dotAnimations.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 180),
          Animated.timing(value, {
            toValue: 1,
            duration: 420,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 420,
            useNativeDriver: true,
          }),
          Animated.delay((dotAnimations.length - index - 1) * 180),
        ])
      )
    );

    loops.forEach((loop) => loop.start());

    return () => {
      loops.forEach((loop) => loop.stop());
    };
  }, [dotAnimations]);

  return (
    <Screen scrollable={false} contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Image source={{ uri: FOOD_IMAGE_URI }} style={styles.heroImage} />

        <View style={styles.copyGroup}>
          <Text style={styles.nameText}>{userName}님의</Text>
          <Text style={styles.titleText}>취향을 알려주세요</Text>

          <View style={styles.pagination}>
            <Animated.View
              style={[
                styles.dotActive,
                {
                  transform: [
                    {
                      translateY: dotAnimations[0].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -5],
                      }),
                    },
                    {
                      scale: dotAnimations[0].interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.15],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dotCurrent,
                {
                  transform: [
                    {
                      translateY: dotAnimations[1].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -5],
                      }),
                    },
                    {
                      scale: dotAnimations[1].interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.15],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dotMuted,
                {
                  transform: [
                    {
                      translateY: dotAnimations[2].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -5],
                      }),
                    },
                    {
                      scale: dotAnimations[2].interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.15],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>
        </View>
      </View>

      <Pressable onPress={onPressNext} style={({ pressed }) => [styles.nextButton, pressed && styles.pressed]}>
        <Text style={styles.nextLabel}>다음</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 130,
    paddingBottom: 34,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  content: {
    alignItems: 'center',
  },
  heroImage: {
    width: 240,
    height: 240,
    borderRadius: 25,
    marginBottom: 24,
  },
  copyGroup: {
    alignItems: 'center',
    gap: 10,
  },
  nameText: {
    fontSize: 24,
    lineHeight: 35,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  titleText: {
    fontSize: 28,
    lineHeight: 35,
    fontWeight: '700',
    color: '#FF1A12',
  },
  pagination: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
  },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#FF1A12',
    opacity: 1,
  },
  dotCurrent: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#FF1A12',
    opacity: 0.6,
  },
  dotMuted: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#FF1A12',
    opacity: 0.3,
  },
  nextButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF1A12',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  nextLabel: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.85,
  },
});
