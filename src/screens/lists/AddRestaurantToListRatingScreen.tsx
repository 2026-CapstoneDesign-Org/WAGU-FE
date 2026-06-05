import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../../../assets/icons/arrow-left.svg';
import { RatingStars } from '../../components/RatingStars';
import type { MyList } from '../../data/myLists';
import type { Restaurant } from '../../data/restaurants';

type RatingCategory = 'taste' | 'service' | 'value';

type AddRestaurantRatings = Record<RatingCategory, number>;

type AddRestaurantToListRatingScreenProps = {
  restaurant: Restaurant;
  lists: MyList[];
  onBack: () => void;
  onSubmit: (ratings: AddRestaurantRatings) => void;
};

const ratingLabels: { key: RatingCategory; label: string }[] = [
  { key: 'taste', label: '맛' },
  { key: 'service', label: '서비스' },
  { key: 'value', label: '가성비' },
];

export function AddRestaurantToListRatingScreen({
  restaurant,
  lists,
  onBack,
  onSubmit,
}: AddRestaurantToListRatingScreenProps) {
  const [ratings, setRatings] = useState<AddRestaurantRatings>({
    taste: 0,
    service: 0,
    value: 0,
  });

  const isReady = useMemo(
    () => ratingLabels.every(({ key }) => ratings[key] > 0),
    [ratings],
  );

  const thumbnailUri = restaurant.photoUris?.[0] ?? restaurant.imageUri;

  const pageTitle =
    lists.length === 1
      ? `${lists[0]?.title ?? ''} 리스트에 추가할 맛집을 평가해 주세요`
      : `선택한 ${lists.length}개의 리스트에 추가할 맛집을 평가해 주세요`;

  const updateRating = (category: RatingCategory, value: number) => {
    setRatings((current) => ({
      ...current,
      [category]: value,
    }));
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable hitSlop={10} onPress={onBack} style={styles.backButton}>
            <ArrowLeftIcon width={24} height={24} />
          </Pressable>
          <Text style={styles.headerTitle}>리스트에 추가하기</Text>
        </View>

        <Text style={styles.pageTitle}>{pageTitle}</Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.restaurantHeader}>
            <View style={styles.thumbnail}>
              {thumbnailUri ? (
                <Image source={{ uri: thumbnailUri }} style={styles.thumbnailImage} />
              ) : (
                <View style={styles.thumbnailFallback} />
              )}
            </View>

            <View style={styles.restaurantCopy}>
              <Text style={styles.restaurantName}>{restaurant.shortName || restaurant.name}</Text>
              <Text style={styles.restaurantCategory}>{restaurant.category}</Text>
            </View>
          </View>

          <View style={styles.ratingGroup}>
            {ratingLabels.map(({ key, label }) => (
              <View key={key} style={styles.ratingSection}>
                <Text style={styles.ratingLabel}>{label}</Text>
                <RatingStars value={ratings[key]} onChange={(value) => updateRating(key, value)} />
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <Pressable
            disabled={!isReady}
            onPress={() => onSubmit(ratings)}
            style={[styles.completeButton, !isReady ? styles.completeButtonDisabled : null]}
          >
            <Text style={styles.completeButtonLabel}>완료</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 14,
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
    fontWeight: '500',
    color: '#000000',
  },
  pageTitle: {
    marginTop: 25,
    fontSize: 17,
    lineHeight: 25,
    fontWeight: '500',
    color: '#000000',
  },
  scrollContent: {
    paddingTop: 25,
    paddingBottom: 110,
    gap: 25,
  },
  restaurantHeader: {
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
  restaurantCopy: {
    gap: 3,
  },
  restaurantName: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '500',
    color: '#000000',
  },
  restaurantCategory: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '500',
    color: '#838383',
  },
  ratingGroup: {
    gap: 15,
    paddingBottom: 5,
  },
  ratingSection: {
    alignItems: 'center',
    gap: 10,
  },
  ratingLabel: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    color: '#000000',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 85,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 13,
  },
  completeButton: {
    height: 46,
    borderRadius: 25,
    backgroundColor: '#FF1A12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonDisabled: {
    backgroundColor: '#FFB6B2',
  },
  completeButtonLabel: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
