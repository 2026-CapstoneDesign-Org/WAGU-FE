import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';
import { SNAIL_RACE_MAX_RACERS, SNAIL_RACE_MIN_RACERS } from '../utils/snailRace';

type SnailRaceStartScreenProps = {
  initialCount: number;
  onBack: () => void;
  onChangeCount: (count: number) => void;
  onConfirm: (count: number) => void;
};

export function SnailRaceStartScreen({
  initialCount,
  onBack,
  onChangeCount,
  onConfirm,
}: SnailRaceStartScreenProps) {
  const decreaseCount = () => {
    onChangeCount(Math.max(SNAIL_RACE_MIN_RACERS, initialCount - 1));
  };

  const increaseCount = () => {
    onChangeCount(Math.min(SNAIL_RACE_MAX_RACERS, initialCount + 1));
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <ArrowLeftIcon width={24} height={24} />
          </Pressable>
          <Text style={styles.headerTitle}>달팽이 레이스</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.centerWrap}>
          <View style={styles.countCard}>
            <Text style={styles.cardEyebrow}>SNAIL RACE</Text>
            <Text style={styles.cardTitle}>달팽이 수를 정해주세요</Text>
            <View style={styles.counterRow}>
              <Pressable style={styles.counterButton} onPress={decreaseCount}>
                <Text style={styles.counterButtonLabel}>-</Text>
              </Pressable>
              <View style={styles.countValueWrap}>
                <Text style={styles.countValue}>{initialCount}</Text>
                <Text style={styles.countUnit}>마리</Text>
              </View>
              <Pressable style={styles.counterButton} onPress={increaseCount}>
                <Text style={styles.counterButtonLabel}>+</Text>
              </Pressable>
            </View>

            <Pressable style={styles.confirmButton} onPress={() => onConfirm(initialCount)}>
              <Text style={styles.confirmButtonLabel}>레이스 시작</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF9F5',
  },
  screen: {
    flex: 1,
    backgroundColor: '#FFF9F5',
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
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countCard: {
    width: '100%',
    borderRadius: 28,
    backgroundColor: '#111111',
    paddingHorizontal: 24,
    paddingVertical: 28,
    gap: 20,
  },
  cardEyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#FFB4AB',
    letterSpacing: 1,
  },
  cardTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counterButton: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonLabel: {
    fontSize: 32,
    lineHeight: 34,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  countValueWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  countValue: {
    fontSize: 58,
    lineHeight: 62,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  countUnit: {
    paddingBottom: 8,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  confirmButton: {
    minHeight: 58,
    borderRadius: 20,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonLabel: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
