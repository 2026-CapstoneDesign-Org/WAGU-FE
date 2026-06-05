import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type RegistrationCompleteScreenProps = {
  onComplete?: () => void;
};

export function RegistrationCompleteScreen({
  onComplete,
}: RegistrationCompleteScreenProps) {
  const leftStroke = useRef(new Animated.Value(0)).current;
  const rightStroke = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(leftStroke, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(rightStroke, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(textScale, {
          toValue: 1,
          friction: 6,
          tension: 90,
          useNativeDriver: true,
        }),
      ]),
    ]).start(({ finished }) => {
      if (!finished || !onComplete) {
        return;
      }

      setTimeout(() => {
        onComplete();
      }, 700);
    });
  }, [leftStroke, rightStroke, textOpacity, textScale, onComplete]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.checkCanvas}>
            <Animated.View
              style={[
                styles.checkLeft,
                {
                  transform: [
                    { translateX: -20 },
                    { rotate: '44deg' },
                    { scaleX: leftStroke },
                    { translateX: 20 },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.checkRight,
                {
                  transform: [
                    { translateX: -37 },
                    { rotate: '-45deg' },
                    { scaleX: rightStroke },
                    { translateX: 37 },
                  ],
                },
              ]}
            />
          </View>

          <Animated.Text
            style={[
              styles.title,
              {
                opacity: textOpacity,
                transform: [{ scale: textScale }],
              },
            ]}
          >
            등록 완료!
          </Animated.Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  content: {
    marginTop: 238,
    alignItems: 'center',
    gap: 18,
  },
  checkCanvas: {
    width: 120,
    height: 86,
    position: 'relative',
  },
  checkLeft: {
    position: 'absolute',
    left: 34,
    top: 43,
    width: 24,
    height: 7,
    borderRadius: 999,
    backgroundColor: '#FF1A12',
  },
  checkRight: {
    position: 'absolute',
    left: 49,
    top: 72,
    width: 62,
    height: 7,
    borderRadius: 999,
    backgroundColor: '#FF1A12',
  },
  title: {
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    zIndex: 2,
  },
});