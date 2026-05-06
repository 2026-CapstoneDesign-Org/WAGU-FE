import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';
import { RatingStars } from '../components/RatingStars';
import { Restaurant } from '../data/restaurants';

const ratingLabels = ['맛', '서비스', '가성비'] as const;
type RatingLabel = (typeof ratingLabels)[number];

type RestaurantRatings = Record<string, Record<RatingLabel, number>>;

type TasteRatingScreenProps = {
  listName?: string;
  restaurants: Restaurant[];
  onBack: () => void;
  onSubmit: (ratings: RestaurantRatings) => void;
};

function createInitialRatings(items: Restaurant[]): RestaurantRatings {
  return items.reduce<RestaurantRatings>((acc, restaurant) => {
    acc[restaurant.id] = {
      맛: 0,
      서비스: 0,
      가성비: 0,
    };

    return acc;
  }, {});
}

export function TasteRatingScreen({
  listName,
  restaurants,
  onBack,
  onSubmit,
}: TasteRatingScreenProps) {
  const [ratings, setRatings] = useState<RestaurantRatings>(() =>
    createInitialRatings(restaurants),
  );

  const visibleRestaurants = useMemo(
    () => (restaurants.length > 0 ? restaurants : []),
    [restaurants],
  );

  const trimmedListName = listName?.trim() ?? '';

  const updateRating = (
    restaurantId: string,
    category: RatingLabel,
    value: number,
  ) => {
    setRatings((current) => ({
      ...current,
      [restaurantId]: {
        ...current[restaurantId],
        [category]: value,
      },
    }));
  };

  const isEveryRestaurantRated =
    visibleRestaurants.length > 0 &&
    visibleRestaurants.every((restaurant) =>
      ratingLabels.every((label) => (ratings[restaurant.id]?.[label] ?? 0) > 0),
    );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable hitSlop={10} onPress={onBack} style={styles.backButton}>
            <ArrowLeftIcon width={24} height={24} />
          </Pressable>
          {trimmedListName ? (
            <Text style={styles.headerTitle}>
              <Text style={styles.headerTitleStrong}>{trimmedListName}</Text>
              {' 리스트의 맛집을 평가해주세요.'}
            </Text>
          ) : (
            <Text style={styles.headerTitle}>나만의 맛집 점수를 완성해주세요.</Text>
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {visibleRestaurants.map((restaurant) => (
            <View key={restaurant.id} style={styles.restaurantBlock}>
              <View style={styles.restaurantHeader}>
                <View style={styles.thumbnail}>
                  {restaurant.imageUri ? (
                    <Image
                      source={{ uri: restaurant.imageUri }}
                      style={styles.thumbnailImage}
                    />
                  ) : (
                    <View style={styles.thumbnailFallback} />
                  )}
                </View>

                <View style={styles.restaurantCopy}>
                  <Text style={styles.restaurantName}>{restaurant.shortName}</Text>
                  <Text style={styles.restaurantCategory}>{restaurant.category}</Text>
                </View>
              </View>

              <View style={styles.ratingGroup}>
                {ratingLabels.map((label) => (
                  <View key={label} style={styles.ratingSection}>
                    <Text style={styles.ratingLabel}>{label}</Text>
                    <RatingStars
                      value={ratings[restaurant.id]?.[label] ?? 0}
                      onChange={(value) => updateRating(restaurant.id, label, value)}
                    />
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.bottomBar}>
          <Pressable
            onPress={() => onSubmit(ratings)}
            disabled={!isEveryRestaurantRated}
            style={[
              styles.confirmButton,
              !isEveryRestaurantRated && styles.confirmButtonDisabled,
            ]}
          >
            <Text style={styles.confirmLabel}>순서 확정하기</Text>
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
    flex: 1,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '500',
    color: '#000000',
  },
  headerTitleStrong: {
    fontWeight: '700',
  },
  scrollContent: {
    paddingTop: 25,
    paddingBottom: 110,
    gap: 25,
  },
  restaurantBlock: {
    gap: 15,
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
  confirmButton: {
    height: 46,
    borderRadius: 25,
    backgroundColor: '#FF1A12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#FFB6B2',
  },
  confirmLabel: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
