import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';
import SearchIcon from '../../assets/icons/search.svg';
import { mapRestaurantSearchResults, searchRestaurants } from '../api/wagu';

type SearchResultTab = 'restaurant' | 'user' | 'region';

type SearchResultScreenProps = {
  accessToken?: string | null;
  onBack: () => void;
  initialTab?: SearchResultTab;
  onChangeTab?: (tab: SearchResultTab) => void;
  onOpenRestaurantDetail?: (restaurantName: string) => void;
  onOpenUserProfile?: (userId: string) => void;
  onSearch?: (query: string) => void;
  onPressSearchBar?: () => void;
  query: string;
};

type RestaurantResult = {
  id: string;
  category: string;
  imageUri?: string;
  name: string;
};

const { width: screenWidth } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const CONTENT_WIDTH = screenWidth - HORIZONTAL_PADDING * 2;
const TAB_WIDTH = 56;
const TAB_SIDE_PADDING = 7;
const TAB_INDICATOR_WIDTH = 40;
const TAB_ROW_WIDTH = CONTENT_WIDTH - TAB_SIDE_PADDING * 2;
const TAB_GAP = (TAB_ROW_WIDTH - TAB_WIDTH * 3) / 2;

const tabs: { id: SearchResultTab; label: string }[] = [
  { id: 'restaurant', label: '맛집' },
  { id: 'user', label: '유저' },
  { id: 'region', label: '지역' },
];

function ResultList({
  items,
  onPressItem,
}: {
  items: { id: string; imageUri?: string; name: string; meta: string }[];
  onPressItem?: (id: string, name: string) => void;
}) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      onScrollBeginDrag={Keyboard.dismiss}
      contentContainerStyle={styles.listContent}
    >
      {items.map((item) => (
        <Pressable
          key={item.id}
          style={styles.resultRow}
          onPress={() => onPressItem?.(item.id, item.name)}
        >
          <View style={styles.thumbnail}>
            {item.imageUri ? (
              <Image source={{ uri: item.imageUri }} style={styles.thumbnailImage} resizeMode="cover" />
            ) : null}
          </View>
          <View style={styles.resultCopy}>
            <Text style={styles.resultName}>{item.name}</Text>
            <Text style={styles.resultMeta}>{item.meta}</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function EmptyTabState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View style={styles.emptyTabState}>
      <Text style={styles.emptyTabTitle}>{title}</Text>
      <Text style={styles.emptyTabDescription}>{description}</Text>
    </View>
  );
}

export function SearchResultScreen({
  accessToken,
  onBack,
  initialTab = 'restaurant',
  onChangeTab,
  onOpenRestaurantDetail,
  onOpenUserProfile,
  onSearch,
  onPressSearchBar,
  query,
}: SearchResultScreenProps) {
  const inputRef = useRef<TextInput | null>(null);
  const pagerRef = useRef<ScrollView | null>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [value, setValue] = useState(query);
  const [activeTab, setActiveTab] = useState<SearchResultTab>(initialTab);
  const [restaurantResults, setRestaurantResults] = useState<RestaurantResult[]>([]);
  const [isRestaurantLoading, setIsRestaurantLoading] = useState(false);

  useEffect(() => {
    setValue(query);
  }, [query]);

  useEffect(() => {
    const nextIndex = tabs.findIndex((item) => item.id === initialTab);
    setActiveTab(initialTab);
    scrollX.setValue(nextIndex * CONTENT_WIDTH);
    requestAnimationFrame(() => {
      pagerRef.current?.scrollTo({ x: nextIndex * CONTENT_WIDTH, animated: false });
    });
  }, [initialTab, scrollX]);

  useEffect(() => {
    if (!accessToken || !query.trim()) {
      setRestaurantResults([]);
      setIsRestaurantLoading(false);
      return;
    }

    let cancelled = false;

    const loadResults = async () => {
      setIsRestaurantLoading(true);

      try {
        const restaurants = await searchRestaurants(accessToken, query.trim());
        const mappedResults = mapRestaurantSearchResults(restaurants).map((restaurant) => ({
          id: restaurant.id,
          category: restaurant.category,
          imageUri: restaurant.imageUri,
          name: restaurant.name,
        }));

        if (!cancelled) {
          setRestaurantResults(mappedResults);
        }
      } catch {
        if (!cancelled) {
          setRestaurantResults([]);
        }
      } finally {
        if (!cancelled) {
          setIsRestaurantLoading(false);
        }
      }
    };

    void loadResults();

    return () => {
      cancelled = true;
    };
  }, [accessToken, query]);

  const trimmedValue = value.trim();

  const indicatorTranslateX = scrollX.interpolate({
    inputRange: tabs.map((_, index) => index * CONTENT_WIDTH),
    outputRange: tabs.map(
      (_, index) => index * (TAB_WIDTH + TAB_GAP) + (TAB_WIDTH - TAB_INDICATOR_WIDTH) / 2,
    ),
    extrapolate: 'clamp',
  });

  const handleSearchSubmit = () => {
    if (!trimmedValue) {
      return;
    }

    onSearch?.(trimmedValue);
    Keyboard.dismiss();
  };

  const handlePressTab = (tab: SearchResultTab) => {
    const nextIndex = tabs.findIndex((item) => item.id === tab);
    pagerRef.current?.scrollTo({ x: nextIndex * CONTENT_WIDTH, animated: true });
    setActiveTab(tab);
    onChangeTab?.(tab);
  };

  const handlePagerMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / CONTENT_WIDTH);
    const nextTab = tabs[nextIndex]?.id ?? 'restaurant';
    setActiveTab(nextTab);
    onChangeTab?.(nextTab);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.screen}>
          <View style={styles.topRow}>
            <Pressable style={styles.backButton} onPress={onBack}>
              <ArrowLeftIcon width={24} height={24} />
            </Pressable>

            <Pressable
              style={styles.searchBar}
              onPress={() => {
                if (onPressSearchBar) {
                  onPressSearchBar();
                  return;
                }

                inputRef.current?.focus();
              }}
            >
              <SearchIcon width={24} height={24} color="#FF0000" />
              <View style={styles.inputWrap}>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  value={value}
                  onChangeText={setValue}
                  editable={!onPressSearchBar}
                  placeholder="맛집 / 유저 / 지역을 검색해보세요"
                  placeholderTextColor="#D9D9D9"
                  selectionColor="#FF0000"
                  returnKeyType="search"
                  onSubmitEditing={handleSearchSubmit}
                />
              </View>
            </Pressable>
          </View>

          <View style={styles.tabSection}>
            <View style={styles.tabRow}>
              {tabs.map((tab) => (
                <Pressable key={tab.id} style={styles.tabButton} onPress={() => handlePressTab(tab.id)}>
                  <Text
                    numberOfLines={1}
                    style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.tabDivider}>
              <Animated.View
                style={[
                  styles.activeTabIndicator,
                  { transform: [{ translateX: indicatorTranslateX }] },
                ]}
              />
            </View>
          </View>

          <View style={styles.contentArea}>
            <Animated.ScrollView
              ref={pagerRef}
              horizontal
              pagingEnabled
              bounces={false}
              directionalLockEnabled
              disableIntervalMomentum
              decelerationRate="fast"
              overScrollMode="never"
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              onScrollBeginDrag={Keyboard.dismiss}
              onMomentumScrollEnd={handlePagerMomentumEnd}
              onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                useNativeDriver: true,
              })}
            >
              <View style={styles.page}>
                {isRestaurantLoading ? (
                  <View style={styles.loadingState}>
                    <ActivityIndicator size="small" color="#FF0000" />
                    <Text style={styles.loadingText}>검색 결과를 불러오는 중이에요.</Text>
                  </View>
                ) : restaurantResults.length > 0 ? (
                  <ResultList
                    items={restaurantResults.map((item) => ({
                      id: item.id,
                      imageUri: item.imageUri,
                      name: item.name,
                      meta: item.category,
                    }))}
                    onPressItem={(_, name) => onOpenRestaurantDetail?.(name)}
                  />
                ) : (
                  <EmptyTabState
                    title="맛집 검색 결과가 없어요"
                    description="다른 검색어로 다시 찾아보세요."
                  />
                )}
              </View>
              <View style={styles.page}>
                <EmptyTabState
                  title="유저 검색은 아직 준비 중이에요"
                  description="지금은 맛집 검색 결과만 확인할 수 있어요."
                />
              </View>
              <View style={styles.page}>
                <EmptyTabState
                  title="지역 검색은 아직 준비 중이에요"
                  description="조금 더 다듬은 뒤 연결할게요."
                />
              </View>
            </Animated.ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 25,
    gap: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flex: 1,
    height: 46,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#FF0000',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 15,
  },
  input: {
    width: '100%',
    height: 22,
    paddingVertical: 0,
    paddingTop: 0,
    paddingBottom: 0,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    color: '#000000',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  inputWrap: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  tabSection: {
    marginTop: 25,
    gap: 0,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: TAB_SIDE_PADDING,
  },
  tabButton: {
    width: TAB_WIDTH,
    alignItems: 'center',
    paddingBottom: 7,
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '500',
    color: '#838383',
    textAlign: 'center',
  },
  activeTabLabel: {
    color: '#000000',
  },
  tabDivider: {
    height: 1,
    backgroundColor: '#D9D9D9',
    marginHorizontal: -HORIZONTAL_PADDING,
  },
  activeTabIndicator: {
    position: 'absolute',
    left: HORIZONTAL_PADDING + TAB_SIDE_PADDING,
    top: -1,
    width: TAB_INDICATOR_WIDTH,
    height: 2,
    backgroundColor: '#000000',
  },
  contentArea: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  page: {
    width: CONTENT_WIDTH,
    flex: 1,
  },
  listContent: {
    gap: 15,
    paddingTop: 10,
    paddingBottom: 52,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  thumbnail: {
    width: 58,
    height: 58,
    borderRadius: 6,
    backgroundColor: '#C4C4C4',
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  resultCopy: {
    gap: 3,
  },
  resultName: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '500',
    color: '#000000',
  },
  resultMeta: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '500',
    color: '#838383',
  },
  emptyTabState: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyTabTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  emptyTabDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: '#838383',
    textAlign: 'center',
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: '#838383',
  },
});
