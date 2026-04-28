import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import HeartIcon from '../../assets/icons/heart.svg';
import SearchIcon from '../../assets/icons/search.svg';
import { AppTab, BottomTabBar, TAB_BAR_HEIGHT } from '../components/BottomTabBar';
import { localRankingEntries, nationalRankingEntries, RankingEntry } from '../data/rankings';

const { width: screenWidth } = Dimensions.get('window');
const bannerWidth = screenWidth - 32;
const rankingPageWidth = bannerWidth;
const profileCardWidth = 161;
const profileCardGap = 6;

const BANNER_IMAGE_URI = 'https://www.figma.com/api/mcp/asset/2de98fcd-d6e0-422a-b114-493bb26abbc4';

const banners = [
  { id: 'banner-1', imageUri: BANNER_IMAGE_URI },
  { id: 'banner-2', imageUri: BANNER_IMAGE_URI },
  { id: 'banner-3', imageUri: BANNER_IMAGE_URI },
  { id: 'banner-4', imageUri: BANNER_IMAGE_URI },
];

const loopedBanners = [banners[banners.length - 1], ...banners, banners[0]];

const influencers = [
  { id: 'influencer-1', name: '용인맛집러', meta: '리뷰 · 46' },
  { id: 'influencer-2', name: 'Junn', meta: '리뷰 · 128' },
  { id: 'influencer-3', name: '용산루피', meta: '리뷰 · 72' },
  { id: 'influencer-4', name: '맛도리헌터', meta: '리뷰 · 55' },
  { id: 'influencer-5', name: '오늘뭐먹지', meta: '리뷰 · 91' },
];

const mealFriends = [
  { id: 'friend-1', name: '먹바리언니', meta: '리뷰 · 92' },
  { id: 'friend-2', name: '국밥수집가', meta: '리뷰 · 88' },
  { id: 'friend-3', name: '파스타좋아', meta: '리뷰 · 84' },
  { id: 'friend-4', name: '진미탐험', meta: '리뷰 · 81' },
  { id: 'friend-5', name: '주말미식가', meta: '리뷰 · 79' },
];

type RankingSectionProps = {
  accentTitle?: string;
  items: RankingEntry[];
  onPressItem?: (restaurantName: string) => void;
  onPressMore?: () => void;
  title: string;
};

type HorizontalProfileSectionProps = {
  items: { id: string; name: string; meta: string }[];
  title: string;
};

type MainHomeScreenProps = {
  onOpenRestaurantDetail?: (restaurantName: string) => void;
  onPressAi?: () => void;
  onPressNews?: () => void;
  onPressLocalRanking?: () => void;
  onPressNationalRanking?: () => void;
  onPressSearch?: () => void;
  onSelectTab: (tab: AppTab) => void;
};

function RankingSection({
  accentTitle,
  items,
  onPressItem,
  onPressMore,
  title,
}: RankingSectionProps) {
  const pages = useMemo(() => {
    const chunks: RankingEntry[][] = [];

    for (let index = 0; index < items.length; index += 4) {
      chunks.push(items.slice(index, index + 4));
    }

    return chunks;
  }, [items]);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {accentTitle ? <Text style={styles.sectionAccent}>{accentTitle}</Text> : null}
          {title}
        </Text>
        <Pressable style={styles.moreButton} onPress={onPressMore}>
          <Text style={styles.moreLabel}>전체 순위</Text>
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
                    <View style={styles.thumbnail} />
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

function HorizontalProfileSection({ items, title }: HorizontalProfileSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <View style={styles.profileCarousel}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.profileScrollContent}
        >
          {items.map((item) => (
            <Pressable key={item.id} style={styles.profileCard}>
              <View style={styles.profileImage} />
              <View style={styles.profileCopy}>
                <Text style={styles.profileName}>{item.name}</Text>
                <Text style={styles.profileMeta}>{item.meta}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

export function MainHomeScreen({
  onOpenRestaurantDetail,
  onPressAi,
  onPressNews,
  onPressLocalRanking,
  onPressNationalRanking,
  onPressSearch,
  onSelectTab,
}: MainHomeScreenProps) {
  const insets = useSafeAreaInsets();
  const [activeBanner, setActiveBanner] = useState(0);
  const scrollRef = useRef<ScrollView | null>(null);
  const loopIndexRef = useRef(1);
  const autoSlideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indicatorPosition = useRef(new Animated.Value(1)).current;

  const localRanking = localRankingEntries.slice(0, 20);
  const nationalRanking = nationalRankingEntries.slice(0, 20);

  const clearAutoSlideTimer = () => {
    if (!autoSlideTimerRef.current) {
      return;
    }

    clearTimeout(autoSlideTimerRef.current);
    autoSlideTimerRef.current = null;
  };

  const scheduleNextAutoSlide = () => {
    clearAutoSlideTimer();
    autoSlideTimerRef.current = setTimeout(() => {
      const nextLoopIndex = loopIndexRef.current + 1;
      scrollRef.current?.scrollTo({ x: nextLoopIndex * bannerWidth, animated: true });
    }, 5000);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollRef.current?.scrollTo({ x: bannerWidth, animated: false });
      scheduleNextAutoSlide();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      clearAutoSlideTimer();
    };
  }, []);

  const dots = useMemo(
    () => banners.map((banner, index) => ({ id: banner.id, active: index === activeBanner })),
    [activeBanner]
  );

  const contentBottomPadding = 126 + TAB_BAR_HEIGHT + insets.bottom;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={[styles.container, { paddingBottom: contentBottomPadding }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.logo}>WAGU</Text>

            <View style={styles.headerIcons}>
              <Pressable style={styles.aiButton} onPress={onPressAi}>
                <Text style={styles.aiLabel}>AI</Text>
              </Pressable>
              <Pressable style={styles.iconButton} onPress={onPressSearch}>
                <SearchIcon width={24} height={24} color="#000000" />
              </Pressable>
              <Pressable style={styles.iconButton} onPress={onPressNews}>
                <HeartIcon width={24} height={24} />
              </Pressable>
            </View>
          </View>

          <View style={styles.bannerSection}>
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const rawIndex = Math.round(event.nativeEvent.contentOffset.x / bannerWidth);
                let nextLoopIndex = rawIndex;

                if (rawIndex === 0) {
                  nextLoopIndex = banners.length;
                  scrollRef.current?.scrollTo({
                    x: nextLoopIndex * bannerWidth,
                    animated: false,
                  });
                } else if (rawIndex === loopedBanners.length - 1) {
                  nextLoopIndex = 1;
                  scrollRef.current?.scrollTo({
                    x: nextLoopIndex * bannerWidth,
                    animated: false,
                  });
                }

                loopIndexRef.current = nextLoopIndex;
                setActiveBanner(nextLoopIndex - 1);
                Animated.spring(indicatorPosition, {
                  toValue: nextLoopIndex,
                  damping: 14,
                  stiffness: 180,
                  mass: 0.7,
                  useNativeDriver: true,
                }).start();
                scheduleNextAutoSlide();
              }}
            >
              {loopedBanners.map((banner, index) => (
                <Image
                  key={`${banner.id}-${index}`}
                  source={{ uri: banner.imageUri }}
                  style={styles.banner}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>

            <View style={styles.dots}>
              {dots.map((dot, index) => (
                <View
                  key={dot.id}
                  style={[styles.dotTrack, index === activeBanner && styles.dotTrackHidden]}
                />
              ))}
              <Animated.View
                style={[
                  styles.dotDroplet,
                  {
                    transform: [
                      {
                        translateX: indicatorPosition.interpolate({
                          inputRange: [1, banners.length],
                          outputRange: [0, (banners.length - 1) * 12],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.sectionsGroup}>
            <RankingSection
              accentTitle="용인"
              title=" 맛집 순위"
              items={localRanking}
              onPressItem={onOpenRestaurantDetail}
              onPressMore={onPressLocalRanking}
            />
            <RankingSection
              title="전국 맛집 순위"
              items={nationalRanking}
              onPressItem={onOpenRestaurantDetail}
              onPressMore={onPressNationalRanking}
            />
            <HorizontalProfileSection title="WAGU 인플루언서" items={influencers} />
            <HorizontalProfileSection title="나랑 비슷한 밥친구" items={mealFriends} />
          </View>
        </ScrollView>

        <BottomTabBar
          activeTab="home"
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
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 30,
  },
  sectionsGroup: {
    gap: 45,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerSection: {
    marginTop: -8,
  },
  logo: {
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '800',
    color: '#D20000',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  aiButton: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiLabel: {
    fontSize: 12,
    lineHeight: 22,
    fontWeight: '600',
    color: '#000000',
  },
  iconButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    width: bannerWidth,
    height: 215,
    borderRadius: 8,
  },
  dots: {
    position: 'absolute',
    bottom: 8,
    width: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
  },
  dotTrack: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#D9D9D9',
  },
  dotTrackHidden: {
    opacity: 0,
  },
  dotDroplet: {
    position: 'absolute',
    left: 0,
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#FF1A12',
  },
  section: {
    gap: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
    paddingHorizontal: 5,
  },
  moreLabel: {
    fontSize: 10,
    lineHeight: 22,
    fontWeight: '600',
    color: '#000000',
  },
  list: {
    gap: 15,
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
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  thumbnail: {
    width: 58,
    height: 58,
    borderRadius: 6,
    backgroundColor: '#D9D9D9',
  },
  itemCopy: {
    gap: 3,
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
  profileCarousel: {
    marginRight: -16,
  },
  profileScrollContent: {
    paddingRight: 16,
  },
  profileCard: {
    width: profileCardWidth,
    marginRight: profileCardGap,
  },
  profileImage: {
    width: profileCardWidth,
    height: profileCardWidth,
    borderRadius: 6,
    backgroundColor: '#D9D9D9',
  },
  profileCopy: {
    marginTop: 6,
    gap: 0.1,
  },
  profileName: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
    color: '#000000',
  },
  profileMeta: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    color: '#838383',
  },
});
