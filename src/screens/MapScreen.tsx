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
import { getRestaurant, getRestaurantPhotoUris } from '../api/wagu';
import { AppTab, BottomTabBar, TAB_BAR_HEIGHT } from '../components/BottomTabBar';
import { Restaurant } from '../data/restaurants';

const { height: screenHeight } = Dimensions.get('window');

const REVIEW_CARD_WIDTH = 292;
const DEFAULT_CAMERA = {
  latitude: 37.2369,
  longitude: 127.1902,
  zoom: 15.2,
};

type SheetStage = 'collapsed' | 'medium' | 'expanded';

type MapRestaurant = {
  address?: string;
  category: string;
  fallbackX: number;
  fallbackY: number;
  id: string;
  imageUri?: string;
  latitude: number;
  longitude: number;
  name: string;
  photoUris?: string[];
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
      expanded: insets.top + 72,
      medium: Math.max(insets.top + 182, screenHeight - TAB_BAR_HEIGHT - insets.bottom - 300),
      collapsed: Math.max(
        insets.top + 392,
        screenHeight - TAB_BAR_HEIGHT - insets.bottom - 76,
      ),
    }),
    [insets.bottom, insets.top],
  );

  const sheetTop = useRef(new Animated.Value(snapTops.medium)).current;
  const [sheetStage, setSheetStage] = useState<SheetStage>('medium');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [focusedRestaurantId, setFocusedRestaurantId] = useState<string | null>(null);
  const [selectedMarkerRestaurantId, setSelectedMarkerRestaurantId] = useState<string | null>(null);
  const [mapDataRestaurants, setMapDataRestaurants] = useState<MapRestaurant[]>([]);
  const contentScrollOffsetRef = useRef(0);
  const panStartTopRef = useRef(snapTops.medium);
  const contentPanStartStageRef = useRef<SheetStage>('medium');
  const trimmedSearchQuery = searchQuery.trim();

  const animateSheetTo = (stage: SheetStage) => {
    setSheetStage(stage);
    Animated.spring(sheetTop, {
      toValue: snapTops[stage],
      useNativeDriver: false,
      speed: 22,
      bounciness: 0,
    }).start();
  };

  const animateMapToRestaurant = (restaurant: MapRestaurant | null) => {
    mapRef.current?.animateCameraTo({
      latitude: restaurant?.latitude ?? DEFAULT_CAMERA.latitude,
      longitude: restaurant?.longitude ?? DEFAULT_CAMERA.longitude,
      zoom: restaurant ? currentZoomRef.current : DEFAULT_CAMERA.zoom,
      duration: 360,
      easing: 'EaseOut',
    });
  };

  useEffect(() => {
    if (!accessToken || mapRestaurantsData.length === 0) {
      setMapDataRestaurants([]);
      return;
    }

    let cancelled = false;

    const loadMapRestaurants = async () => {
      try {
        const candidates = mapRestaurantsData
          .map((restaurant, index) => ({
            source: restaurant,
            index,
            numericId: Number(restaurant.id),
          }))
          .filter((item) => Number.isFinite(item.numericId));

        const results = await Promise.allSettled(
          candidates.map((item) => getRestaurant(accessToken, item.numericId)),
        );

        const nextRestaurants = results.flatMap((result, index) => {
          if (result.status !== 'fulfilled') {
            return [];
          }

          const detail = result.value;
          const sourceRestaurant = candidates[index]?.source;

          if (typeof detail.lat !== 'number' || typeof detail.lng !== 'number') {
            return [];
          }

          return [
            {
              address: detail.roadAddress ?? detail.address ?? sourceRestaurant?.address,
              category:
                detail.primaryCategoryName ??
                detail.categories?.[0] ??
                sourceRestaurant?.category ??
                '맛집',
              fallbackX: 0.18 + (index % 4) * 0.18,
              fallbackY: 0.28 + (Math.floor(index / 4) % 4) * 0.14,
              id: String(detail.id),
              imageUri: sourceRestaurant?.imageUri ?? detail.imageUrl,
              latitude: detail.lat,
              longitude: detail.lng,
              name: detail.name,
              photoUris:
                sourceRestaurant?.photoUris?.length
                  ? sourceRestaurant.photoUris
                  : getRestaurantPhotoUris(detail),
              reviews: [],
              status: detail.regionName ?? '내 리스트',
            },
          ];
        });

        if (!cancelled) {
          setMapDataRestaurants(nextRestaurants);
        }
      } catch {
        if (!cancelled) {
          setMapDataRestaurants([]);
        }
      }
    };

    void loadMapRestaurants();

    return () => {
      cancelled = true;
    };
  }, [accessToken, mapRestaurantsData]);

  const filterOptions = useMemo(
    () =>
      Array.from(
        new Set(
          mapDataRestaurants.map((restaurant) => restaurant.category).filter(Boolean),
        ),
      ).slice(0, 5),
    [mapDataRestaurants],
  );

  const baseFilteredRestaurants = useMemo(() => {
    let results = mapDataRestaurants;

    if (trimmedSearchQuery) {
      const query = trimmedSearchQuery.toLowerCase();
      results = results.filter((restaurant) =>
        [restaurant.name, restaurant.category, restaurant.status].some((value) =>
          value.toLowerCase().includes(query),
        ),
      );
    }

    if (activeFilters.length === 0) {
      return results;
    }

    return results.filter((restaurant) => activeFilters.includes(restaurant.category));
  }, [activeFilters, mapDataRestaurants, trimmedSearchQuery]);

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
    setSelectedMarkerRestaurantId(null);
    setFocusedRestaurantId(null);
    animateSheetTo('medium');
    onClearSearch?.();
  };

  const handlePressMapBackground = () => {
    setSelectedMarkerRestaurantId(null);
    setFocusedRestaurantId(null);
  };

  const handlePressLocationButton = () => {
    setSelectedMarkerRestaurantId(null);
    setFocusedRestaurantId(null);
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
    inputRange: [snapTops.expanded, snapTops.medium, snapTops.collapsed],
    outputRange: [snapTops.expanded - 42, snapTops.medium - 60, snapTops.collapsed - 60],
    extrapolate: 'clamp',
  });

  const topBackdropOpacity = sheetTop.interpolate({
    inputRange: [snapTops.expanded, snapTops.medium],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const topBackdropHeight = sheetTop.interpolate({
    inputRange: [snapTops.expanded, snapTops.medium],
    outputRange: [snapTops.expanded + 4, 0],
    extrapolate: 'clamp',
  });

  const hasActiveFilters = activeFilters.length > 0;

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
                  const markerColor = active ? '#F24E46' : '#F5655E';

                  return (
                    <NaverMapMarkerOverlay
                      key={restaurant.id}
                      latitude={restaurant.latitude}
                      longitude={restaurant.longitude}
                      width={active ? 34 : 28}
                      height={active ? 42 : 34}
                      anchor={{ x: 0.5, y: 1 }}
                      image={{ symbol: 'red' }}
                      tintColor={markerColor}
                      onTap={() => handlePressMarker(restaurant)}
                    />
                  );
                })}
              </NaverMapView>
              <View pointerEvents="none" style={styles.mapVeil} />
            </>
          ) : (
            <Pressable style={styles.mapFallback} onPress={handlePressMapBackground}>
              {baseFilteredRestaurants.map((restaurant) => {
                const active = restaurant.id === focusedRestaurantId;
                const markerStemStyle = active
                  ? styles.fallbackMarkerStemActive
                  : styles.fallbackMarkerStem;
                const markerHeadStyle = active
                  ? styles.fallbackMarkerHeadActive
                  : styles.fallbackMarkerHead;

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
                    <View style={[styles.fallbackMarkerStem, markerStemStyle]} />
                    <View style={[styles.fallbackMarkerHead, markerHeadStyle]} />
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
            {trimmedSearchQuery || '내 리스트 맛집을 검색해보세요'}
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
              top: currentLocationTop,
              opacity: currentLocationOpacity,
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
              top: sheetTop,
              bottom: 0,
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
                          <Text
                            style={[
                              styles.restaurantName,
                              active && styles.restaurantNameActive,
                            ]}
                          >
                            {restaurant.name}
                          </Text>
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
                    <Text style={styles.emptyResultTitle}>내 리스트 식당이 없어요</Text>
                    <Text style={styles.emptyResultBody}>
                      리스트에 맛집을 담으면 지도에서 바로 확인할 수 있어요.
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
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mapLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  mapView: {
    ...StyleSheet.absoluteFillObject,
  },
  mapFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
  },
  mapVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.68)',
  },
  fallbackMarkerWrap: {
    position: 'absolute',
    marginLeft: -14,
    marginTop: -28,
    width: 28,
    alignItems: 'center',
  },
  fallbackMarkerStem: {
    width: 5,
    height: 28,
    marginBottom: -4,
    borderRadius: 99,
    backgroundColor: '#F5655E',
  },
  fallbackMarkerStemActive: {
    height: 32,
    backgroundColor: '#F24E46',
  },
  fallbackMarkerHead: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F5655E',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  fallbackMarkerHeadActive: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F24E46',
  },
  topBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    gap: 12,
    zIndex: 4,
  },
  searchBarExpanded: {
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  searchBarFloating: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 5,
  },
  searchText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  searchPlaceholder: {
    color: '#DDDDDD',
  },
  clearSearchButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearSearchLabel: {
    fontSize: 22,
    lineHeight: 22,
    fontWeight: '300',
    color: '#A9A9A9',
  },
  locationButton: {
    position: 'absolute',
    left: 18,
    zIndex: 3,
  },
  locationButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 12,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 14,
  },
  handleBar: {
    width: 48,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#D7D7D7',
  },
  sheetScrollWrap: {
    flex: 1,
  },
  sheetContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  filterRow: {
    alignItems: 'center',
    gap: 10,
    paddingBottom: 12,
  },
  filterIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIconButtonActive: {
    borderColor: '#FF5A52',
    backgroundColor: '#FFF3F2',
  },
  filterChip: {
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#DEDEDE',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  filterChipActive: {
    borderColor: '#FF5A52',
    backgroundColor: '#FFF3F2',
  },
  filterChipLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    color: '#9B9B9B',
  },
  filterChipLabelActive: {
    color: '#FF5A52',
  },
  restaurantList: {
    gap: 6,
  },
  restaurantBlock: {
    gap: 14,
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 4,
  },
  restaurantCopy: {
    flex: 1,
    gap: 8,
  },
  restaurantName: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    color: '#FF5A52',
  },
  restaurantNameActive: {
    color: '#FF3B30',
  },
  restaurantMeta: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: '#919191',
  },
  reviewRow: {
    marginRight: -16,
  },
  reviewScrollContent: {
    gap: 12,
    paddingRight: 16,
  },
  reviewBox: {
    width: REVIEW_CARD_WIDTH,
    minHeight: 64,
    borderRadius: 8,
    backgroundColor: '#F6F6F6',
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  reviewText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    color: '#222222',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F1F1',
    marginTop: 2,
  },
  emptyResult: {
    paddingTop: 36,
    paddingBottom: 12,
    alignItems: 'center',
    gap: 8,
  },
  emptyResultTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  emptyResultBody: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: '#9B9B9B',
    textAlign: 'center',
  },
});
