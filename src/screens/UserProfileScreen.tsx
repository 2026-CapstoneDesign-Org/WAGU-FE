import { useMemo, useState } from 'react';
import { Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';
import HeartIcon from '../../assets/icons/heart.svg';
import { restaurants as allRestaurants } from '../data/restaurants';
import { UserProfile } from '../data/userProfiles';

const { width: screenWidth } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const CARD_GAP = 6;
const CARD_WIDTH = (screenWidth - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

type UserProfileScreenProps = {
  isFollowLoading?: boolean;
  isFollowing?: boolean;
  isOwnProfile?: boolean;
  onBack: () => void;
  onOpenFollowing?: () => void;
  onFollowToggle?: (nextIsFollowing: boolean) => void;
  onOpenFollowers?: () => void;
  onOpenRestaurantDetail?: (restaurantName: string) => void;
  onReportUser?: (reason: string) => void;
  onOpenReviews?: () => void;
  onToggleRepresentativeLike?: (listId: string) => Promise<void> | void;
  profile: UserProfile;
  representativeLikeCount?: number;
  representativeIsLikePending?: boolean;
  representativeIsLiked?: boolean;
};

export function UserProfileScreen({
  isFollowLoading = false,
  isFollowing = false,
  isOwnProfile = false,
  onBack,
  onOpenFollowing,
  onFollowToggle,
  onOpenFollowers,
  onOpenRestaurantDetail,
  onReportUser,
  onOpenReviews,
  onToggleRepresentativeLike,
  profile,
  representativeLikeCount,
  representativeIsLikePending = false,
  representativeIsLiked = false,
}: UserProfileScreenProps) {
  const [isReportSheetOpen, setIsReportSheetOpen] = useState(false);
  const restaurantMetaMap = useMemo(
    () =>
      new Map(
        allRestaurants.map((restaurant) => [
          restaurant.id,
          {
            address: restaurant.address ?? '',
            imageUri: restaurant.photoUris?.[0] ?? restaurant.imageUri ?? null,
          },
        ]),
      ),
    [],
  );

  const hasMetrics = Boolean(profile.reviewCount || profile.followingCount || profile.followerCount);
  const hasReliability = Boolean(profile.reliabilityGrade);

  const handlePressMore = () => {
    if (!onReportUser) {
      return;
    }
    setIsReportSheetOpen(true);
  };

  const handleSelectReportReason = (reason: string) => {
    setIsReportSheetOpen(false);
    onReportUser?.(reason);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <Pressable hitSlop={10} onPress={onBack} style={styles.backButton}>
              <ArrowLeftIcon height={24} width={24} />
            </Pressable>
            {!isOwnProfile && onReportUser ? (
              <Pressable hitSlop={14} onPress={handlePressMore} style={styles.moreButton}>
                <View style={styles.moreDots}>
                  <View style={styles.moreDot} />
                  <View style={styles.moreDot} />
                  <View style={styles.moreDot} />
                </View>
              </Pressable>
            ) : (
              <View style={styles.moreButtonPlaceholder} />
            )}
          </View>

          <View style={styles.profileSection}>
            <View style={styles.profileHeader}>
              <View style={styles.headerMetaRow}>
                <View style={styles.nicknameRow}>
                  <Text style={styles.nickname}>{profile.nickname}</Text>
                  {hasReliability ? (
                    <View style={styles.reliabilityBadge}>
                      <Text style={styles.reliabilityBadgeLabel}>{profile.reliabilityGrade}</Text>
                    </View>
                  ) : null}
                </View>
                {!isOwnProfile && onFollowToggle ? (
                  <Pressable
                    disabled={isFollowLoading}
                    onPress={() => onFollowToggle(!isFollowing)}
                    style={[
                      styles.followButton,
                      isFollowing && styles.followingButton,
                      isFollowLoading && styles.disabledButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.followButtonLabel,
                        isFollowing && styles.followingButtonLabel,
                      ]}
                    >
                      {isFollowLoading ? '처리 중...' : isFollowing ? '팔로잉' : '팔로우'}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>

            {hasMetrics ? (
              <View style={styles.metricsRow}>
                {profile.reviewCount ? (
                  <Pressable hitSlop={8} onPress={onOpenReviews} style={styles.metricPressable}>
                    <View style={styles.metricGroup}>
                      <Text style={styles.metricLabel}>리뷰</Text>
                      <Text style={styles.metricValue}>{profile.reviewCount}</Text>
                    </View>
                  </Pressable>
                ) : null}
                {profile.followingCount ? (
                  <Pressable hitSlop={8} onPress={onOpenFollowing} style={styles.metricPressable}>
                    <View style={styles.metricGroup}>
                      <Text style={styles.metricLabel}>팔로잉</Text>
                      <Text style={styles.metricValue}>{profile.followingCount}</Text>
                    </View>
                  </Pressable>
                ) : null}
                {profile.followerCount ? (
                  <Pressable hitSlop={8} onPress={onOpenFollowers} style={styles.metricPressable}>
                    <View style={styles.metricGroup}>
                      <Text style={styles.metricLabel}>팔로워</Text>
                      <Text style={styles.metricValue}>{profile.followerCount}</Text>
                    </View>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>

          <View style={styles.mainListSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>{profile.representativeListTitle}</Text>
                <View style={styles.representativeBadge}>
                  <Text style={styles.representativeBadgeLabel}>대표</Text>
                </View>
              </View>
              {representativeLikeCount !== undefined && profile.representativeListId ? (
                <Pressable
                  disabled={!onToggleRepresentativeLike || representativeIsLikePending}
                  hitSlop={8}
                  onPress={() => void onToggleRepresentativeLike?.(profile.representativeListId!)}
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
            </View>

            {profile.representativeRestaurants.length > 0 ? (
              <View style={styles.cardGrid}>
                {profile.representativeRestaurants.map((item, index) => (
                  <Pressable
                    key={item.id}
                    onPress={() => onOpenRestaurantDetail?.(item.name)}
                    style={styles.card}
                  >
                    {restaurantMetaMap.get(item.id)?.imageUri ? (
                      <Image
                        resizeMode="cover"
                        source={{ uri: restaurantMetaMap.get(item.id)?.imageUri ?? undefined }}
                        style={styles.cardImage}
                      />
                    ) : (
                      <View style={styles.cardImage} />
                    )}
                    <View style={styles.cardOverlay} />
                    <View style={styles.cardTextBlock}>
                      <Text style={styles.cardTitle}>{`${index + 1}. ${item.name}`}</Text>
                      <Text ellipsizeMode="tail" numberOfLines={1} style={styles.cardAddress}>
                        {restaurantMetaMap.get(item.id)?.address || item.address}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyRepresentativeText}>
                대표 리스트가 아직 없어요.
              </Text>
            )}
          </View>
        </ScrollView>

        <Modal
          animationType="fade"
          transparent
          visible={isReportSheetOpen}
          onRequestClose={() => setIsReportSheetOpen(false)}
        >
          <View style={styles.reportSheetOverlay}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setIsReportSheetOpen(false)}
            />
            <View style={styles.reportSheet}>
              <Text style={styles.reportSheetTitle}>신고 사유를 선택해 주세요</Text>
              <Pressable
                onPress={() => handleSelectReportReason('스팸/광고')}
                style={styles.reportSheetItem}
              >
                <Text style={styles.reportSheetItemLabel}>스팸/광고</Text>
              </Pressable>
              <Pressable
                onPress={() => handleSelectReportReason('욕설/비방')}
                style={styles.reportSheetItem}
              >
                <Text style={styles.reportSheetItemLabel}>욕설/비방</Text>
              </Pressable>
              <Pressable
                onPress={() => handleSelectReportReason('허위 정보')}
                style={styles.reportSheetItem}
              >
                <Text style={styles.reportSheetItemLabel}>허위 정보</Text>
              </Pressable>
              <Pressable
                onPress={() => handleSelectReportReason('기타')}
                style={styles.reportSheetItem}
              >
                <Text style={[styles.reportSheetItemLabel, styles.reportSheetItemLabelDanger]}>
                  기타
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
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
    paddingBottom: 40,
    gap: 35,
  },
  headerRow: {
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
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  moreDots: {
    width: 16,
    height: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moreDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#7A7A7A',
  },
  reportSheetOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17, 17, 17, 0.28)',
  },
  reportSheet: {
    width: '84%',
    maxWidth: 340,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingTop: 24,
    paddingBottom: 18,
    paddingHorizontal: 20,
  },
  reportSheetTitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600',
    color: '#111111',
    textAlign: 'center',
    marginBottom: 14,
  },
  reportSheetItem: {
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EFEFEF',
  },
  reportSheetItemLabel: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    color: '#222222',
  },
  reportSheetItemLabelDanger: {
    color: '#F92A1D',
  },
  profileSection: {
    gap: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerMetaRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nicknameRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nickname: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '800',
    color: '#000000',
  },
  reliabilityBadge: {
    minHeight: 24,
    borderRadius: 12,
    backgroundColor: '#F3F3F3',
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reliabilityBadgeLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: '#111111',
  },
  followButton: {
    minWidth: 72,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF5C57',
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followingButton: {
    backgroundColor: '#F3F3F3',
  },
  disabledButton: {
    opacity: 0.55,
  },
  followButtonLabel: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  followingButtonLabel: {
    color: '#666666',
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
  mainListSection: {
    gap: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '600',
    color: '#000000',
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
  emptyRepresentativeText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: '#8A8A8A',
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
});


