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
  profile: UserProfile;
  onBack: () => void;
  onOpenFollowers?: () => void;
  onOpenReviews?: () => void;
  onOpenRestaurantDetail?: (restaurantName: string) => void;
};

export function UserProfileScreen({
  profile,
  onBack,
  onOpenFollowers,
  onOpenReviews,
  onOpenRestaurantDetail,
}: UserProfileScreenProps) {
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

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
        >
          <View style={styles.headerRow}>
            <Pressable hitSlop={10} onPress={onBack} style={styles.backButton}>
              <ArrowLeftIcon width={24} height={24} />
            </Pressable>
          </View>

          <View style={styles.profileSection}>
            <Text style={styles.nickname}>{profile.nickname}</Text>
            <View style={styles.metricsRow}>
              <View style={styles.metricGroup}>
                <Text style={styles.metricLabel}>매너온도</Text>
                <Text style={styles.temperatureValue}>{profile.temperature}</Text>
              </View>
              <Pressable style={styles.metricPressable} hitSlop={8} onPress={onOpenReviews}>
                <View style={styles.metricGroup}>
                  <Text style={styles.metricLabel}>리뷰</Text>
                  <Text style={styles.metricValue}>{profile.reviewCount}</Text>
                </View>
              </Pressable>
              <Pressable style={styles.metricPressable} hitSlop={8} onPress={onOpenFollowers}>
                <View style={styles.metricGroup}>
                  <Text style={styles.metricLabel}>팔로워</Text>
                  <Text style={styles.metricValue}>{profile.followerCount}</Text>
                </View>
              </Pressable>
            </View>
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
                  style={styles.card}
                  onPress={() => onOpenRestaurantDetail?.(item.name)}
                >
                  {restaurantMetaMap.get(item.id)?.imageUri ? (
                    <Image
                      source={{ uri: restaurantMetaMap.get(item.id)?.imageUri ?? undefined }}
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
