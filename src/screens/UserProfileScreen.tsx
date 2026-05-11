import { useMemo } from 'react';
import { Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';
import { restaurants as allRestaurants } from '../data/restaurants';
import { UserProfile } from '../data/userProfiles';

const { width: screenWidth } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const CARD_GAP = 6;
const CARD_WIDTH = (screenWidth - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

type UserProfileScreenProps = {
  onBack: () => void;
  onOpenFollowers?: () => void;
  onOpenRestaurantDetail?: (restaurantName: string) => void;
  onOpenReviews?: () => void;
  profile: UserProfile;
};

export function UserProfileScreen({
  onBack,
  onOpenFollowers,
  onOpenRestaurantDetail,
  onOpenReviews,
  profile,
}: UserProfileScreenProps) {
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

  const hasMetrics = Boolean(profile.temperature || profile.reviewCount || profile.followerCount);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <Pressable hitSlop={10} onPress={onBack} style={styles.backButton}>
              <ArrowLeftIcon height={24} width={24} />
            </Pressable>
          </View>

          <View style={styles.profileSection}>
            <Text style={styles.nickname}>{profile.nickname}</Text>
            {hasMetrics ? (
              <View style={styles.metricsRow}>
                {profile.temperature ? (
                  <View style={styles.metricGroup}>
                    <Text style={styles.metricLabel}>매너온도</Text>
                    <Text style={styles.temperatureValue}>{profile.temperature}</Text>
                  </View>
                ) : null}
                {profile.reviewCount ? (
                  <Pressable hitSlop={8} onPress={onOpenReviews} style={styles.metricPressable}>
                    <View style={styles.metricGroup}>
                      <Text style={styles.metricLabel}>리뷰</Text>
                      <Text style={styles.metricValue}>{profile.reviewCount}</Text>
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
              <Text style={styles.sectionTitle}>{profile.representativeListTitle}</Text>
              <View style={styles.representativeBadge}>
                <Text style={styles.representativeBadgeLabel}>대표</Text>
              </View>
            </View>

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
  container: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 25,
    paddingBottom: 40,
    gap: 35,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileSection: {
    gap: 5,
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
  temperatureValue: {
    fontSize: 15,
    lineHeight: 22.5,
    fontWeight: '600',
    color: '#FF0000',
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
    gap: 8,
    alignSelf: 'flex-start',
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '600',
    color: '#000000',
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
});
