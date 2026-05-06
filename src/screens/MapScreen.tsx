import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import FilterIcon from '../../assets/icons/filter.svg';
import MyLocationIcon from '../../assets/icons/mylocation.svg';
import SearchIcon from '../../assets/icons/search.svg';
import StarIcon from '../../assets/icons/star.svg';
import { AppTab, BottomTabBar, TAB_BAR_HEIGHT } from '../components/BottomTabBar';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CARD_IMAGE_1 =
  'https://www.figma.com/api/mcp/asset/8bf81c7c-6e21-49dd-8de2-e71b0d4be811';
const CARD_IMAGE_2 =
  'https://www.figma.com/api/mcp/asset/e1297ed7-1f46-4571-9647-6fb446c74779';
const CARD_IMAGE_3 =
  'https://www.figma.com/api/mcp/asset/eadf9fef-62f7-4cce-96ab-43eb62eb795c';
const CARD_IMAGE_4 =
  'https://www.figma.com/api/mcp/asset/5d875193-0249-4c3c-9d25-6f9becab646e';
const CARD_IMAGE_5 =
  'https://www.figma.com/api/mcp/asset/525d80cf-35b8-4f3c-b52a-5306023482bb';

const FILTER_OPTIONS = ['영업 중', '영업 전', '한식', '양식', '중식'] as const;
const REVIEW_CARD_WIDTH = 270;
const MAP_CENTER_X = screenWidth / 2;
const MAP_CENTER_Y = 250;
const NAVER_MAP_WEB_URL = 'https://map.naver.com/v5';

type SheetStage = 'collapsed' | 'medium' | 'expanded';

type MapRestaurant = {
  id: string;
  name: string;
  category: string;
  status: string;
  imageUri: string;
  featured?: boolean;
  reviews: string[];
  markerX: number;
  markerY: number;
};

const mapRestaurants: MapRestaurant[] = [
  {
    id: 'map-1',
    name: '와이앤웍',
    category: '중식',
    status: '영업 중',
    imageUri: CARD_IMAGE_1,
    featured: true,
    markerX: 78,
    markerY: 434,
    reviews: [
      '중식 기본 메뉴부터 탕수육, 짜장면, 짬뽕 조합이 좋아요. 양도 넉넉해서 만족도가 높았어요.',
      '매장 분위기도 좋고 식사 속도도 빨라서 점심 모임으로 가기 좋았어요.',
    ],
  },
  {
    id: 'map-2',
    name: '와이키키',
    category: '양식',
    status: '영업 중',
    imageUri: CARD_IMAGE_2,
    markerX: 250,
    markerY: 324,
    reviews: [
      '브런치부터 파스타까지 안정적으로 맛있고 사진도 예쁘게 나와요.',
      '데이트 코스로 가기 좋은 분위기라서 재방문하고 싶은 곳이에요.',
    ],
  },
  {
    id: 'map-2b',
    name: '미식담옥',
    category: '양식',
    status: '영업 중',
    imageUri: CARD_IMAGE_2,
    markerX: 250,
    markerY: 324,
    reviews: [
      '브런치부터 파스타까지 안정적으로 맛있고 사진도 예쁘게 나와요.',
      '데이트 코스로 가기 좋은 분위기라서 재방문하고 싶은 곳이에요.',
    ],
  },
  {
    id: 'map-3',
    name: '짬뽕관',
    category: '중식',
    status: '영업 전',
    imageUri: CARD_IMAGE_3,
    markerX: 184,
    markerY: 398,
    reviews: [
      '국물 맛이 진하고 불향이 살아 있어서 매운 음식 좋아하면 만족해요.',
      '해장하러 가기에도 좋아서 근처 오면 자주 찾게 되는 곳이에요.',
    ],
  },
  {
    id: 'map-4',
    name: '수지국수 용인점',
    category: '한식',
    status: '영업 중',
    imageUri: CARD_IMAGE_4,
    markerX: 132,
    markerY: 286,
    reviews: [
      '김치말이국수랑 만두 조합이 시원하고 깔끔해서 더운 날 특히 좋아요.',
      '가성비가 좋고 부담 없이 한 끼 먹기 편해서 자주 생각나는 집이에요.',
    ],
  },
  {
    id: 'map-5',
    name: '식용유정',
    category: '중식',
    status: '영업 전',
    imageUri: CARD_IMAGE_5,
    markerX: 286,
    markerY: 468,
    reviews: [
      '볶음밥이 고슬고슬하고 짜장 소스가 진해서 계속 생각나는 맛이에요.',
      '매장도 깔끔하고 메뉴 구성이 좋아서 여러 명이 가도 만족도가 높아요.',
    ],
  },
];

type MapScreenProps = {
  onOpenRestaurantDetail?: (restaurantName: string) => void;
  onAddToList?: (restaurantName: string) => void;
  getFavoriteColor?: (restaurantName: string) => string;
  onPressSearchBar?: () => void;
  searchQuery?: string;
  onClearSearch?: () => void;
  onSelectTab: (tab: AppTab) => void;
};

export function MapScreen({
  onOpenRestaurantDetail,
  onAddToList,
  getFavoriteColor,
  onPressSearchBar,
  searchQuery = '',
  onClearSearch,
  onSelectTab,
}: MapScreenProps) {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const sheetContentBottomPadding = TAB_BAR_HEIGHT + insets.bottom + 24;
  const snapTops = useMemo(
    () => ({
      expanded: insets.top + 63,
      medium: Math.max(insets.top + 170, screenHeight - TAB_BAR_HEIGHT - insets.bottom - 300),
      collapsed: Math.max(
        insets.top + 372,
        screenHeight - TAB_BAR_HEIGHT - insets.bottom - 58,
      ),
    }),
    [insets.bottom, insets.top],
  );

  const sheetTop = useRef(new Animated.Value(snapTops.medium)).current;
  const mapTranslateX = useRef(new Animated.Value(0)).current;
  const mapTranslateY = useRef(new Animated.Value(0)).current;
  const mapScale = useRef(new Animated.Value(1)).current;
  const autoOpenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sheetStage, setSheetStage] = useState<SheetStage>('medium');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [focusedRestaurantId, setFocusedRestaurantId] = useState<string | null>(null);
  const [selectedMarkerRestaurantId, setSelectedMarkerRestaurantId] = useState<string | null>(null);
  const contentScrollOffsetRef = useRef(0);
  const panStartTopRef = useRef(snapTops.collapsed);
  const contentPanStartStageRef = useRef<SheetStage>('collapsed');
  const trimmedSearchQuery = searchQuery.trim();
  const mapWebUrl = useMemo(
    () =>
      trimmedSearchQuery
        ? `${NAVER_MAP_WEB_URL}/search/${encodeURIComponent(trimmedSearchQuery)}`
        : NAVER_MAP_WEB_URL,
    [trimmedSearchQuery],
  );

  const animateSheetTo = (stage: SheetStage) => {
    setSheetStage(stage);
    Animated.spring(sheetTop, {
      toValue: snapTops[stage],
      useNativeDriver: false,
      speed: 22,
      bounciness: 0,
    }).start();
  };

  const clearPendingAutoOpen = () => {
    if (autoOpenTimeoutRef.current) {
      clearTimeout(autoOpenTimeoutRef.current);
      autoOpenTimeoutRef.current = null;
    }
  };

  const animateMapToRestaurant = (restaurant: MapRestaurant | null) => {
    const targetX = 0;
    const targetY = 0;
    const targetScale = 1;

    Animated.parallel([
      Animated.timing(mapTranslateX, {
        toValue: targetX,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(mapTranslateY, {
        toValue: targetY,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(mapScale, {
        toValue: targetScale,
        duration: 420,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const focusRestaurant = (restaurant: MapRestaurant, autoOpen: boolean) => {
    clearPendingAutoOpen();
    setFocusedRestaurantId(restaurant.id);
    animateSheetTo('medium');
    animateMapToRestaurant(restaurant);

    if (!autoOpen) {
      return;
    }

    autoOpenTimeoutRef.current = setTimeout(() => {
      onOpenRestaurantDetail?.(restaurant.name);
      autoOpenTimeoutRef.current = null;
    }, 850);
  };

  const focusRestaurantAndOpenDetail = (restaurant: MapRestaurant) => {
    clearPendingAutoOpen();
    setFocusedRestaurantId(restaurant.id);
    animateSheetTo('medium');
    animateMapToRestaurant(restaurant);

    autoOpenTimeoutRef.current = setTimeout(() => {
      onOpenRestaurantDetail?.(restaurant.name);
      autoOpenTimeoutRef.current = null;
    }, 520);
  };

  const baseFilteredRestaurants = useMemo(() => {
    let results = mapRestaurants;

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

    const filteredResults = results.filter(
      (restaurant) =>
        activeFilters.includes(restaurant.status) || activeFilters.includes(restaurant.category),
    );
    return filteredResults;
  }, [activeFilters, trimmedSearchQuery]);

  const visibleRestaurants = useMemo(() => {
    if (selectedMarkerRestaurantId) {
      return mapRestaurants.filter((restaurant) => restaurant.id === selectedMarkerRestaurantId);
    }

    return baseFilteredRestaurants;
  }, [baseFilteredRestaurants, selectedMarkerRestaurantId]);

  useEffect(() => {
    clearPendingAutoOpen();

    if (!trimmedSearchQuery) {
      if (!selectedMarkerRestaurantId) {
        setFocusedRestaurantId(null);
        animateMapToRestaurant(null);
      }
      return;
    }

    if (visibleRestaurants.length === 0) {
      setFocusedRestaurantId(null);
      animateSheetTo('medium');
      animateMapToRestaurant(null);
      return;
    }

    if (visibleRestaurants.length === 1) {
      focusRestaurant(visibleRestaurants[0], false);
      return;
    }

    setFocusedRestaurantId(visibleRestaurants[0].id);
    animateSheetTo('medium');
    animateMapToRestaurant(visibleRestaurants[0]);
  }, [
    trimmedSearchQuery,
    visibleRestaurants,
    selectedMarkerRestaurantId,
  ]);

  useEffect(() => {
    return () => {
      clearPendingAutoOpen();
    };
  }, []);

  const toggleFilter = (filter: string) => {
    setActiveFilters((current) =>
      current.includes(filter)
        ? current.filter((item) => item !== filter)
        : [...current, filter],
    );
  };

  const handlePressMarker = (restaurant: MapRestaurant) => {
    clearPendingAutoOpen();
    setFocusedRestaurantId(restaurant.id);
    setSelectedMarkerRestaurantId(restaurant.id);
    animateSheetTo('medium');
    animateMapToRestaurant(restaurant);
  };

  const handlePressClear = () => {
    clearPendingAutoOpen();
    animateSheetTo('medium');
    onClearSearch?.();
  };

  const handlePressMapBackground = () => {
    clearPendingAutoOpen();
    setSelectedMarkerRestaurantId(null);
    setFocusedRestaurantId(baseFilteredRestaurants[0]?.id ?? null);
    animateSheetTo('medium');
    animateMapToRestaurant(null);
  };

  const handlePressLocationButton = () => {
    webViewRef.current?.reload();
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
    outputRange: [0, 0.8, 1],
  });

  const currentLocationTranslateY = sheetTop.interpolate({
    inputRange: [snapTops.expanded, snapTops.collapsed],
    outputRange: [-12, 0],
  });

  const currentLocationTop = sheetTop.interpolate({
    inputRange: [snapTops.expanded, snapTops.medium, snapTops.collapsed],
    outputRange: [snapTops.expanded - 40, snapTops.medium - 54, snapTops.collapsed - 54],
    extrapolate: 'clamp',
  });

  const topBackdropOpacity = sheetTop.interpolate({
    inputRange: [snapTops.expanded, snapTops.medium],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const topBackdropHeight = sheetTop.interpolate({
    inputRange: [snapTops.expanded, snapTops.medium],
    outputRange: [snapTops.expanded + 2, 0],
    extrapolate: 'clamp',
  });

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <View style={styles.screen}>
        <View style={styles.mapPressLayer}>
          <Animated.View
            style={[
              styles.mapLayer,
              {
                transform: [
                  { translateX: mapTranslateX },
                  { translateY: mapTranslateY },
                  { scale: mapScale },
                ],
              },
            ]}
          >
            <WebView
              ref={webViewRef}
              source={{ uri: mapWebUrl }}
              style={styles.mapWebView}
              allowsBackForwardNavigationGestures
              bounces={false}
              javaScriptEnabled
              setSupportMultipleWindows={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
            />
          </Animated.View>
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
            { top: insets.top + 14 },
          ]}
          onPress={onPressSearchBar}
        >
          <SearchIcon width={24} height={24} color="#000000" />
          <Text
            numberOfLines={1}
            style={[styles.searchText, !trimmedSearchQuery && styles.searchPlaceholder]}
          >
            {trimmedSearchQuery || '어떤 맛집을 찾으시나요?'}
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
            <View style={styles.locationIconWrap}>
              <MyLocationIcon width={24} height={24} />
            </View>
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
                >
                  <FilterIcon
                    width={14}
                    height={16}
                    color={hasActiveFilters ? '#FF0000' : '#9B9B9B'}
                  />
                </Pressable>
                {FILTER_OPTIONS.map((filter) => {
                  const active = activeFilters.includes(filter);
                  return (
                    <Pressable
                      key={filter}
                      style={[styles.filterChip, active && styles.filterChipActive]}
                      onPress={() => toggleFilter(filter)}
                    >
                      <Text style={[styles.filterChipLabel, active && styles.filterChipLabelActive]}>
                        {filter}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View style={styles.cardList}>
                {visibleRestaurants.map((restaurant) => (
                  <View key={restaurant.id} style={styles.restaurantBlock}>
                      <Pressable
                        style={styles.cardHeader}
                        onPress={() => focusRestaurantAndOpenDetail(restaurant)}
                      >
                      <Image source={{ uri: restaurant.imageUri }} style={styles.cardImage} />
                      <View style={styles.cardHeaderCopy}>
                        <Text style={styles.cardTitle}>{restaurant.name}</Text>
                        <Text style={styles.cardMeta}>
                          {restaurant.category} · {restaurant.status}
                        </Text>
                      </View>
                      <Pressable
                        hitSlop={8}
                        onPress={(event) => {
                          event.stopPropagation();
                          onAddToList?.(restaurant.name);
                        }}
                      >
                        <StarIcon
                          width={22}
                          height={22}
                          color={getFavoriteColor?.(restaurant.name) ?? '#D9D9D9'}
                        />
                      </Pressable>
                    </Pressable>

                    <View style={styles.reviewRow}>
                      <ScrollView
                        horizontal
                        nestedScrollEnabled
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.reviewScrollContent}
                      >
                        {restaurant.reviews.slice(0, 4).map((review, index) => (
                          <View key={`${restaurant.id}-review-${index}`} style={styles.reviewBox}>
                            <Text numberOfLines={2} style={styles.reviewText}>
                              {review}
                            </Text>
                          </View>
                        ))}
                      </ScrollView>
                    </View>

                    <View style={styles.divider} />
                  </View>
                ))}

                {visibleRestaurants.length === 0 ? (
                  <View style={styles.emptyResult}>
                    <Text style={styles.emptyResultTitle}>검색 결과가 없어요</Text>
                    <Text style={styles.emptyResultBody}>
                      다른 지역이나 음식점 이름으로 다시 검색해보세요.
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
  mapPressLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  mapBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  mapWebView: {
    ...StyleSheet.absoluteFillObject,
  },
  markerWrap: {
    position: 'absolute',
    width: 24,
    alignItems: 'center',
  },
  markerHead: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF5A5A',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  markerHeadActive: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF0000',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  markerStem: {
    width: 3,
    height: 13,
    marginBottom: -2,
    borderRadius: 2,
    backgroundColor: '#FF5A5A',
  },
  markerStemActive: {
    backgroundColor: '#FF0000',
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
    left: 15,
    right: 16,
    height: 46,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    gap: 10,
    zIndex: 4,
  },
  searchBarExpanded: {
    borderColor: '#DDDDDD',
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  searchBarFloating: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  searchText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  searchPlaceholder: {
    color: '#D9D9D9',
  },
  clearSearchButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearSearchLabel: {
    fontSize: 21,
    lineHeight: 21,
    fontWeight: '300',
    color: '#9B9B9B',
  },
  locationButton: {
    position: 'absolute',
    left: 12,
    zIndex: 3,
  },
  locationButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  locationIconWrap: {
    transform: [{ translateX: 0.75 }],
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 12,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 7,
    paddingBottom: 15,
  },
  handleBar: {
    width: 32,
    height: 2,
    borderRadius: 2,
    backgroundColor: '#D9D9D9',
  },
  sheetScrollWrap: {
    flex: 1,
  },
  sheetContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 15,
  },
  filterRow: {
    alignItems: 'center',
    gap: 10,
    paddingBottom: 10,
  },
  filterIconButton: {
    width: 28,
    height: 28,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#DDDDDD',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIconButtonActive: {
    borderColor: '#FF0000',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  filterChip: {
    height: 28,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#DDDDDD',
    paddingHorizontal: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  filterChipActive: {
    borderColor: '#FF0000',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  filterChipLabel: {
    fontSize: 13,
    lineHeight: 22,
    fontWeight: '400',
    color: '#9B9B9B',
  },
  filterChipLabelActive: {
    color: '#FF0000',
  },
  cardList: {
    gap: 10,
  },
  restaurantBlock: {
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  cardImage: {
    width: 58,
    height: 58,
    borderRadius: 6,
  },
  cardHeaderCopy: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '500',
    color: '#FF0000',
  },
  cardMeta: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '500',
    color: '#838383',
  },
  reviewRow: {
    marginRight: -16,
  },
  reviewScrollContent: {
    paddingRight: 0,
    gap: 10,
  },
  reviewBox: {
    width: REVIEW_CARD_WIDTH,
    minHeight: 40,
    borderRadius: 4,
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  reviewText: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '300',
    color: '#000000',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#F8F8F8',
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
