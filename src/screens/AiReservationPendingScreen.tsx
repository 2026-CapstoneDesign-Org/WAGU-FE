import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, BackHandler, Easing, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CallIcon from '../../assets/icons/call.svg';
import { AiReservationDraft, AiReservationStatus } from '../types/aiReservation';

type AiReservationPendingScreenProps = {
  draft: AiReservationDraft;
  onComplete: () => void;
  targetStatus: AiReservationStatus;
};

export function AiReservationPendingScreen({
  draft: _draft,
  onComplete,
  targetStatus,
}: AiReservationPendingScreenProps) {
  const [statusIndex, setStatusIndex] = useState(0);
  const [dotCount, setDotCount] = useState(1);
  const floatY = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(0.9)).current;
  const pulseOpacity = useRef(new Animated.Value(0.22)).current;
  const statusMessages = useMemo(() => {
    if (targetStatus === 'no-answer') {
      return ['매장에 연결 중이에요'];
    }

    if (targetStatus === 'rejected') {
      return ['매장에 연결 중이에요', '예약 가능 여부를 확인하고 있어요'];
    }

    return ['매장에 연결 중이에요', '예약 가능 여부를 확인하고 있어요', '통화 내용을 정리하고 있어요'];
  }, [targetStatus]);
  const activeStatus = useMemo(
    () => statusMessages[Math.min(statusIndex, statusMessages.length - 1)],
    [statusIndex, statusMessages],
  );

  useEffect(() => {
    const timers: Array<ReturnType<typeof setTimeout>> = [];

    for (let index = 1; index < statusMessages.length; index += 1) {
      timers.push(setTimeout(() => setStatusIndex(index), 1400 * index));
    }

    timers.push(setTimeout(() => onComplete(), 1400 * statusMessages.length));

    const dots = setInterval(() => {
      setDotCount((current) => (current >= 3 ? 1 : current + 1));
    }, 500);

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      clearInterval(dots);
    };
  }, [onComplete, statusMessages.length]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const floatingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -13,
          duration: 1020,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 1020,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    floatingAnimation.start();

    return () => {
      floatingAnimation.stop();
      floatY.stopAnimation();
    };
  }, [floatY]);

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.22,
            duration: 1700,
            easing: Easing.out(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 0.9,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 0.06,
            duration: 1700,
            easing: Easing.out(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.22,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
      pulseScale.stopAnimation();
      pulseOpacity.stopAnimation();
    };
  }, [pulseOpacity, pulseScale]);

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>AI 예약 진행 중</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.callVisualWrap}>
            <View style={styles.glowLarge} />
            <View style={styles.glowSmall} />
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  opacity: pulseOpacity,
                  transform: [{ scale: pulseScale }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.callIconWrap,
                {
                  transform: [{ translateY: floatY }],
                },
              ]}
            >
              <CallIcon width={132} height={132} color="#FF0000" />
            </Animated.View>
          </View>
          <Text style={styles.statusLabel}>
            {activeStatus}
            {'.'.repeat(dotCount)}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF8F7',
  },
  screen: {
    flex: 1,
    backgroundColor: '#FFF8F7',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    color: '#111111',
  },
  headerSpacer: {
    width: 24,
    height: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 72,
  },
  callVisualWrap: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  glowLarge: {
    position: 'absolute',
    width: 206,
    height: 206,
    borderRadius: 103,
    backgroundColor: 'rgba(255, 83, 72, 0.08)',
  },
  glowSmall: {
    position: 'absolute',
    width: 156,
    height: 156,
    borderRadius: 78,
    backgroundColor: 'rgba(255, 83, 72, 0.12)',
  },
  pulseRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1.5,
    borderColor: '#FFB6AF',
  },
  callIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusLabel: {
    marginTop: 6,
    fontSize: 20,
    lineHeight: 27,
    fontWeight: '700',
    color: '#222222',
    textAlign: 'center',
  },
});
