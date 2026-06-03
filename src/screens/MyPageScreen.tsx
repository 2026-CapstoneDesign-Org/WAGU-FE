import { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import FollowIcon from '../../assets/icons/follow.svg';
import HeartIcon from '../../assets/icons/heart.svg';
import ListIcon from '../../assets/icons/list.svg';
import ReviewIcon from '../../assets/icons/review.svg';
import SettingIcon from '../../assets/icons/setting.svg';
import { AppTab, BottomTabBar, TAB_BAR_HEIGHT } from '../components/BottomTabBar';
import { ReliabilityBadge } from '../components/ReliabilityBadge';
import { MyList } from '../data/myLists';
import { restaurants as allRestaurants } from '../data/restaurants';

const { width: screenWidth } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const CARD_GAP = 6;
const CARD_WIDTH = (screenWidth - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

export type MyPageScrollState = {
  verticalY: number;
};

const quickMenus = [
  { id: 'list', label: '리스트', type: 'list' as const },
  { id: 'review', label: '리뷰', type: 'review' as const },
  { id: 'friend', label: '밥친구', type: 'follow' as const },
  { id: 'settings', label: '설정', type: 'setting' as const },
];

type MyPageScreenProps = {
  followerCount?: number;
  honorPeriod?: string;
  honorTitle?: string;
  initialScrollState?: MyPageScrollState;
  nickname?: string;
  myLists: MyList[];
  onOpenReliabilityGuide?: () => void;
  onOpenMyFollowers?: () => void;
  onOpenMyFriends?: () => void;
  onOpenMyLists?: () => void;
  onOpenRepresentativeList?: (listId: string) => void;
  onOpenRestaurantDetail?: (restaurantName: string) => void;
  onOpenMyReviews?: () => void;
  onToggleRepresentativeLike?: (listId: string) => Promise<void> | void;
  onScrollStateChange?: (state: Partial<MyPageScrollState>) => void;
  onOpenSettings: () => void;
  onSelectTab: (tab: AppTab) => void;
  representativeLikeCount?: number;
  representativeIsLikePending?: boolean;
  representativeIsLiked?: boolean;
  reliabilityGrade?: string;
  restoreAnimated?: boolean;
  restoreScrollKey?: number;
  reviewCount?: number;
};

function QuickMenuIcon({ type }: { type: (typeof quickMenus)[number]['type'] }) {
  if (type === 'list') {
    return <ListIcon width={35} height={35} color="#000000" />;
  }

  if (type === 'review') {
    return <ReviewIcon width={35} height={35} color="#000000" />;
  }

  if (type === 'follow') {
    return <FollowIcon width={35} height={35} color="#000000" />;
  }

  return <SettingIcon width={35} height={35} color="#000000" />;
}

export function MyPageScreen({
  followerCount = 0,
  honorPeriod,
  honorTitle,
  initialScrollState,
  nickname = '먹부림',
  myLists,
  onOpenReliabilityGuide,
  onOpenMyFollowers,
  onOpenMyFriends,
  onOpenMyLists,
  onOpenRepresentativeList,
  onOpenRestaurantDetail,
  onOpenMyReviews,
  onToggleRepresentativeLike,
  onScrollStateChange,
  onOpenSettings,
  onSelectTab,
  representativeLikeCount,
  representativeIsLikePending = false,
  representativeIsLiked = false,
  reliabilityGrade,
  restoreAnimated = false,
  restoreScrollKey = 0,
  reviewCount = 0,
}: MyPageScreenProps) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const contentBottomPadding = 40 + TAB_BAR_HEIGHT + insets.bottom;

  const representativeList = useMemo(
    () => myLists.find((item) => item.isRepresentative) ?? myLists[0],
    [myLists],
  );

  const restaurantMetaMap = useMemo(
    () =>
      new Map(
        allRestaurants.map((restaurant) => [
          restaurant.id,
          {
            imageUri: restaurant.photoUris?.[0] ?? restaurant.imageUri ?? null,
            address: restaurant.address ?? '',
          },
        ]),
      ),
    [],
  );

  const representativeCards = representativeList?.restaurants ?? [];
  const visibleCards = representativeCards.slice(0, visibleCount);
  const hasMoreCards = visibleCount < representativeCards.length;
  const hasReliability = Boolean(reliabilityGrade);

  useEffect(() => {
    setVisibleCount(10);
  }, [representativeList?.id]);

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        x: 0,
        y: initialScrollState?.verticalY ?? 0,
        animated: restoreAnimated,
      });
    });
  }, [restoreAnimated, restoreScrollKey]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.container, { paddingBottom: contentBottomPadding }]}
          onScroll={(event) =>
            onScrollStateChange?.({ verticalY: event.nativeEvent.contentOffset.y })
          }
          scrollEventThrottle={16}
        >
          <View style={styles.profileSection}>
            <View style={styles.profileHeader}>
              <View style={styles.nicknameRow}>
                <Text style={styles.nickname}>{nickname}님</Text>
                {hasReliability ? (
                  <Pressable
                    hitSlop={8}
                    onPress={onOpenReliabilityGuide}
                    disabled={!onOpenReliabilityGuide}
                  >
                    <ReliabilityBadge grade={reliabilityGrade} height={28} />
                  </Pressable>
                ) : null}
              </View>
              <View style={styles.metricsRow}>
                <Pressable style={styles.metricPressable} hitSlop={8} onPress={onOpenMyReviews}>
                  <View style={styles.metricGroup}>
                    <Text style={styles.metricLabel}>리뷰</Text>
                    <Text style={styles.metricValue}>{reviewCount.toLocaleString()}</Text>
                  </View>
                </Pressable>
                <Pressable style={styles.metricPressable} hitSlop={8} onPress={onOpenMyFollowers}>
                  <View style={styles.metricGroup}>
                    <Text style={styles.metricLabel}>팔로워</Text>
                    <Text style={styles.metricValue}>{followerCount.toLocaleString()}</Text>
                  </View>
                </Pressable>
              </View>
            </View>

            <View style={styles.quickMenuRow}>
              {quickMenus.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.quickMenuItem}
                  onPress={
                    item.id === 'list'
                      ? onOpenMyLists
                      : item.id === 'settings'
                        ? onOpenSettings
                        : item.id === 'review'
                          ? onOpenMyReviews
                          : item.id === 'friend'
                            ? onOpenMyFriends
                            : undefined
                  }
                >
                  <View style={styles.quickMenuIconWrap}>
                    <QuickMenuIcon type={item.type} />
                  </View>
                  <Text style={styles.quickMenuLabel}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.mainListSection}>
            <Pressable
              style={styles.sectionHeader}
              onPress={() => {
                if (representativeList && onOpenRepresentativeList) {
                  onOpenRepresentativeList(representativeList.id);
                  return;
                }

                onOpenMyLists?.();
              }}
              disabled={!representativeList && !onOpenMyLists}
            >
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>
                  {representativeList?.title ?? '대표 리스트'}
                </Text>
                {representativeList ? (
                  <View style={styles.representativeBadge}>
                    <Text style={styles.representativeBadgeLabel}>대표</Text>
                  </View>
                ) : null}
              </View>
              {representativeList && representativeLikeCount !== undefined ? (
                <Pressable
                  disabled={!onToggleRepresentativeLike || representativeIsLikePending}
                  hitSlop={8}
                  onPress={() => {
                    if (!representativeList) {
                      return;
                    }

                    void onToggleRepresentativeLike?.(representativeList.id);
                  }}
                  style={[
                    styles.likeButton,
                    representativeIsLiked && styles.likeButtonActive,
                    representativeIsLikePending && styles.likeButtonPending,
                  ]}
                >
                  <HeartIcon
                    color={representativeIsLiked ? '#FF6B6B' : '#7A7A7A'}
                    width={14}
                    height={14}
                  />
                  <Text
                    style={[
                      styles.likeCountLabel,
                      representativeIsLiked && styles.likeCountLabelActive,
                    ]}
                  >
                    {representativeLikeCount}
                  </Text>
                </Pressable>
              ) : null}
            </Pressable>

            <View style={styles.cardGrid}>
              {visibleCards.map((item, index) => (
                <Pressable
                  key={item.id}
                  style={styles.card}
                  onPress={() => onOpenRestaurantDetail?.(item.name)}
                >
                  {item.imageUri || restaurantMetaMap.get(item.id)?.imageUri ? (
                    <Image
                      source={{
                        uri: item.imageUri || restaurantMetaMap.get(item.id)?.imageUri || undefined,
                      }}
                      style={styles.cardImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.cardImage} />
                  )}
                  <View style={styles.cardOverlay} />
                  <View style={styles.cardTextBlock}>
                    <Text style={styles.cardTitle}>{`${index + 1}. ${item.name}`}</Text>
                    <Text numberOfLines={1} ellipsizeMode="tail" style={styles.cardAddress}>
                      {restaurantMetaMap.get(item.id)?.address || item.address}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>

            {hasMoreCards ? (
              <Pressable
                style={styles.moreButton}
                onPress={() =>
                  setVisibleCount((current) => Math.min(current + 10, representativeCards.length))
                }
              >
                  <Text style={styles.moreButtonLabel}>더보기</Text>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>

        <BottomTabBar
          activeTab="my"
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
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 25,
    gap: 35,
  },
  profileSection: {
    gap: 30,
  },
  profileHeader: {
    gap: 8,
  },
  nicknameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nickname: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '800',
    color: '#000000',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  metricGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metricPressable: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  metricLabel: {
    fontSize: 15,
    lineHeight: 21.5,
    fontWeight: '500',
    color: '#000000',
  },
  metricValue: {
    fontSize: 15,
    lineHeight: 22.5,
    fontWeight: '600',
    color: '#000000',
  },
  quickMenuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  quickMenuItem: {
    width: 50,
    alignItems: 'center',
    gap: 5,
  },
  quickMenuIconWrap: {
    width: 35,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickMenuLabel: {
    width: 50,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 22,
    fontWeight: '700',
    color: '#000000',
  },
  mainListSection: {
    gap: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '600',
    color: '#000000',
    flexShrink: 1,
  },
  likeButton: {
    minWidth: 64,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    flexShrink: 0,
  },
  likeButtonActive: {
    backgroundColor: '#FFF1F0',
    borderColor: '#FFC9C5',
  },
  likeButtonPending: {
    opacity: 0.5,
  },
  likeCountLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: '#7A7A7A',
  },
  likeCountLabelActive: {
    color: '#FF6B6B',
  },
  representativeBadge: {
    minWidth: 37,
    height: 21,
    borderRadius: 10.5,
    backgroundColor: '#FCE3E1',
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  representativeBadgeLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#FF3B30',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    height: 224,
    borderRadius: 5,
    backgroundColor: '#D9D9D9',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#D9D9D9',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  cardTextBlock: {
    gap: 2,
  },
  cardTitle: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardAddress: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.92)',
  },
  moreButton: {
    width: '100%',
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  moreButtonLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: '#000000',
  },
});


