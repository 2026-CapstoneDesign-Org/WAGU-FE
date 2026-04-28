import { useEffect, useRef, useState } from 'react';
import {
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

type SearchResultTab = 'restaurant' | 'user' | 'region' | 'photo';

type SearchResultScreenProps = {
  onBack: () => void;
  onOpenRestaurantDetail?: (restaurantName: string) => void;
  onSearch?: (query: string) => void;
  query: string;
};

type RestaurantResult = {
  id: string;
  category: string;
  imageUri?: string;
  name: string;
};

type UserResult = {
  id: string;
  imageUri?: string;
  meta: string;
  name: string;
};

const { width: screenWidth } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const CONTENT_WIDTH = screenWidth - HORIZONTAL_PADDING * 2;
const TAB_WIDTH = 44;
const TAB_SIDE_PADDING = 7;
const TAB_INDICATOR_WIDTH = 30;
const TAB_ROW_WIDTH = CONTENT_WIDTH - TAB_SIDE_PADDING * 2;
const TAB_GAP = (TAB_ROW_WIDTH - TAB_WIDTH * 4) / 3;

const RESTAURANT_RESULTS: RestaurantResult[] = [
  {
    id: 'restaurant-1',
    name: '와이앤웍',
    category: '중식',
    imageUri: 'https://www.figma.com/api/mcp/asset/1a840367-09b2-49be-a810-431227e3f3ea',
  },
  {
    id: 'restaurant-2',
    name: '미식회관',
    category: '양식',
    imageUri: 'https://www.figma.com/api/mcp/asset/ce6e1e19-5b29-4d38-b345-02deac7fe55c',
  },
  {
    id: 'restaurant-3',
    name: '짬뽕관',
    category: '중식',
    imageUri: 'https://www.figma.com/api/mcp/asset/b62383c8-bf7d-4eed-8037-fb3766e20848',
  },
  {
    id: 'restaurant-4',
    name: '제주둘레국수',
    category: '한식',
    imageUri: 'https://www.figma.com/api/mcp/asset/9e567790-321f-46ed-b189-58f91d3c32f9',
  },
  { id: 'restaurant-5', name: '스시몬', category: '일식' },
  { id: 'restaurant-6', name: '카레마스터', category: '인도식' },
  { id: 'restaurant-7', name: '오븐스테이크', category: '양식' },
  { id: 'restaurant-8', name: '샤브샤브하우스', category: '중식' },
  { id: 'restaurant-9', name: '타코하우스', category: '멕시코식' },
  { id: 'restaurant-10', name: '온더테이블', category: '브런치' },
  { id: 'restaurant-11', name: '라멘공방', category: '일식' },
  { id: 'restaurant-12', name: '하남돼지집', category: '한식' },
  { id: 'restaurant-13', name: '버거스튜디오', category: '양식' },
  { id: 'restaurant-14', name: '포메인', category: '베트남식' },
  { id: 'restaurant-15', name: '마라천국', category: '중식' },
  { id: 'restaurant-16', name: '정성식당', category: '한식' },
];

const USER_RESULTS: UserResult[] = [
  {
    id: 'user-1',
    name: '용인맛집러',
    meta: '리뷰 · 46',
    imageUri: 'https://www.figma.com/api/mcp/asset/8da6a8b8-526c-45c9-aac5-c222ae166f41',
  },
  {
    id: 'user-2',
    name: 'JUnn',
    meta: '리뷰 · 21',
    imageUri: 'https://www.figma.com/api/mcp/asset/73c13bc3-435f-4d23-a011-2247291949e1',
  },
  {
    id: 'user-3',
    name: '강남치맥',
    meta: '리뷰 · 118',
    imageUri: 'https://www.figma.com/api/mcp/asset/bc373354-5752-4f1f-85a8-5d980b97a795',
  },
  {
    id: 'user-4',
    name: '다주',
    meta: '리뷰 · 641',
    imageUri: 'https://www.figma.com/api/mcp/asset/acbbdd90-dfd7-4079-a0ce-49c497d8773c',
  },
  {
    id: 'user-5',
    name: '서울떡볶이',
    meta: '리뷰 · 89',
    imageUri: 'https://www.figma.com/api/mcp/asset/8da6a8b8-526c-45c9-aac5-c222ae166f41',
  },
  {
    id: 'user-6',
    name: '부산해물탕',
    meta: '리뷰 · 34',
    imageUri: 'https://www.figma.com/api/mcp/asset/73c13bc3-435f-4d23-a011-2247291949e1',
  },
  {
    id: 'user-7',
    name: '전주비빔밥',
    meta: '리뷰 · 76',
    imageUri: 'https://www.figma.com/api/mcp/asset/bc373354-5752-4f1f-85a8-5d980b97a795',
  },
  {
    id: 'user-8',
    name: '홍대브런치',
    meta: '리뷰 · 55',
    imageUri: 'https://www.figma.com/api/mcp/asset/acbbdd90-dfd7-4079-a0ce-49c497d8773c',
  },
  {
    id: 'user-9',
    name: '인천회타운',
    meta: '리뷰 · 112',
    imageUri: 'https://www.figma.com/api/mcp/asset/8da6a8b8-526c-45c9-aac5-c222ae166f41',
  },
  {
    id: 'user-10',
    name: '대전칼국수',
    meta: '리뷰 · 92',
    imageUri: 'https://www.figma.com/api/mcp/asset/73c13bc3-435f-4d23-a011-2247291949e1',
  },
];

const tabs: { id: SearchResultTab; label: string }[] = [
  { id: 'restaurant', label: '맛집' },
  { id: 'user', label: '유저' },
  { id: 'region', label: '지역' },
  { id: 'photo', label: '사진' },
];

function ResultList({
  items,
  onPressItem,
}: {
  items: { id: string; imageUri?: string; name: string; meta: string }[];
  onPressItem?: (name: string) => void;
}) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.listContent}
    >
      {items.map((item) => (
        <Pressable
          key={item.id}
          style={styles.resultRow}
          onPress={() => onPressItem?.(item.name)}
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

function EmptyTabState() {
  return <View style={styles.emptyTabState} />;
}

export function SearchResultScreen({
  onBack,
  onOpenRestaurantDetail,
  onSearch,
  query,
}: SearchResultScreenProps) {
  const inputRef = useRef<TextInput | null>(null);
  const pagerRef = useRef<ScrollView | null>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [value, setValue] = useState(query);
  const [activeTab, setActiveTab] = useState<SearchResultTab>('restaurant');

  useEffect(() => {
    setValue(query);
  }, [query]);

  const trimmedValue = value.trim();

  const indicatorTranslateX = scrollX.interpolate({
    inputRange: tabs.map((_, index) => index * CONTENT_WIDTH),
    outputRange: tabs.map(
      (_, index) => index * (TAB_WIDTH + TAB_GAP) + (TAB_WIDTH - TAB_INDICATOR_WIDTH) / 2
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
  };

  const handlePagerMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / CONTENT_WIDTH);
    setActiveTab(tabs[nextIndex]?.id ?? 'restaurant');
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.screen} onPress={Keyboard.dismiss}>
          <View style={styles.topRow}>
            <Pressable style={styles.backButton} onPress={onBack}>
              <ArrowLeftIcon width={24} height={24} />
            </Pressable>

            <Pressable style={styles.searchBar} onPress={() => inputRef.current?.focus()}>
              <SearchIcon width={24} height={24} color="#FF0000" />
              <View style={styles.inputWrap}>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  value={value}
                  onChangeText={setValue}
                  placeholder="맛집 / 유저 / 지역을 검색해보세요."
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
                <Pressable
                  key={tab.id}
                  style={styles.tabButton}
                  onPress={() => handlePressTab(tab.id)}
                >
                  <Text
                    style={[
                      styles.tabLabel,
                      activeTab === tab.id && styles.activeTabLabel,
                    ]}
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
              overScrollMode="never"
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              onMomentumScrollEnd={handlePagerMomentumEnd}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: true }
              )}
            >
              <View style={styles.page}>
                <ResultList
                  items={RESTAURANT_RESULTS.map((item) => ({
                    id: item.id,
                    imageUri: item.imageUri,
                    name: item.name,
                    meta: item.category,
                  }))}
                  onPressItem={onOpenRestaurantDetail}
                />
              </View>
              <View style={styles.page}>
                <ResultList items={USER_RESULTS} />
              </View>
              <View style={styles.page}>
                <EmptyTabState />
              </View>
              <View style={styles.page}>
                <EmptyTabState />
              </View>
            </Animated.ScrollView>
          </View>
        </Pressable>
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
    paddingHorizontal: 8,
  },
  tabLabel: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '500',
    color: '#838383',
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
    paddingBottom: 24,
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
  },
});
