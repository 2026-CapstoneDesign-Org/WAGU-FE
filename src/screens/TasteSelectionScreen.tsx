import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';
import {
  ApiRestaurant,
  getRestaurantPhotoUris,
  getRestaurantPrimaryImageUri,
  getRestaurant,
  getRestaurantRankings,
  searchRestaurants,
} from '../api/wagu';
import SearchIcon from '../../assets/icons/search.svg';
import { Restaurant, restaurants } from '../data/restaurants';

const { width: screenWidth } = Dimensions.get('window');
const CARD_GAP = 6;
const CARD_WIDTH = (screenWidth - 32 - CARD_GAP) / 2;
const CARD_HEIGHT = Math.round(CARD_WIDTH * 1.24);
const DEFAULT_REMOTE_LIMIT = 40;
const DEFAULT_VISIBLE_COUNT = 20;
const MAX_SEARCH_RESULTS = 30;

const pickRandomItems = <T,>(items: T[], count: number) => {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled.slice(0, count);
};

const FALLBACK_RESTAURANTS = pickRandomItems(
  restaurants,
  Math.min(DEFAULT_VISIBLE_COUNT, restaurants.length),
);

type TasteSelectionScreenProps = {
  accessToken?: string | null;
  onBack: () => void;
  onConfirm: (restaurants: Restaurant[]) => void;
};

export function TasteSelectionScreen({
  accessToken,
  onBack,
  onConfirm,
}: TasteSelectionScreenProps) {
  const [query, setQuery] = useState('');
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);
  const [displayRestaurants, setDisplayRestaurants] = useState<Restaurant[]>(FALLBACK_RESTAURANTS);
  const [defaultRemoteRestaurants, setDefaultRemoteRestaurants] =
    useState<Restaurant[]>(FALLBACK_RESTAURANTS);
  const [restaurantCatalog, setRestaurantCatalog] = useState<Record<string, Restaurant>>(
    Object.fromEntries(FALLBACK_RESTAURANTS.map((restaurant) => [restaurant.id, restaurant])),
  );
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);
  const [hasScrolledAwayFromTop, setHasScrolledAwayFromTop] = useState(false);
  const searchAnimation = useRef(new Animated.Value(1)).current;
  const lastOffsetRef = useRef(0);
  const isDraggingRef = useRef(false);
  const searchVisibleRef = useRef(true);
  const baseRestaurants =
    defaultRemoteRestaurants.length > 0 ? defaultRemoteRestaurants : FALLBACK_RESTAURANTS;

  const matchLocalRestaurant = (restaurant: Pick<Restaurant, 'id' | 'name' | 'shortName'>) =>
    restaurants.find(
      (item) =>
        item.id === restaurant.id ||
        item.name === restaurant.name ||
        item.shortName === restaurant.name ||
        item.name === restaurant.shortName ||
        item.shortName === restaurant.shortName,
    );

  const mapApiRestaurantToCard = (restaurant: ApiRestaurant): Restaurant => {
    const fallbackRestaurant = matchLocalRestaurant({
      id: String(restaurant.id),
      name: restaurant.name,
      shortName: restaurant.name,
    });
    const remotePhotoUris = getRestaurantPhotoUris(restaurant);

    return {
      id: String(restaurant.id),
      name: restaurant.name,
      shortName: restaurant.name,
      category: restaurant.categories?.[0] ?? restaurant.regionName,
      imageUri:
        getRestaurantPrimaryImageUri(restaurant) ??
        fallbackRestaurant?.imageUri ??
        fallbackRestaurant?.photoUris?.[0],
      photoUris: remotePhotoUris.length ? remotePhotoUris : fallbackRestaurant?.photoUris,
      address: restaurant.address || fallbackRestaurant?.address,
    };
  };

  const matchesQuery = (restaurant: Restaurant, normalizedQuery: string) =>
    restaurant.name.includes(normalizedQuery) ||
    restaurant.shortName.includes(normalizedQuery) ||
    restaurant.address?.includes(normalizedQuery);

  const sortByRelevance = (items: Restaurant[], normalizedQuery: string) =>
    [...items].sort((left, right) => {
      const leftExact = left.name === normalizedQuery || left.shortName === normalizedQuery;
      const rightExact = right.name === normalizedQuery || right.shortName === normalizedQuery;

      if (leftExact !== rightExact) {
        return leftExact ? -1 : 1;
      }

      const leftStarts = left.name.startsWith(normalizedQuery) || left.shortName.startsWith(normalizedQuery);
      const rightStarts =
        right.name.startsWith(normalizedQuery) || right.shortName.startsWith(normalizedQuery);

      if (leftStarts !== rightStarts) {
        return leftStarts ? -1 : 1;
      }

      return left.name.localeCompare(right.name, 'ko');
    });

  const filteredRestaurants = useMemo(() => {
    if (accessToken) {
      if (displayRestaurants.length > 0) {
        return displayRestaurants;
      }

      return query.trim() ? [] : baseRestaurants;
    }

    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return FALLBACK_RESTAURANTS;
    }

    return FALLBACK_RESTAURANTS.filter((restaurant) => restaurant.name.includes(normalizedQuery));
  }, [accessToken, baseRestaurants, displayRestaurants, query]);

  const mergeRestaurantsIntoCatalog = (items: Restaurant[]) => {
    setRestaurantCatalog((current) => {
      const next = { ...current };

      items.forEach((restaurant) => {
        next[restaurant.id] = restaurant;
      });

      return next;
    });
  };

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    let cancelled = false;

    const loadInitialRestaurants = async () => {
      try {
        const rankingResponse = await getRestaurantRankings(accessToken, {
          regionName: '용인',
          limit: DEFAULT_REMOTE_LIMIT,
        });

        const details = await Promise.all(
          rankingResponse.items
            .slice(0, DEFAULT_REMOTE_LIMIT)
            .map((item) => getRestaurant(accessToken, item.restaurantId)),
        );

        if (cancelled) {
          return;
        }

        const mappedRestaurants = pickRandomItems(
          details.map(mapApiRestaurantToCard),
          DEFAULT_VISIBLE_COUNT,
        );
        const nextRestaurants =
          mappedRestaurants.length > 0 ? mappedRestaurants : FALLBACK_RESTAURANTS;

        setDefaultRemoteRestaurants(nextRestaurants);
        setDisplayRestaurants(nextRestaurants);
        mergeRestaurantsIntoCatalog(nextRestaurants);
      } catch {
        if (!cancelled) {
          setDefaultRemoteRestaurants(FALLBACK_RESTAURANTS);
          setDisplayRestaurants(FALLBACK_RESTAURANTS);
          mergeRestaurantsIntoCatalog(FALLBACK_RESTAURANTS);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingRestaurants(false);
        }
      }
    };

    void loadInitialRestaurants();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      setDisplayRestaurants(baseRestaurants);
      return;
    }

    let cancelled = false;

    const timeout = setTimeout(() => {
      const loadSearchResults = async () => {
        try {
          const results = await searchRestaurants(accessToken, normalizedQuery);

          if (cancelled) {
            return;
          }

          const apiMatches = results.map(mapApiRestaurantToCard);
          const fallbackMatches = [
            ...defaultRemoteRestaurants,
            ...Object.values(restaurantCatalog),
            ...restaurants,
          ].filter((restaurant) => matchesQuery(restaurant, normalizedQuery));
          const dedupedRestaurants = new Map<string, Restaurant>();

          [...apiMatches, ...fallbackMatches].forEach((restaurant) => {
            dedupedRestaurants.set(restaurant.id, restaurant);
          });

          const mappedRestaurants = sortByRelevance(
            Array.from(dedupedRestaurants.values()),
            normalizedQuery,
          ).slice(0, MAX_SEARCH_RESULTS);

          setDisplayRestaurants(mappedRestaurants);
          mergeRestaurantsIntoCatalog(mappedRestaurants);
        } catch {
          if (!cancelled) {
            const fallbackMatches = sortByRelevance(
              [...defaultRemoteRestaurants, ...restaurants].filter((restaurant) =>
                matchesQuery(restaurant, normalizedQuery),
              ),
              normalizedQuery,
            );

            setDisplayRestaurants(fallbackMatches);
            mergeRestaurantsIntoCatalog(fallbackMatches);
          }
        } finally {
          if (!cancelled) {
            setIsLoadingRestaurants(false);
          }
        }
      };

      void loadSearchResults();
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [accessToken, baseRestaurants, defaultRemoteRestaurants, query]);

  const toggleRestaurant = (restaurantId: string) => {
    setSelectedRestaurants((current) =>
      current.includes(restaurantId)
        ? current.filter((restaurant) => restaurant !== restaurantId)
        : [...current, restaurantId]
    );
  };

  const setSearchVisible = (visible: boolean) => {
    if (searchVisibleRef.current === visible) {
      return;
    }

    searchVisibleRef.current = visible;
    Animated.timing(searchAnimation, {
      toValue: visible ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  const handleScroll = (offsetY: number) => {
    if (!isDraggingRef.current) {
      lastOffsetRef.current = offsetY;
      return;
    }

    const delta = offsetY - lastOffsetRef.current;
    lastOffsetRef.current = offsetY;
    setHasScrolledAwayFromTop(offsetY > 8);

    if (offsetY <= 8) {
      setSearchVisible(true);
      return;
    }

    if (delta > 6) {
      setSearchVisible(false);
      return;
    }

    if (delta < -2) {
      setSearchVisible(true);
    }
  };

  const searchContainerStyle = {
    height: searchAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 46],
    }),
    opacity: searchAnimation,
    marginTop: searchAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 25],
    }),
    marginBottom: searchAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [12, hasScrolledAwayFromTop ? 10 : 0],
    }),
    transform: [
      {
        translateY: searchAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [-18, 0],
        }),
      },
    ],
  } as const;

  const confirmSelection = () => {
    if (selectedRestaurants.length < 5) {
      return;
    }

    const chosenRestaurants = accessToken
      ? selectedRestaurants
          .map((restaurantId) => restaurantCatalog[restaurantId])
          .filter((restaurant): restaurant is Restaurant => Boolean(restaurant))
      : restaurants.filter((restaurant) => selectedRestaurants.includes(restaurant.id));

    onConfirm(chosenRestaurants);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable hitSlop={10} onPress={onBack} style={styles.backButton}>
            <ArrowLeftIcon width={24} height={24} />
          </Pressable>
          <Text style={styles.headerTitle}>나만의 맛집을 골라주세요.</Text>
        </View>

        <Animated.View style={[styles.searchWrapper, searchContainerStyle]}>
          <View style={styles.searchBar}>
            <SearchIcon width={24} height={24} color="#FF1A12" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="찾으시는 맛집을 검색해 보세요"
              placeholderTextColor="#D9D9D9"
              style={styles.searchInput}
            />
          </View>
        </Animated.View>

        <Animated.ScrollView
          contentContainerStyle={styles.scrollContent}
          onMomentumScrollEnd={() => {
            isDraggingRef.current = false;
          }}
          onScrollBeginDrag={() => {
            isDraggingRef.current = true;
          }}
          onScrollEndDrag={() => {
            isDraggingRef.current = false;
          }}
          onScroll={({ nativeEvent }) => handleScroll(nativeEvent.contentOffset.y)}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          {isLoadingRestaurants ? (
            <View style={styles.loadingBanner}>
              <ActivityIndicator size="small" color="#FF1A12" />
              <Text style={styles.loadingLabel}>가게 정보를 불러오는 중이에요.</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {filteredRestaurants.map((restaurant) => {
                const selected = selectedRestaurants.includes(restaurant.id);

                return (
                  <Pressable
                    key={restaurant.id}
                    onPress={() => toggleRestaurant(restaurant.id)}
                    style={[styles.card, selected && styles.cardSelected]}
                  >
                    {restaurant.imageUri ? (
                      <Image
                        source={{ uri: restaurant.imageUri }}
                        style={styles.cardImage}
                        resizeMode="cover"
                      />
                    ) : null}
                    <View style={styles.cardOverlay}>
                      <Text style={styles.cardLabel}>{restaurant.name}</Text>
                      <Text ellipsizeMode="tail" numberOfLines={1} style={styles.cardAddress}>
                        {restaurant.address ?? ''}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </Animated.ScrollView>

        <View style={styles.bottomBar}>
          <Pressable
            onPress={confirmSelection}
            disabled={selectedRestaurants.length < 5}
            style={[
              styles.confirmButton,
              selectedRestaurants.length < 5 && styles.confirmButtonDisabled,
            ]}
          >
            <Text style={styles.confirmLabel}>{`결정(${selectedRestaurants.length})`}</Text>
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
  searchWrapper: {
    overflow: 'hidden',
  },
  searchBar: {
    height: 46,
    borderWidth: 1,
    borderColor: '#FF1A12',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    color: '#1A1A1A',
    paddingVertical: 0,
  },
  scrollContent: {
    paddingTop: 18,
    paddingBottom: 110,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-start',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 5,
    backgroundColor: '#D9D9D9',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
  },
  cardSelected: {
    borderColor: '#FF1A12',
    borderWidth: 3,
    shadowColor: '#FF1A12',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 6,
  },
  cardOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  cardLabel: {
    fontSize: 17,
    lineHeight: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardAddress: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.92)',
  },
  loadingState: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingBanner: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
    flexDirection: 'row',
  },
  loadingLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: '#666666',
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
