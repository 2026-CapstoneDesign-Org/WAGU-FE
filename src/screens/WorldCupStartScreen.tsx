import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';
import { WorldCupCategory } from '../types/worldCup';
import { WORLD_CUP_CATEGORY_LABELS } from '../utils/worldCup';

type WorldCupStartScreenProps = {
  category: WorldCupCategory;
  onBack: () => void;
  onChangeCategory: (category: WorldCupCategory) => void;
  onConfirm: () => void;
};

const CATEGORY_ORDER: WorldCupCategory[] = ['all', 'korean', 'night', 'dessert'];

export function WorldCupStartScreen({
  category,
  onBack,
  onChangeCategory,
  onConfirm,
}: WorldCupStartScreenProps) {
  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <ArrowLeftIcon height={24} width={24} />
          </Pressable>
          <Text style={styles.headerTitle}>메뉴 월드컵</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.centerWrap}>
          <View style={styles.card}>
            <Text style={styles.eyebrow}>WORLD CUP</Text>
            <Text style={styles.title}>더 끌리는 메뉴를 골라보세요</Text>
            <Text style={styles.description}>원하는 주제를 먼저 고른 뒤 8강 토너먼트를 시작합니다.</Text>

            <View style={styles.categoryWrap}>
              {CATEGORY_ORDER.map((item) => {
                const isActive = item === category;

                return (
                  <Pressable
                    key={item}
                    onPress={() => onChangeCategory(item)}
                    style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                  >
                    <Text
                      style={[
                        styles.categoryChipLabel,
                        isActive && styles.categoryChipLabelActive,
                      ]}
                    >
                      {WORLD_CUP_CATEGORY_LABELS[item]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaTitle}>진행 방식</Text>
              <Text style={styles.metaValue}>8강 토너먼트</Text>
            </View>

            <Pressable onPress={onConfirm} style={styles.confirmButton}>
              <Text style={styles.confirmButtonLabel}>월드컵 시작</Text>
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
  card: {
    width: '100%',
    borderRadius: 28,
    backgroundColor: '#111111',
    paddingHorizontal: 24,
    paddingVertical: 28,
    gap: 20,
  },
  eyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#FFB4AB',
    letterSpacing: 1,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
    color: '#D9D9D9',
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    minHeight: 42,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#454545',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
  },
  categoryChipActive: {
    borderColor: '#FF3B30',
    backgroundColor: '#FF3B30',
  },
  categoryChipLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  categoryChipLabelActive: {
    color: '#FFFFFF',
  },
  metaRow: {
    borderRadius: 20,
    backgroundColor: '#1B1B1B',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 6,
  },
  metaTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#8B8B8B',
  },
  metaValue: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
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
