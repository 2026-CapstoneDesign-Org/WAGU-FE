import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';
import { AiReservationDraft } from '../types/aiReservation';

type AiReservationPendingScreenProps = {
  draft: AiReservationDraft;
  onBack: () => void;
  onComplete: () => void;
};

const STATUS_MESSAGES = [
  '매장에 연결 중이에요',
  '예약 가능 여부를 확인하고 있어요',
  '통화 내용을 정리하고 있어요',
];

export function AiReservationPendingScreen({
  draft: _draft,
  onBack,
  onComplete,
}: AiReservationPendingScreenProps) {
  const [statusIndex, setStatusIndex] = useState(0);
  const [dotCount, setDotCount] = useState(1);
  const activeStatus = useMemo(
    () => STATUS_MESSAGES[Math.min(statusIndex, STATUS_MESSAGES.length - 1)],
    [statusIndex],
  );

  useEffect(() => {
    const first = setTimeout(() => setStatusIndex(1), 1400);
    const second = setTimeout(() => setStatusIndex(2), 2800);
    const done = setTimeout(() => onComplete(), 4200);
    const dots = setInterval(() => {
      setDotCount((current) => (current >= 3 ? 1 : current + 1));
    }, 500);

    return () => {
      clearTimeout(first);
      clearTimeout(second);
      clearTimeout(done);
      clearInterval(dots);
    };
  }, [onComplete]);

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <ArrowLeftIcon width={24} height={24} />
          </Pressable>
          <Text style={styles.headerTitle}>AI 예약 진행 중</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.callOrb}>
            <View style={styles.callOrbInner}>
              <Text style={styles.callOrbLabel}>CALL</Text>
            </View>
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
  backButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  callOrb: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  callOrbInner: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callOrbLabel: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.2,
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
