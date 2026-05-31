import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
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
import { MOCK_DATA_ENABLED } from '../config/mockData';
import { localRankingEntries, nationalRankingEntries, RankingEntry } from '../data/rankings';

const { width: screenWidth } = Dimensions.get('window');
const bannerWidth = screenWidth - 32;
const rankingPageWidth = bannerWidth;
const profileCardWidth = 161;
const profileCardGap = 6;

export type HomeScrollState = {
  bannerLoopIndex: number;
  influencersX: number;
  localRankingX: number;
  mealFriendsX: number;
  nationalRankingX: number;
  verticalY: number;
};

type BannerItem = {
  id: string;
  subtitle: string;
  title: string;
  type: 'default' | 'ladder' | 'snail' | 'worldcup';
};

const banners: BannerItem[] = [
  {
    id: 'banner-1',
    title: '사다리타기',
    subtitle: '누가 걸릴지 빠르게 정해보세요',
    type: 'ladder',
  },
  {
    id: 'banner-2',
    title: '업데이트 예정',
    subtitle: '다음 프로모션이 곧 공개돼요',
    type: 'default',
  },
  {
    id: 'banner-3',
    title: '업데이트 예정',
    subtitle: 'WAGU의 새로운 기능을 준비 중이에요',
    type: 'default',
  },
  {
    id: 'banner-4',
    title: '업데이트 예정',
    subtitle: '다음 배너 자리에 새 소식이 들어와요',
    type: 'default',
  },
];

const displayBanners: BannerItem[] = [
  banners[0],
  {
    id: 'banner-snail-race',
    title: '달팽이 레이스',
    subtitle: '누가 먼저 도착할지 랜덤으로 겨뤄보세요',
    type: 'snail',
  },
  ...banners.slice(2),
];

const loopedBanners = [
  displayBanners[displayBanners.length - 1],
  ...displayBanners,
  displayBanners[0],
];

const gameDisplayBanners: BannerItem[] = [
  ...displayBanners.slice(0, 2),
  {
    id: 'banner-worldcup',
    title: '메뉴 월드컵',
    subtitle: '더 끌리는 메뉴를 골라 오늘의 우승 메뉴를 정해보세요',
    type: 'worldcup',
  },
  ...displayBanners.slice(2),
];

const gameLoopedBanners = [
  gameDisplayBanners[gameDisplayBanners.length - 1],
  ...gameDisplayBanners,
  gameDisplayBanners[0],
];

const influencers = [
  { id: 'following-1', name: '라면러버', meta: '리뷰 · 42' },
  { id: 'follower-4', name: 'Junn', meta: '리뷰 · 2911' },
  { id: 'following-2', name: '맛집탐험가', meta: '리뷰 · 128' },
  { id: 'following-4', name: '대치동맛도리', meta: '리뷰 · 1542' },
  { id: 'following-3', name: '분식왕', meta: '리뷰 · 91' },
];

const mealFriends = [
  { id: 'follower-1', name: '가래떡살인마', meta: '리뷰 · 911' },
  { id: 'follower-2', name: '배가고파요', meta: '리뷰 · 221' },
  { id: 'follower-5', name: '지윤', meta: '리뷰 · 992' },
  { id: 'follower-6', name: '은소금', meta: '리뷰 · 115' },
  { id: 'follower-7', name: '역북동라멘살인마', meta: '리뷰 · 632' },
];

export type HomeProfileCardItem = {
  id: string;
  imageUri?: string;
  meta?: string;
  name: string;
};

export type HomeRestaurantCardItem = {
  id: string;
  imageUri?: string;
  name: string;
  restaurantName: string;
};

type RankingSectionProps = {
  accentTitle?: string;
  initialScrollX?: number;
  items: RankingEntry[];
  onScrollPositionChange?: (x: number) => void;
  onPressItem?: (restaurantName: string) => void;
  onPressMore?: () => void;
  restoreScrollKey?: number;
  title: string;
};

type HorizontalProfileSectionProps = {
  initialScrollX?: number;
  items: HomeProfileCardItem[];
  onPressItem?: (userId: string) => void;
  onScrollPositionChange?: (x: number) => void;
  restoreScrollKey?: number;
  title: string;
};

type MainHomeScreenProps = {
  featuredRestaurantItems?: HomeRestaurantCardItem[];
  initialScrollState?: HomeScrollState;
  localRankingItems?: RankingEntry[];
  mealFriendItems?: HomeProfileCardItem[];
  nationalRankingItems?: RankingEntry[];
  hasUnreadNews?: boolean;
  onOpenUserProfile?: (userId: string) => void;
  onOpenRestaurantDetail?: (restaurantName: string) => void;
  onPressAi?: () => void;
  onPressLadderGame?: () => void;
  onPressSnailRace?: () => void;
  onPressWorldCup?: () => void;
  onPressNews?: () => void;
  onPressLocalRanking?: () => void;
  onPressNationalRanking?: () => void;
  onPressSearch?: () => void;
  onScrollStateChange?: (state: Partial<HomeScrollState>) => void;
  onSelectTab: (tab: AppTab) => void;
  restoreAnimated?: boolean;
  restoreScrollKey?: number;
};

function RankingSection({
  accentTitle,
  initialScrollX = 0,
  items,
  onScrollPositionChange,
  onPressItem,
  onPressMore,
  restoreScrollKey = 0,
  title,
}: RankingSectionProps) {
  const scrollRef = useRef<ScrollView | null>(null);
  const pages = useMemo(() => {
    const chunks: RankingEntry[][] = [];

    for (let index = 0; index < items.length; index += 4) {
      chunks.push(items.slice(index, index + 4));
    }

    return chunks;
  }, [items]);

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ x: initialScrollX, animated: false });
    });
  }, [restoreScrollKey]);

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
          ref={scrollRef}
          horizontal
          decelerationRate="fast"
          snapToInterval={rankingPageWidth}
          snapToAlignment="start"
          disableIntervalMomentum
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rankScrollContent}
          onScroll={(event) => onScrollPositionChange?.(event.nativeEvent.contentOffset.x)}
          scrollEventThrottle={16}
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
                        <Image
                          source={{ uri: item.imageUri }}
                          style={styles.thumbnailImage}
                          resizeMode="cover"
                        />
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

function HorizontalProfileSection({
  initialScrollX = 0,
  items,
  onPressItem,
  onScrollPositionChange,
  restoreScrollKey = 0,
  title,
}: HorizontalProfileSectionProps) {
  const scrollRef = useRef<ScrollView | null>(null);

  if (title.includes('WAGU')) {
    return null;
  }

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ x: initialScrollX, animated: false });
    });
  }, [restoreScrollKey]);

  if (items.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.emptySectionCard}>
          <Text style={styles.emptySectionText}>
            조금 더 활동하면 WAGU 인플루언서를 추천해드릴게요.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <View style={styles.profileCarousel}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.profileScrollContent}
          onScroll={(event) => onScrollPositionChange?.(event.nativeEvent.contentOffset.x)}
          scrollEventThrottle={16}
        >
          {items.map((item) => (
            <Pressable
              key={item.id}
              style={styles.profileCard}
              onPress={() => onPressItem?.(item.id)}
            >
              {item.imageUri ? (
                <Image
                  source={{ uri: item.imageUri }}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.profileImage} />
              )}
              <View style={styles.profileCopy}>
                <Text style={styles.profileName}>{item.name}</Text>
                {item.meta ? <Text style={styles.profileMeta}>{item.meta}</Text> : null}
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

function HorizontalRestaurantSection({
  initialScrollX = 0,
  items,
  onPressItem,
  onScrollPositionChange,
  restoreScrollKey = 0,
  title,
}: {
  initialScrollX?: number;
  items: HomeRestaurantCardItem[];
  onPressItem?: (restaurantName: string) => void;
  onScrollPositionChange?: (x: number) => void;
  restoreScrollKey?: number;
  title: string;
}) {
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ x: initialScrollX, animated: false });
    });
  }, [restoreScrollKey]);

  if (items.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.emptySectionCard}>
          <Text style={styles.emptySectionText}>
            조금 더 활동하면 취향에 맞는 맛집을 추천해드릴게요.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <View style={styles.profileCarousel}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.profileScrollContent}
          onScroll={(event) => onScrollPositionChange?.(event.nativeEvent.contentOffset.x)}
          scrollEventThrottle={16}
        >
          {items.map((item) => (
            <Pressable
              key={item.id}
              style={styles.profileCard}
              onPress={() => onPressItem?.(item.restaurantName)}
            >
              {item.imageUri ? (
                <Image
                  source={{ uri: item.imageUri }}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.profileImage} />
              )}
              <View style={styles.profileCopy}>
                <Text style={styles.profileName}>{item.name}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

export function MainHomeScreen({
  featuredRestaurantItems,
  hasUnreadNews = false,
  initialScrollState,
  localRankingItems,
  mealFriendItems,
  nationalRankingItems,
  onOpenUserProfile,
  onOpenRestaurantDetail,
  onPressNews,
  onPressLadderGame,
  onPressSnailRace,
  onPressWorldCup,
  onPressLocalRanking,
  onPressNationalRanking,
  onPressSearch,
  onScrollStateChange,
  onSelectTab,
  restoreAnimated = false,
  restoreScrollKey = 0,
}: MainHomeScreenProps) {
  const insets = useSafeAreaInsets();
  const [activeBanner, setActiveBanner] = useState(0);
  const bannerScrollRef = useRef<ScrollView | null>(null);
  const contentScrollRef = useRef<ScrollView | null>(null);
  const loopIndexRef = useRef(initialScrollState?.bannerLoopIndex ?? 1);
  const autoSlideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indicatorPosition = useRef(new Animated.Value(1)).current;

  const featuredRestaurants = featuredRestaurantItems ?? [];
  const localRanking = (localRankingItems ?? localRankingEntries).slice(0, 20);
  const mealFriendProfiles = mealFriendItems ?? (MOCK_DATA_ENABLED ? mealFriends : []);
  const nationalRanking = (nationalRankingItems ?? nationalRankingEntries).slice(0, 20);

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
      bannerScrollRef.current?.scrollTo({ x: nextLoopIndex * bannerWidth, animated: true });
    }, 5000);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const initialBannerLoopIndex = initialScrollState?.bannerLoopIndex ?? 1;
      loopIndexRef.current = initialBannerLoopIndex;
      setActiveBanner(Math.max(0, initialBannerLoopIndex - 1));
      indicatorPosition.setValue(initialBannerLoopIndex);
      bannerScrollRef.current?.scrollTo({
        x: initialBannerLoopIndex * bannerWidth,
        animated: false,
      });
      scheduleNextAutoSlide();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      clearAutoSlideTimer();
    };
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      contentScrollRef.current?.scrollTo({
        x: 0,
        y: initialScrollState?.verticalY ?? 0,
        animated: restoreAnimated,
      });
      bannerScrollRef.current?.scrollTo({
        x: (initialScrollState?.bannerLoopIndex ?? 1) * bannerWidth,
        animated: false,
      });
    });
  }, [restoreAnimated, restoreScrollKey]);

  const dots = useMemo(
    () =>
      gameDisplayBanners.map((banner, index) => ({ id: banner.id, active: index === activeBanner })),
    [activeBanner]
  );

  const contentBottomPadding = 126 + TAB_BAR_HEIGHT + insets.bottom;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          ref={contentScrollRef}
          contentContainerStyle={[styles.container, { paddingBottom: contentBottomPadding }]}
          showsVerticalScrollIndicator={false}
          onScroll={(event) =>
            onScrollStateChange?.({ verticalY: event.nativeEvent.contentOffset.y })
          }
          scrollEventThrottle={16}
        >
          <View style={styles.header}>
            <Text style={styles.logo}>WAGU</Text>

            <View style={styles.headerIcons}>
              <Pressable style={styles.iconButton} onPress={onPressNews}>
                <HeartIcon width={24} height={24} color="#000000" />
                {hasUnreadNews ? <View style={styles.newsBadgeDot} /> : null}
              </Pressable>
              <Pressable style={styles.iconButton} onPress={onPressSearch}>
                <SearchIcon width={24} height={24} color="#000000" />
              </Pressable>
            </View>
          </View>

          <View style={styles.bannerSection}>
            <ScrollView
              ref={bannerScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const rawIndex = Math.round(event.nativeEvent.contentOffset.x / bannerWidth);
                let nextLoopIndex = rawIndex;

                if (rawIndex === 0) {
                  nextLoopIndex = gameDisplayBanners.length;
                  bannerScrollRef.current?.scrollTo({
                    x: nextLoopIndex * bannerWidth,
                    animated: false,
                  });
                } else if (rawIndex === gameLoopedBanners.length - 1) {
                  nextLoopIndex = 1;
                  bannerScrollRef.current?.scrollTo({
                    x: nextLoopIndex * bannerWidth,
                    animated: false,
                  });
                }

                loopIndexRef.current = nextLoopIndex;
                setActiveBanner(nextLoopIndex - 1);
                onScrollStateChange?.({ bannerLoopIndex: nextLoopIndex });
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
              {gameLoopedBanners.map((banner, index) => {
                const isLadderBanner = banner.type === 'ladder';
                const isSnailBanner = banner.type === 'snail';
                const isWorldCupBanner = banner.type === 'worldcup';
                const isGameBanner = isLadderBanner || isSnailBanner || isWorldCupBanner;

                return (
                  <Pressable
                    key={`${banner.id}-${index}`}
                    style={[
                      styles.bannerFallback,
                      isGameBanner ? styles.bannerLadderCard : styles.bannerDefaultCard,
                    ]}
                    disabled={
                      (!isLadderBanner && !isSnailBanner && !isWorldCupBanner) ||
                      (isLadderBanner && !onPressLadderGame) ||
                      (isSnailBanner && !onPressSnailRace) ||
                      (isWorldCupBanner && !onPressWorldCup)
                    }
                    onPress={
                      isLadderBanner
                        ? onPressLadderGame
                        : isSnailBanner
                          ? onPressSnailRace
                          : isWorldCupBanner
                            ? onPressWorldCup
                          : undefined
                    }
                  >
                    <Text
                      style={[
                        styles.bannerTitle,
                        isGameBanner ? styles.bannerLadderTitle : styles.bannerDefaultTitle,
                      ]}
                    >
                      {banner.title}
                    </Text>
                    <Text
                      style={[
                        styles.bannerSubtitle,
                        isGameBanner
                          ? styles.bannerLadderSubtitle
                          : styles.bannerDefaultSubtitle,
                      ]}
                    >
                      {banner.subtitle}
                    </Text>
                    {isGameBanner ? (
                      <View style={styles.bannerLadderBadge}>
                        <Text style={styles.bannerLadderBadgeLabel}>PLAY</Text>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
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
                          inputRange: [1, gameDisplayBanners.length],
                          outputRange: [0, (gameDisplayBanners.length - 1) * 12],
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
              initialScrollX={initialScrollState?.localRankingX ?? 0}
              items={localRanking}
              onScrollPositionChange={(x) => onScrollStateChange?.({ localRankingX: x })}
              onPressItem={onOpenRestaurantDetail}
              onPressMore={onPressLocalRanking}
              restoreScrollKey={restoreScrollKey}
            />
            <RankingSection
              title="전국 맛집 순위"
              initialScrollX={initialScrollState?.nationalRankingX ?? 0}
              items={nationalRanking}
              onScrollPositionChange={(x) => onScrollStateChange?.({ nationalRankingX: x })}
              onPressItem={onOpenRestaurantDetail}
              onPressMore={onPressNationalRanking}
              restoreScrollKey={restoreScrollKey}
            />
            <HorizontalRestaurantSection
              title="이런 맛집은 어떠세요?"
              initialScrollX={initialScrollState?.influencersX ?? 0}
              items={featuredRestaurants}
              onPressItem={onOpenRestaurantDetail}
              onScrollPositionChange={(x) => onScrollStateChange?.({ influencersX: x })}
              restoreScrollKey={restoreScrollKey}
            />
            <HorizontalProfileSection
              title="WAGU 인플루언서"
              initialScrollX={initialScrollState?.influencersX ?? 0}
              items={MOCK_DATA_ENABLED ? influencers : []}
              onPressItem={onOpenUserProfile}
              onScrollPositionChange={(x) => onScrollStateChange?.({ influencersX: x })}
              restoreScrollKey={restoreScrollKey}
            />
            <HorizontalProfileSection
              title="나랑 비슷한 밥친구"
              initialScrollX={initialScrollState?.mealFriendsX ?? 0}
              items={mealFriendProfiles}
              onPressItem={onOpenUserProfile}
              onScrollPositionChange={(x) => onScrollStateChange?.({ mealFriendsX: x })}
              restoreScrollKey={restoreScrollKey}
            />
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
    position: 'relative',
  },
  newsBadgeDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#FF3B30',
  },
  banner: {
    aspectRatio: 3 / 2,
    width: bannerWidth,
    borderRadius: 8,
  },
  bannerFallback: {
    aspectRatio: 3 / 2,
    width: bannerWidth,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'flex-end',
  },
  bannerLadderCard: {
    backgroundColor: '#111111',
  },
  bannerDefaultCard: {
    backgroundColor: '#D9D9D9',
  },
  bannerTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
  },
  bannerSubtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  bannerLadderTitle: {
    color: '#FFFFFF',
  },
  bannerDefaultTitle: {
    color: '#222222',
  },
  bannerLadderSubtitle: {
    color: '#E0E0E0',
  },
  bannerDefaultSubtitle: {
    color: '#555555',
  },
  bannerLadderBadge: {
    alignSelf: 'flex-start',
    marginTop: 14,
    minHeight: 28,
    borderRadius: 14,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  bannerLadderBadgeLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
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
  emptySectionCard: {
    borderRadius: 10,
    backgroundColor: '#F4F4F4',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  emptySectionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#8A8A8A',
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
