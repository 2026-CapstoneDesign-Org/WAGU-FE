import { Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppTab, BottomTabBar, TAB_BAR_HEIGHT } from '../components/BottomTabBar';
import { localRankingEntries, nationalRankingEntries, RankingEntry } from '../data/rankings';

const { width: screenWidth } = Dimensions.get('window');
const rankingPageWidth = screenWidth - 32;

type RankingTabScreenProps = {
  onOpenRestaurantDetail?: (restaurantName: string) => void;
  onPressLocalRanking?: () => void;
  onPressNationalRanking?: () => void;
  onSelectTab: (tab: AppTab) => void;
};

type RankingPreviewSectionProps = {
  accentTitle?: string;
  items: RankingEntry[];
  onPressItem?: (restaurantName: string) => void;
  onPressMore?: () => void;
  title: string;
};

function RankingPreviewSection({
  accentTitle,
  items,
  onPressItem,
  onPressMore,
  title,
}: RankingPreviewSectionProps) {
  const pages: RankingEntry[][] = [];

  for (let index = 0; index < items.length; index += 4) {
    pages.push(items.slice(index, index + 4));
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {accentTitle ? <Text style={styles.sectionAccent}>{accentTitle}</Text> : null}
          {title}
        </Text>
        <Pressable style={styles.moreButton} onPress={onPressMore}>
          <Text style={styles.moreLabel}>전체 보기</Text>
        </Pressable>
      </View>

      <View style={styles.rankCarousel}>
        <ScrollView
          horizontal
          decelerationRate="fast"
          snapToInterval={rankingPageWidth}
          snapToAlignment="start"
          disableIntervalMomentum
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rankScrollContent}
        >
          {pages.map((page, pageIndex) => (
            <View key={`${title}-${pageIndex}`} style={styles.rankPage}>
              <View style={styles.list}>
                {page.map((item) => (
                  <Pressable
                    key={item.id}
                    style={styles.listItem}
                    onPress={() => onPressItem?.(item.name)}
                  >
                    <View style={styles.thumbnail}>
                      {item.imageUri ? (
                        <Image source={{ uri: item.imageUri }} style={styles.thumbnailImage} />
                      ) : (
                        <View style={styles.thumbnailFallback} />
                      )}
                    </View>
                    <View style={styles.itemCopy}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemMeta}>{item.meta}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

export function RankingTabScreen({
  onOpenRestaurantDetail,
  onPressLocalRanking,
  onPressNationalRanking,
  onSelectTab,
}: RankingTabScreenProps) {
  const insets = useSafeAreaInsets();
  const contentBottomPadding = 40 + TAB_BAR_HEIGHT + insets.bottom;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={[styles.container, { paddingBottom: contentBottomPadding }]}
          showsVerticalScrollIndicator={false}
        >
          <RankingPreviewSection
            accentTitle="용인"
            title=" 맛집 순위"
            items={localRankingEntries.slice(0, 20)}
            onPressItem={onOpenRestaurantDetail}
            onPressMore={onPressLocalRanking}
          />
          <RankingPreviewSection
            title="전국 맛집 순위"
            items={nationalRankingEntries.slice(0, 20)}
            onPressItem={onOpenRestaurantDetail}
            onPressMore={onPressNationalRanking}
          />
        </ScrollView>

        <BottomTabBar
          activeTab="ranking"
          onPressHome={() => onSelectTab('home')}
          onPressMap={() => onSelectTab('map')}
          onPressRanking={() => onSelectTab('ranking')}
          onPressMy={() => onSelectTab('my')}
        />
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
  container: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 22,
  },
  section: {
    gap: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '700',
    color: '#000000',
  },
  sectionAccent: {
    color: '#FF1A12',
  },
  moreButton: {
    height: 22,
    minWidth: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  moreLabel: {
    fontSize: 10,
    lineHeight: 22,
    fontWeight: '600',
    color: '#000000',
  },
  rankCarousel: {
    marginRight: -16,
  },
  rankScrollContent: {
    paddingRight: 16,
  },
  rankPage: {
    width: rankingPageWidth,
    paddingRight: 16,
  },
  list: {
    gap: 15,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  thumbnail: {
    width: 58,
    height: 58,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#D9D9D9',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailFallback: {
    flex: 1,
    backgroundColor: '#D9D9D9',
  },
  itemCopy: {
    gap: 3,
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    color: '#000000',
  },
  itemMeta: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '500',
    color: '#838383',
  },
});
