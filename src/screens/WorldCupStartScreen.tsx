import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';
import { WorldCupCategory } from '../types/worldCup';

type WorldCupStartScreenProps = {
  onBack: () => void;
  onSelectCategory: (category: Exclude<WorldCupCategory, 'all'>) => void;
};

type CategoryCard = {
  accent: string;
  category: Exclude<WorldCupCategory, 'all'>;
  eyebrow: string;
  title: string;
};

const CATEGORY_CARDS: CategoryCard[] = [
  {
    accent: '#FF7B54',
    category: 'korean',
    eyebrow: 'KOREAN',
    title: '한식',
  },
  {
    accent: '#6D5DF6',
    category: 'night',
    eyebrow: 'LATE NIGHT',
    title: '야식',
  },
  {
    accent: '#FF8FB1',
    category: 'dessert',
    eyebrow: 'DESSERT',
    title: '디저트',
  },
];

export function WorldCupStartScreen({
  onBack,
  onSelectCategory,
}: WorldCupStartScreenProps) {
  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <ArrowLeftIcon height={24} width={24} />
          </Pressable>
          <Text style={styles.headerTitle}>메뉴 월드컵</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.cardList}>
            {CATEGORY_CARDS.map((card) => (
              <Pressable
                key={card.category}
                onPress={() => onSelectCategory(card.category)}
                style={[styles.categoryCard, { borderColor: card.accent }]}
              >
                <View style={styles.cardCopy}>
                  <Text style={[styles.cardEyebrow, { color: card.accent }]}>{card.eyebrow}</Text>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                </View>

                <View style={styles.cardMeta}>
                  <View style={[styles.accentDot, { backgroundColor: card.accent }]} />
                  <Text style={styles.cardMetaLabel}>탭하면 바로 시작</Text>
                  <Text style={styles.cardMetaValue}>8강</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F1EA',
  },
  screen: {
    flex: 1,
    backgroundColor: '#F8F1EA',
    paddingTop: 24,
  },
  header: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    color: '#111111',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 28,
  },
  cardList: {
    gap: 14,
  },
  categoryCard: {
    minHeight: 164,
    borderRadius: 28,
    borderWidth: 2,
    backgroundColor: '#111111',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  cardCopy: {
    gap: 8,
    paddingRight: 24,
  },
  cardEyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  cardTitle: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accentDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  cardMetaLabel: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardMetaValue: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
