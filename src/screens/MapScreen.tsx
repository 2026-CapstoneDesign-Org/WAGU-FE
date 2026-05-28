import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  NaverMapMarkerOverlay,
  NaverMapView,
  type NaverMapViewRef,
} from '@mj-studio/react-native-naver-map';

import FilterIcon from '../../assets/icons/filter.svg';
import MyLocationIcon from '../../assets/icons/mylocation.svg';
import SearchIcon from '../../assets/icons/search.svg';
import StarIcon from '../../assets/icons/star.svg';
import {
  type ApiHiddenGemRestaurantItem,
  getHiddenGemRestaurants,
  getRestaurant,
  getRestaurantPhotoUris,
  searchRestaurants,
} from '../api/wagu';
import { AppTab, BottomTabBar, TAB_BAR_HEIGHT } from '../components/BottomTabBar';
import { Restaurant } from '../data/restaurants';

const { height: screenHeight } = Dimensions.get('window');

const HIDDEN_GEM_FILTER = '숨은 맛집';
const HIDDEN_GEM_REGION_NAME = '용인시 처인구';
const HIDDEN_GEM_FALLBACK_TOWNS = [
  '역북동',
  '김량장동',
  '삼가동',
  '유방동',
  '마평동',
  '고림동',
  '포곡읍',
  '모현읍',
  '남사읍',
];
const DEFAULT_MARKER_RED = '#E3483A';
const ACTIVE_MARKER_RED = '#D92D20';
const REVIEW_CARD_WIDTH = 292;
const DEFAULT_CAMERA = {
  latitude: 37.2368,
  longitude: 127.1896,
  zoom: 15.2,
};

type SheetStage = 'collapsed' | 'expanded' | 'medium';

type MapRestaurant = {
  address?: string;
  category: string;
  fallbackX: number;
  fallbackY: number;
  id: string;
  imageUri?: string;
  isHiddenGem: boolean;
  latitude: number;
  longitude: number;
  name: string;
  photoUris?: string[];
  regionTownCandidates?: string[];
  reviews: string[];
  status: string;
};

type MapScreenProps = {
  accessToken?: string;
  getFavoriteColor?: (restaurantName: string) => string;
  mapRestaurantsData?: Restaurant[];
  onAddToList?: (restaurant: Restaurant) => void;
  onClearSearch?: () => void;
  onOpenRestaurantDetail?: (restaurantName: string) => void;
  onPressSearchBar?: () => void;
  onSelectTab: (tab: AppTab) => void;
  searchQuery?: string;
};

function createFallbackPosition(index: number) {
  return {
    x: 0.18 + (index % 4) * 0.18,
    y: 0.28 + (Math.floor(index / 4) % 4) * 0.14,
  };
}

function extractTownCandidatesFromText(...texts: Array<string | undefined>) {
  const seen = new Set<string>();

  texts.forEach((text) => {
    if (!text) {
      return;
    }

    const matches = text.match(/[가-힣0-9]+(?:동|읍|면|리)/g) ?? [];
    matches.forEach((match) => {
      const normalized = match.trim();
      if (normalized) {
        seen.add(normalized);
      }
    });
  });

  return Array.from(seen);
}

function mergeRestaurantsWithHiddenGems(
  baseRestaurants: MapRestaurant[],
  hiddenGemRestaurants: MapRestaurant[],
  includeStandaloneHiddenGems: boolean,
) {
  const mergedById = new Map<string, MapRestaurant>();

  baseRestaurants.forEach((restaurant) => {
    mergedById.set(restaurant.id, restaurant);
  });

  hiddenGemRestaurants.forEach((restaurant) => {
    const existing = mergedById.get(restaurant.id);

    if (existing) {
      mergedById.set(restaurant.id, {
        ...existing,
        address: existing.address ?? restaurant.address,
        imageUri: existing.imageUri ?? restaurant.imageUri,
        isHiddenGem: true,
        photoUris:
          existing.photoUris && existing.photoUris.length > 0
            ? existing.photoUris
            : restaurant.photoUris,
        status: existing.status || restaurant.status,
      });
      return;
    }

    if (includeStandaloneHiddenGems) {
      mergedById.set(restaurant.id, restaurant);
    }
  });

  return Array.from(mergedById.values());
}

async function buildMapRestaurantsFromMyLists(accessToken: string, restaurants: Restaurant[]) {
  const candidates = restaurants
    .map((restaurant, index) => ({
      index,
      numericId: Number(restaurant.id),
      source: restaurant,
    }))
    .filter((item) => Number.isFinite(item.numericId));

  const results = await Promise.allSettled(
    candidates.map((item) => getRestaurant(accessToken, item.numericId)),
  );

  return results.flatMap((result, index) => {
    if (result.status !== 'fulfilled') {
      return [];
    }

    const detail = result.value;
    const sourceRestaurant = candidates[index]?.source;

    if (typeof detail.lat !== 'number' || typeof detail.lng !== 'number') {
      return [];
    }

    const fallback = createFallbackPosition(index);

    return [
      {
        address: detail.roadAddress ?? detail.address ?? sourceRestaurant?.address,
        category:
          detail.primaryCategoryName ??
          detail.categories?.[0] ??
          sourceRestaurant?.category ??
          '맛집',
        fallbackX: fallback.x,
        fallbackY: fallback.y,
        id: String(detail.id),
        imageUri: sourceRestaurant?.imageUri ?? detail.imageUrl,
        isHiddenGem: false,
        latitude: detail.lat,
        longitude: detail.lng,
        name: detail.name,
        photoUris:
          sourceRestaurant?.photoUris?.length
            ? sourceRestaurant.photoUris
            : getRestaurantPhotoUris(detail),
        regionTownCandidates: extractTownCandidatesFromText(
          detail.lotAddress,
          detail.address,
          detail.roadAddress,
          sourceRestaurant?.address,
        ),
        reviews: [],
        status: detail.regionName ?? '내 리스트',
      },
    ];
  });
}

async function buildMapRestaurantsFromSearch(accessToken: string, keyword: string) {
  const restaurants = await searchRestaurants(accessToken, keyword);

  return restaurants.flatMap((restaurant, index) => {
    if (typeof restaurant.lat !== 'number' || typeof restaurant.lng !== 'number') {
      return [];
    }

    const fallback = createFallbackPosition(index);

    return [
      {
        address: restaurant.roadAddress ?? restaurant.address,
        category:
          restaurant.primaryCategoryName ??
          restaurant.categories?.[0] ??
          restaurant.regionName ??
          '맛집',
        fallbackX: fallback.x,
        fallbackY: fallback.y,
        id: String(restaurant.id),
        imageUri: restaurant.imageUrl,
        isHiddenGem: false,
        latitude: restaurant.lat,
        longitude: restaurant.lng,
        name: restaurant.name,
        photoUris: getRestaurantPhotoUris(restaurant),
        regionTownCandidates: extractTownCandidatesFromText(
          restaurant.address,
          restaurant.roadAddress,
          restaurant.lotAddress,
        ),
        reviews: [],
        status: restaurant.regionName ?? '검색 결과',
      },
    ];
  });
}

async function fetchHiddenGemItems(accessToken: string, regionTownCandidates: string[]) {
  const mergedByRestaurantId = new Map<number, ApiHiddenGemRestaurantItem>();
  const queryCandidates = Array.from(
    new Set([...regionTownCandidates, ...HIDDEN_GEM_FALLBACK_TOWNS]),
  );

  for (const regionTownName of queryCandidates) {
    try {
      const response = await getHiddenGemRestaurants(accessToken, { regionTownName });
      const items = response.items ?? [];

      items.forEach((item) => {
        if (!mergedByRestaurantId.has(item.restaurantId)) {
          mergedByRestaurantId.set(item.restaurantId, item);
        }
      });
    } catch (error) {
      console.log('[map][hidden-gems][query] failed', { error, regionTownName });
    }
  }

  return Array.from(mergedByRestaurantId.values());
}

async function buildHiddenGemRestaurants(accessToken: string, regionTownCandidates: string[]) {
  const regionItems = await fetchHiddenGemItems(accessToken, regionTownCandidates);

  const results = await Promise.allSettled(
    regionItems.map((item) => getRestaurant(accessToken, item.restaurantId)),
  );

  return results.flatMap((result, index) => {
    const hiddenGem = regionItems[index];
    const detail = result.status === 'fulfilled' ? result.value : null;
    const latitude =
      typeof hiddenGem?.lat === 'number'
        ? hiddenGem.lat
        : typeof detail?.lat === 'number'
          ? detail.lat
          : null;
    const longitude =
      typeof hiddenGem?.lng === 'number'
        ? hiddenGem.lng
        : typeof detail?.lng === 'number'
          ? detail.lng
          : null;

    if (latitude == null || longitude == null) {
      return [];
    }

    const fallback = createFallbackPosition(index);

    return [
      {
        address: hiddenGem?.address ?? detail?.roadAddress ?? detail?.address,
        category: detail?.primaryCategoryName ?? detail?.categories?.[0] ?? '숨은 맛집',
        fallbackX: fallback.x,
        fallbackY: fallback.y,
        id: String(hiddenGem.restaurantId),
        imageUri: detail?.imageUrl,
        isHiddenGem: true,
        latitude,
        longitude,
        name: hiddenGem?.restaurantName ?? detail?.name ?? '숨은 맛집',
        photoUris: detail ? getRestaurantPhotoUris(detail) : [],
        regionTownCandidates: extractTownCandidatesFromText(
          hiddenGem?.regionTownName,
          hiddenGem?.regionName,
          detail?.lotAddress,
          detail?.address,
          detail?.roadAddress,
        ),
        reviews: [],
        status:
          hiddenGem?.regionTownName ??
          hiddenGem?.regionName ??
          detail?.regionName ??
          HIDDEN_GEM_REGION_NAME,
      },
    ];
  });
}

export function MapScreen({
  accessToken,
  getFavoriteColor,
  mapRestaurantsData = [],
  onAddToList,
  onClearSearch,
  onOpenRestaurantDetail,
  onPressSearchBar,
  onSelectTab,
  searchQuery = '',
}: MapScreenProps) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<NaverMapViewRef>(null);
  const currentZoomRef = useRef(DEFAULT_CAMERA.zoom);
  const hasNativeNaverMap = Boolean(UIManager.getViewManagerConfig('RNCNaverMapView'));
  const sheetContentBottomPadding = TAB_BAR_HEIGHT + insets.bottom + 24;
  const snapTops = useMemo(
    () => ({
      collapsed: Math.max(
        insets.top + 392,
        screenHeight - TAB_BAR_HEIGHT - insets.bottom - 76,
      ),
      expanded: insets.top + 72,
      medium: Math.max(insets.top + 182, screenHeight - TAB_BAR_HEIGHT - insets.bottom - 300),
    }),
    [insets.bottom, insets.top],
  );
  const sheetTop = useRef(new Animated.Value(snapTops.medium)).current;
  const [sheetStage, setSheetStage] = useState<SheetStage>('medium');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [focusedRestaurantId, setFocusedRestaurantId] = useState<string | null>(null);
  const [selectedMarkerRestaurantId, setSelectedMarkerRestaurantId] = useState<string | null>(null);
  const [mapDataRestaurants, setMapDataRestaurants] = useState<MapRestaurant[]>([]);
  const [hiddenGemRestaurants, setHiddenGemRestaurants] = useState<MapRestaurant[]>([]);
  const contentScrollOffsetRef = useRef(0);
  const panStartTopRef = useRef(snapTops.medium);
  const contentPanStartStageRef = useRef<SheetStage>('medium');
  const trimmedSearchQuery = searchQuery.trim();
  const previousTrimmedSearchQueryRef = useRef(trimmedSearchQuery);

  const animateSheetTo = (stage: SheetStage) => {
    setSheetStage(stage);
    Animated.spring(sheetTop, {
      bounciness: 0,
      speed: 22,
      toValue: snapTops[stage],
      useNativeDriver: false,
    }).start();
  };

  const animateMapToRestaurant = (restaurant: MapRestaurant | null) => {
    mapRef.current?.animateCameraTo({
      duration: 360,
      easing: 'EaseOut',
      latitude: restaurant?.latitude ?? DEFAULT_CAMERA.latitude,
      longitude: restaurant?.longitude ?? DEFAULT_CAMERA.longitude,
      zoom: restaurant ? currentZoomRef.current : DEFAULT_CAMERA.zoom,
    });
  };

  useEffect(() => {
    if (!accessToken) {
      setHiddenGemRestaurants([]);
      setMapDataRestaurants([]);
      return;
    }

    let cancelled = false;

    const loadMapRestaurants = async () => {
      let nextMapRestaurants: MapRestaurant[] = [];

      try {
        nextMapRestaurants = trimmedSearchQuery
          ? await buildMapRestaurantsFromSearch(accessToken, trimmedSearchQuery)
          : mapRestaurantsData.length > 0
            ? await buildMapRestaurantsFromMyLists(accessToken, mapRestaurantsData)
            : [];
      } catch (error) {
        console.log('[map][restaurants] failed', error);
      }

      const regionTownCandidates = Array.from(
        new Set(
          nextMapRestaurants.flatMap((restaurant) => restaurant.regionTownCandidates ?? []),
        ),
      );

      let nextHiddenGemRestaurants: MapRestaurant[] = [];

      try {
        nextHiddenGemRestaurants = await buildHiddenGemRestaurants(accessToken, regionTownCandidates);
      } catch (error) {
        console.log('[map][hidden-gems] failed', error);
      }

      if (cancelled) {
        return;
      }

      setMapDataRestaurants(nextMapRestaurants);
      setHiddenGemRestaurants(nextHiddenGemRestaurants);
    };

    void loadMapRestaurants();

    return () => {
      cancelled = true;
    };
  }, [accessToken, mapRestaurantsData, trimmedSearchQuery]);

  const mergedRestaurants = useMemo(
    () =>
      mergeRestaurantsWithHiddenGems(
        mapDataRestaurants,
        hiddenGemRestaurants,
        !trimmedSearchQuery,
      ),
    [hiddenGemRestaurants, mapDataRestaurants, trimmedSearchQuery],
  );

  const filterOptions = useMemo(() => {
    const categories = Array.from(
      new Set(mergedRestaurants.map((restaurant) => restaurant.category).filter(Boolean)),
    ).slice(0, 5);

    return [HIDDEN_GEM_FILTER, ...categories.filter((category) => category !== HIDDEN_GEM_FILTER)];
  }, [mergedRestaurants]);

  const baseFilteredRestaurants = useMemo(() => {
    const hasHiddenGemFilter = activeFilters.includes(HIDDEN_GEM_FILTER);
    const categoryFilters = activeFilters.filter((filter) => filter !== HIDDEN_GEM_FILTER);

    return mergedRestaurants.filter((restaurant) => {
      if (restaurant.isHiddenGem && !hasHiddenGemFilter) {
        return false;
      }

      if (hasHiddenGemFilter && !restaurant.isHiddenGem) {
        return false;
      }

      if (categoryFilters.length > 0 && !categoryFilters.includes(restaurant.category)) {
        return false;
      }

      return true;
    });
  }, [activeFilters, mergedRestaurants]);

  const visibleRestaurants = useMemo(() => {
    if (!selectedMarkerRestaurantId) {
      return baseFilteredRestaurants;
    }

    return baseFilteredRestaurants.filter(
      (restaurant) => restaurant.id === selectedMarkerRestaurantId,
    );
  }, [baseFilteredRestaurants, selectedMarkerRestaurantId]);

  useEffect(() => {
    if (
      selectedMarkerRestaurantId &&
      !baseFilteredRestaurants.some((restaurant) => restaurant.id === selectedMarkerRestaurantId)
    ) {
      setSelectedMarkerRestaurantId(null);
    }
  }, [baseFilteredRestaurants, selectedMarkerRestaurantId]);

  useEffect(() => {
    const previousTrimmedSearchQuery = previousTrimmedSearchQueryRef.current;
    previousTrimmedSearchQueryRef.current = trimmedSearchQuery;

    if (previousTrimmedSearchQuery && !trimmedSearchQuery) {
      setActiveFilters([]);
      setFocusedRestaurantId(null);
      setSelectedMarkerRestaurantId(null);
      animateSheetTo('medium');
    }
  }, [trimmedSearchQuery]);

  useEffect(() => {
    if (!trimmedSearchQuery) {
      if (!selectedMarkerRestaurantId) {
        setFocusedRestaurantId(null);
      }
      return;
    }

    if (baseFilteredRestaurants.length === 0) {
      setFocusedRestaurantId(null);
      setSelectedMarkerRestaurantId(null);
      animateSheetTo('medium');
      return;
    }

    if (baseFilteredRestaurants.length === 1) {
      const restaurant = baseFilteredRestaurants[0];
      setFocusedRestaurantId(restaurant.id);
      setSelectedMarkerRestaurantId(restaurant.id);
      animateSheetTo('medium');
      animateMapToRestaurant(restaurant);
      return;
    }

    setFocusedRestaurantId(baseFilteredRestaurants[0].id);
    animateSheetTo('medium');
    animateMapToRestaurant(baseFilteredRestaurants[0]);
  }, [baseFilteredRestaurants, selectedMarkerRestaurantId, trimmedSearchQuery]);

  const toggleFilter = (filter: string) => {
    setSelectedMarkerRestaurantId(null);
    setActiveFilters((current) =>
      current.includes(filter)
        ? current.filter((item) => item !== filter)
        : [...current, filter],
    );
  };

  const handlePressMarker = (restaurant: MapRestaurant) => {
    setFocusedRestaurantId(restaurant.id);
    setSelectedMarkerRestaurantId(restaurant.id);
    animateSheetTo('medium');
  };

  const handlePressRestaurant = (restaurant: MapRestaurant) => {
    setFocusedRestaurantId(restaurant.id);
    setSelectedMarkerRestaurantId(restaurant.id);
    animateMapToRestaurant(restaurant);
    onOpenRestaurantDetail?.(restaurant.name);
  };

  const handlePressClear = () => {
    setActiveFilters([]);
    setFocusedRestaurantId(null);
    setSelectedMarkerRestaurantId(null);
    animateSheetTo('medium');
    onClearSearch?.();
  };

  const handlePressMapBackground = () => {
    setFocusedRestaurantId(null);
    setSelectedMarkerRestaurantId(null);
  };

  const handlePressLocationButton = () => {
    setFocusedRestaurantId(null);
    setSelectedMarkerRestaurantId(null);
    animateMapToRestaurant(null);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dy) > 6 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderGrant: () => {
          // @ts-expect-error runtime access
          panStartTopRef.current = sheetTop.__getValue();
        },
        onPanResponderMove: (_, gestureState) => {
          const nextTop = Math.min(
            snapTops.collapsed,
            Math.max(snapTops.expanded, panStartTopRef.current + gestureState.dy),
          );
          sheetTop.setValue(nextTop);
        },
        onPanResponderRelease: (_, gestureState) => {
          const currentTop = panStartTopRef.current + gestureState.dy;
          const candidates = [
            { stage: 'expanded' as const, top: snapTops.expanded },
            { stage: 'medium' as const, top: snapTops.medium },
            { stage: 'collapsed' as const, top: snapTops.collapsed },
          ];

          if (gestureState.vy < -0.8) {
            animateSheetTo(currentTop <= snapTops.medium ? 'expanded' : 'medium');
            return;
          }

          if (gestureState.vy > 0.8) {
            animateSheetTo(currentTop >= snapTops.medium ? 'collapsed' : 'medium');
            return;
          }

          const nearest = candidates.reduce((closest, candidate) => {
            const closestDistance = Math.abs(currentTop - closest.top);
            const candidateDistance = Math.abs(currentTop - candidate.top);
            return candidateDistance < closestDistance ? candidate : closest;
          });

          animateSheetTo(nearest.stage);
        },
      }),
    [sheetTop, snapTops],
  );

  const contentPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          sheetStage !== 'collapsed' &&
          contentScrollOffsetRef.current <= 0 &&
          gestureState.dy > 8 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderGrant: () => {
          contentPanStartStageRef.current = sheetStage;
          // @ts-expect-error runtime access
          panStartTopRef.current = sheetTop.__getValue();
        },
        onPanResponderMove: (_, gestureState) => {
          const baseTop = snapTops[contentPanStartStageRef.current];
          const nextTop = Math.min(
            snapTops.collapsed,
            Math.max(baseTop, panStartTopRef.current + gestureState.dy),
          );
          sheetTop.setValue(nextTop);
        },
        onPanResponderRelease: (_, gestureState) => {
          const startStage = contentPanStartStageRef.current;
          const releaseTop = panStartTopRef.current + gestureState.dy;

          if (startStage === 'expanded') {
            const mediumThreshold = (snapTops.expanded + snapTops.medium) / 2;
            animateSheetTo(
              gestureState.vy > 0.7 || releaseTop > mediumThreshold ? 'medium' : 'expanded',
            );
            return;
          }

          const collapsedThreshold = (snapTops.medium + snapTops.collapsed) / 2;
          animateSheetTo(
            gestureState.vy > 0.7 || releaseTop > collapsedThreshold ? 'collapsed' : 'medium',
          );
        },
      }),
    [sheetStage, sheetTop, snapTops],
  );

  const currentLocationOpacity = sheetTop.interpolate({
    inputRange: [snapTops.expanded, snapTops.medium, snapTops.collapsed],
    outputRange: [0, 0.84, 1],
  });

  const currentLocationTranslateY = sheetTop.interpolate({
    inputRange: [snapTops.expanded, snapTops.collapsed],
    outputRange: [-12, 0],
  });

  const currentLocationTop = sheetTop.interpolate({
    extrapolate: 'clamp',
    inputRange: [snapTops.expanded, snapTops.medium, snapTops.collapsed],
    outputRange: [snapTops.expanded - 42, snapTops.medium - 60, snapTops.collapsed - 60],
  });

  const topBackdropOpacity = sheetTop.interpolate({
    extrapolate: 'clamp',
    inputRange: [snapTops.expanded, snapTops.medium],
    outputRange: [1, 0],
  });

  const topBackdropHeight = sheetTop.interpolate({
    extrapolate: 'clamp',
    inputRange: [snapTops.expanded, snapTops.medium],
    outputRange: [snapTops.expanded + 4, 0],
  });

  const hasActiveFilters = activeFilters.length > 0;
  const hiddenGemFilterActive = activeFilters.includes(HIDDEN_GEM_FILTER);

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <View style={styles.screen}>
        <View style={styles.mapLayer}>
          {hasNativeNaverMap ? (
            <>
              <NaverMapView
                ref={mapRef}
                style={styles.mapView}
                initialCamera={DEFAULT_CAMERA}
                isShowCompass={false}
                isShowScaleBar={false}
                isShowZoomControls={false}
                isScrollGesturesEnabled
                isZoomGesturesEnabled
                isTiltGesturesEnabled={false}
                isRotateGesturesEnabled={false}
                onCameraChanged={({ zoom }) => {
                  if (typeof zoom === 'number') {
                    currentZoomRef.current = zoom;
                  }
                }}
                onTapMap={handlePressMapBackground}
              >
                {baseFilteredRestaurants.map((restaurant) => {
                  const active = restaurant.id === focusedRestaurantId;
                  const hiddenGemMarkerWidth = active ? 50 : 44;
                  const hiddenGemMarkerHeight = active ? 60 : 54;
                  const markerColor = restaurant.isHiddenGem
                    ? '#111111'
                    : active
                      ? ACTIVE_MARKER_RED
                      : DEFAULT_MARKER_RED;
                  const markerImage = restaurant.isHiddenGem ? {} : { symbol: 'red' as const };

                  return (
                    <NaverMapMarkerOverlay
                      key={restaurant.id}
                      latitude={restaurant.latitude}
                      longitude={restaurant.longitude}
                      width={restaurant.isHiddenGem ? hiddenGemMarkerWidth : active ? 34 : 28}
                      height={restaurant.isHiddenGem ? hiddenGemMarkerHeight : active ? 42 : 34}
                      anchor={{ x: 0.5, y: 1 }}
                      image={markerImage}
                      tintColor={restaurant.isHiddenGem ? undefined : markerColor}
                      onTap={() => handlePressMarker(restaurant)}
                    >
                      {restaurant.isHiddenGem ? (
                        <View
                          key={`hidden-gem-marker-${restaurant.id}-${active ? 'active' : 'idle'}`}
                          collapsable={false}
                          style={[
                            styles.hiddenGemMapMarker,
                            active && styles.hiddenGemMapMarkerActive,
                          ]}
                        >
                          <View
                            style={[
                              styles.hiddenGemMapMarkerHead,
                              active && styles.hiddenGemMapMarkerHeadActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.hiddenGemMapMarkerLabel,
                                active && styles.hiddenGemMapMarkerLabelActive,
                              ]}
                            >
                              {'숨은\n맛집'}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.hiddenGemMapMarkerStem,
                              active && styles.hiddenGemMapMarkerStemActive,
                            ]}
                          />
                          <View
                            style={[
                              styles.hiddenGemMapMarkerTip,
                              active && styles.hiddenGemMapMarkerTipActive,
                            ]}
                          />
                        </View>
                      ) : null}
                    </NaverMapMarkerOverlay>
                  );
                })}
              </NaverMapView>
            </>
          ) : (
            <Pressable style={styles.mapFallback} onPress={handlePressMapBackground}>
              {baseFilteredRestaurants.map((restaurant) => {
                const active = restaurant.id === focusedRestaurantId;

                return (
                  <Pressable
                    key={restaurant.id}
                    style={[
                      styles.fallbackMarkerWrap,
                      {
                        left: `${restaurant.fallbackX * 100}%`,
                        top: `${restaurant.fallbackY * 100}%`,
                      },
                    ]}
                    onPress={() => handlePressMarker(restaurant)}
                  >
                    <View
                      style={[
                        styles.fallbackMarkerStem,
                        active && styles.fallbackMarkerStemActive,
                        restaurant.isHiddenGem && styles.fallbackHiddenMarkerStem,
                      ]}
                    />
                    <View
                      style={[
                        styles.fallbackMarkerHead,
                        active && styles.fallbackMarkerHeadActive,
                        restaurant.isHiddenGem && styles.fallbackHiddenMarkerHead,
                      ]}
                    />
                  </Pressable>
                );
              })}
            </Pressable>
          )}
        </View>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.topBackdrop,
            {
              height: topBackdropHeight,
              opacity: topBackdropOpacity,
            },
          ]}
        />

        <Pressable
          style={[
            styles.searchBar,
            sheetStage === 'expanded' ? styles.searchBarExpanded : styles.searchBarFloating,
            { top: insets.top + 12 },
          ]}
          onPress={onPressSearchBar}
        >
          <SearchIcon width={28} height={28} color="#000000" />
          <Text
            numberOfLines={1}
            style={[styles.searchText, !trimmedSearchQuery && styles.searchPlaceholder]}
          >
            {trimmedSearchQuery || '맛집을 검색해보세요'}
          </Text>
          {trimmedSearchQuery ? (
            <Pressable
              style={styles.clearSearchButton}
              onPress={(event) => {
                event.stopPropagation();
                handlePressClear();
              }}
              hitSlop={8}
            >
              <Text style={styles.clearSearchLabel}>×</Text>
            </Pressable>
          ) : null}
        </Pressable>

        <Animated.View
          style={[
            styles.locationButton,
            {
              opacity: currentLocationOpacity,
              top: currentLocationTop,
              transform: [{ translateY: currentLocationTranslateY }],
            },
          ]}
        >
          <Pressable style={styles.locationButtonInner} onPress={handlePressLocationButton}>
            <MyLocationIcon width={26} height={26} />
          </Pressable>
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              bottom: 0,
              top: sheetTop,
            },
          ]}
        >
          <View {...panResponder.panHandlers}>
            <View style={styles.handleWrap}>
              <View style={styles.handleBar} />
            </View>
          </View>

          <View style={styles.sheetScrollWrap} {...contentPanResponder.panHandlers}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              onScroll={(event) => {
                contentScrollOffsetRef.current = event.nativeEvent.contentOffset.y;
              }}
              contentContainerStyle={[
                styles.sheetContent,
                { paddingBottom: sheetContentBottomPadding },
              ]}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
              >
                <Pressable
                  style={[
                    styles.filterIconButton,
                    hasActiveFilters && styles.filterIconButtonActive,
                  ]}
                  onPress={() => setActiveFilters([])}
                >
                  <FilterIcon
                    width={16}
                    height={16}
                    color={hasActiveFilters ? '#FF5A52' : '#9B9B9B'}
                  />
                </Pressable>
                {filterOptions.map((filter) => {
                  const active = activeFilters.includes(filter);
                  return (
                    <Pressable
                      key={filter}
                      style={[styles.filterChip, active && styles.filterChipActive]}
                      onPress={() => toggleFilter(filter)}
                    >
                      <Text
                        style={[styles.filterChipLabel, active && styles.filterChipLabelActive]}
                      >
                        {filter}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View style={styles.restaurantList}>
                {visibleRestaurants.map((restaurant) => {
                  const accentColor = getFavoriteColor?.(restaurant.name) ?? '#D9D9D9';
                  const active = restaurant.id === focusedRestaurantId;

                  return (
                    <View key={restaurant.id} style={styles.restaurantBlock}>
                      <Pressable
                        style={styles.restaurantRow}
                        onPress={() => handlePressRestaurant(restaurant)}
                      >
                        <View style={styles.restaurantCopy}>
                          <View style={styles.restaurantTitleRow}>
                            <Text
                              style={[
                                styles.restaurantName,
                                active && styles.restaurantNameActive,
                              ]}
                            >
                              {restaurant.name}
                            </Text>
                            {restaurant.isHiddenGem ? (
                              <View style={styles.hiddenGemBadge}>
                                <Text style={styles.hiddenGemBadgeText}>숨은 맛집</Text>
                              </View>
                            ) : null}
                          </View>
                          <Text style={styles.restaurantMeta}>
                            {restaurant.category} · {restaurant.status}
                          </Text>
                        </View>

                        <Pressable
                          hitSlop={10}
                          onPress={(event) => {
                            event.stopPropagation();
                            onAddToList?.({
                              address: restaurant.address,
                              category: restaurant.category,
                              id: restaurant.id,
                              imageUri: restaurant.imageUri,
                              name: restaurant.name,
                              photoUris: restaurant.photoUris,
                              shortName: restaurant.name,
                            });
                          }}
                        >
                          <StarIcon width={34} height={34} color={accentColor} />
                        </Pressable>
                      </Pressable>

                      <View style={styles.reviewRow}>
                        <ScrollView
                          horizontal
                          nestedScrollEnabled
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.reviewScrollContent}
                        >
                          {restaurant.reviews.length > 0 ? (
                            restaurant.reviews.map((review, index) => (
                              <View
                                key={`${restaurant.id}-review-${index}`}
                                style={styles.reviewBox}
                              >
                                <Text numberOfLines={2} style={styles.reviewText}>
                                  {review}
                                </Text>
                              </View>
                            ))
                          ) : (
                            <View style={styles.reviewBox}>
                              <Text numberOfLines={2} style={styles.reviewText}>
                                아직 등록된 리뷰가 없어요.
                              </Text>
                            </View>
                          )}
                        </ScrollView>
                      </View>

                      <View style={styles.divider} />
                    </View>
                  );
                })}

                {visibleRestaurants.length === 0 ? (
                  <View style={styles.emptyResult}>
                    <Text style={styles.emptyResultTitle}>
                      {hiddenGemFilterActive
                        ? '숨은 맛집이 없어요.'
                        : trimmedSearchQuery
                          ? '검색 결과가 없어요.'
                          : '내 리스트 식당이 없어요.'}
                    </Text>
                    <Text style={styles.emptyResultBody}>
                      {hiddenGemFilterActive
                        ? '지금 조건에 맞는 숨은 맛집을 아직 보여드릴 수 없어요.'
                        : trimmedSearchQuery
                          ? '다른 검색어로 다시 찾아보세요.'
                          : '리스트에 맛집을 담으면 지도에서 바로 확인할 수 있어요.'}
                    </Text>
                  </View>
                ) : null}
              </View>
            </ScrollView>
          </View>
        </Animated.View>

        <BottomTabBar
          activeTab="map"
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
  clearSearchButton: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  clearSearchLabel: {
    color: '#A9A9A9',
    fontSize: 22,
    fontWeight: '300',
    lineHeight: 22,
  },
  divider: {
    backgroundColor: '#F1F1F1',
    height: 1,
    marginTop: 2,
  },
  emptyResult: {
    alignItems: 'center',
    gap: 8,
    paddingBottom: 12,
    paddingTop: 36,
  },
  emptyResultBody: {
    color: '#9B9B9B',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    textAlign: 'center',
  },
  emptyResultTitle: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  fallbackHiddenMarkerHead: {
    backgroundColor: '#111111',
  },
  fallbackHiddenMarkerStem: {
    backgroundColor: '#111111',
  },
  fallbackMarkerHead: {
    backgroundColor: DEFAULT_MARKER_RED,
    borderColor: '#FFFFFF',
    borderRadius: 11,
    borderWidth: 4,
    height: 22,
    width: 22,
  },
  fallbackMarkerHeadActive: {
    borderRadius: 13,
    height: 26,
    width: 26,
  },
  fallbackMarkerStem: {
    backgroundColor: DEFAULT_MARKER_RED,
    borderRadius: 99,
    height: 28,
    marginBottom: -4,
    width: 5,
  },
  fallbackMarkerStemActive: {
    height: 32,
  },
  fallbackMarkerWrap: {
    alignItems: 'center',
    marginLeft: -14,
    marginTop: -28,
    position: 'absolute',
    width: 28,
  },
  filterChip: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#DEDEDE',
    borderRadius: 21,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  filterChipActive: {
    backgroundColor: '#FFF3F2',
    borderColor: '#FF5A52',
  },
  filterChipLabel: {
    color: '#9B9B9B',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  filterChipLabelActive: {
    color: '#FF5A52',
  },
  filterIconButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E2E2',
    borderRadius: 21,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  filterIconButtonActive: {
    backgroundColor: '#FFF3F2',
    borderColor: '#FF5A52',
  },
  filterRow: {
    alignItems: 'center',
    gap: 10,
    paddingBottom: 12,
  },
  handleBar: {
    backgroundColor: '#D7D7D7',
    borderRadius: 999,
    height: 4,
    width: 48,
  },
  handleWrap: {
    alignItems: 'center',
    paddingBottom: 14,
    paddingTop: 10,
  },
  hiddenGemMapMarker: {
    alignItems: 'center',
    height: 54,
    justifyContent: 'flex-end',
    width: 44,
  },
  hiddenGemMapMarkerActive: {
    height: 60,
    width: 50,
  },
  hiddenGemMapMarkerHead: {
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 17,
    height: 34,
    justifyContent: 'center',
    width: 44,
  },
  hiddenGemMapMarkerHeadActive: {
    borderRadius: 19,
    height: 38,
    width: 50,
  },
  hiddenGemMapMarkerLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 11,
    textAlign: 'center',
  },
  hiddenGemMapMarkerLabelActive: {
    fontSize: 11,
    lineHeight: 12,
  },
  hiddenGemMapMarkerStem: {
    backgroundColor: '#111111',
    borderRadius: 99,
    height: 10,
    marginTop: -1,
    width: 6,
  },
  hiddenGemMapMarkerStemActive: {
    height: 12,
    width: 7,
  },
  hiddenGemMapMarkerTip: {
    backgroundColor: '#111111',
    borderRadius: 99,
    height: 10,
    marginTop: -2,
    width: 10,
  },
  hiddenGemMapMarkerTipActive: {
    height: 11,
    width: 11,
  },
  hiddenGemBadge: {
    backgroundColor: '#111111',
    borderRadius: 11,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  hiddenGemBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 13,
  },
  locationButton: {
    left: 18,
    position: 'absolute',
    zIndex: 3,
  },
  locationButtonInner: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    elevation: 6,
    height: 48,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      height: 8,
      width: 0,
    },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    width: 48,
  },
  mapFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
  },
  mapLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  mapView: {
    ...StyleSheet.absoluteFillObject,
  },
  restaurantBlock: {
    gap: 14,
  },
  restaurantCopy: {
    flex: 1,
    gap: 8,
  },
  restaurantList: {
    gap: 6,
  },
  restaurantMeta: {
    color: '#919191',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  restaurantName: {
    color: '#FF5A52',
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
  },
  restaurantNameActive: {
    color: '#FF3B30',
  },
  restaurantRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 4,
  },
  restaurantTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reviewBox: {
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 12,
    width: REVIEW_CARD_WIDTH,
  },
  reviewRow: {
    marginRight: -16,
  },
  reviewScrollContent: {
    gap: 12,
    paddingRight: 16,
  },
  reviewText: {
    color: '#222222',
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  safeArea: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  screen: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 29,
    flexDirection: 'row',
    gap: 12,
    height: 58,
    left: 16,
    paddingHorizontal: 18,
    position: 'absolute',
    right: 16,
    zIndex: 4,
  },
  searchBarExpanded: {
    borderColor: '#F0F0F0',
    borderWidth: 1,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  searchBarFloating: {
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: {
      height: 8,
      width: 0,
    },
    shadowOpacity: 0.06,
    shadowRadius: 20,
  },
  searchPlaceholder: {
    color: '#DDDDDD',
  },
  searchText: {
    color: '#1A1A1A',
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    elevation: 12,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    shadowColor: '#000000',
    shadowOffset: {
      height: -4,
      width: 0,
    },
    shadowOpacity: 0.04,
    shadowRadius: 12,
  },
  sheetContent: {
    gap: 12,
    paddingHorizontal: 16,
  },
  sheetScrollWrap: {
    flex: 1,
  },
  topBackdrop: {
    backgroundColor: '#FFFFFF',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
