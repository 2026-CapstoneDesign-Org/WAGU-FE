import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';
import { ReliabilityBadge } from '../components/ReliabilityBadge';
import { RELIABILITY_GRADE_INFOS } from '../utils/reliability';

type ReliabilityGuideScreenProps = {
  currentGrade?: string | null;
  onBack: () => void;
};

export function ReliabilityGuideScreen({
  currentGrade,
  onBack,
}: ReliabilityGuideScreenProps) {
  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <ArrowLeftIcon width={24} height={24} />
          </Pressable>
          <Text style={styles.headerTitle}>신뢰도 등급 안내</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.grid}>
            {RELIABILITY_GRADE_INFOS.map((gradeInfo) => {
              const isCurrent = currentGrade === gradeInfo.key;

              return (
                <View
                  key={gradeInfo.key}
                  style={[styles.card, isCurrent && styles.currentCard]}
                >
                  <View style={styles.cardTopRow}>
                    <ReliabilityBadge grade={gradeInfo.key} height={56} />
                    {isCurrent ? (
                      <View style={styles.currentChip}>
                        <Text style={styles.currentChipLabel}>현재 등급</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.gradeLabel}>{gradeInfo.key}</Text>
                  <Text style={styles.gradeDescription}>{gradeInfo.description}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 24,
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
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 28,
    gap: 18,
  },
  grid: {
    gap: 14,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 8,
  },
  currentCard: {
    borderColor: '#FFB0AA',
    backgroundColor: '#FFF6F5',
  },
  cardTopRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  currentChip: {
    minHeight: 30,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: '#FF0000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentChipLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  gradeLabel: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    color: '#111111',
  },
  gradeDescription: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
    color: '#555555',
  },
});
