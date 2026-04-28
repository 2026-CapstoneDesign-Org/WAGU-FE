import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';
import ClockIcon from '../../assets/icons/clock.svg';
import LocationIcon from '../../assets/icons/location.svg';
import PhoneIcon from '../../assets/icons/phone.svg';
import ShopIcon from '../../assets/icons/shop.svg';
import StarIcon from '../../assets/icons/star.svg';
import { RestaurantMenuItem, restaurants } from '../data/restaurants';
import { RestaurantReview, restaurantReviews } from '../data/restaurantReviews';

type RestaurantDetailTab = 'home' | 'menu' | 'review' | 'photo';
type ReviewSort = 'latest' | 'popular';

type RestaurantDetailScreenProps = {
  onBack: () => void;
  restaurantName?: string;
};

type RestaurantMeta = {
  category: string;
  photoUris: string[];
  reviewCount: string;
  address: string;
  openingHours: string;
  phone: string;
  features: string;
  menuItems: RestaurantMenuItem[];
};

type TabScrollProps = {
  scrollEnabled: boolean;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

const { width: screenWidth } = Dimensions.get('window');

const HORIZONTAL_PADDING = 16;
const TAB_SIDE_PADDING = 13;
const TAB_WIDTH = 34;
const TAB_INDICATOR_WIDTH = 31;
const TAB_ROW_WIDTH = screenWidth - HORIZONTAL_PADDING * 2 - TAB_SIDE_PADDING * 2;
const TAB_GAP = (TAB_ROW_WIDTH - TAB_WIDTH * 4) / 3;
const PHOTO_CARD_SIZE = (screenWidth - HORIZONTAL_PADDING * 2 - 6) / 2;
const PHOTO_LOAD_BATCH = 10;
const HERO_HEIGHT = 284;
const COLLAPSE_TRIGGER = 18;
const EXPAND_TRIGGER = -18;
const HERO_TRANSITION_MS = 280;

const tabs: { id: RestaurantDetailTab; label: string }[] = [
  { id: 'home', label: '홈' },
  { id: 'menu', label: '메뉴' },
  { id: 'review', label: '리뷰' },
  { id: 'photo', label: '사진' },
];

const defaultMenuItems: RestaurantMenuItem[] = [
  {
    id: 'menu-1',
    name: '짜장면',
    description:
      '진하게 볶아낸 춘장이 면에 착 감기며 고소함이 퍼져 부드럽게 어우러진 짜장면',
    price: '7,500원',
  },
  {
    id: 'menu-2',
    name: '매운 짜장면',
    description: '짜장 소스가 달콤하게 퍼지다가 뚫고 나오는 청양의 알싸함',
    price: '8,500원',
  },
  {
    id: 'menu-3',
    name: '삼선간짜장',
    description: '짜장 속 탱탱한 오징어와 새우가 입안에서 탁 터지는 맛',
    price: '9,500원',
  },
  {
    id: 'menu-4',
    name: '매운고추짬뽕',
    description:
      '입안을 휘감는 매운 향과 불향의 진한 여운, 처음엔 시원하게, 끝엔 얼얼하게',
    price: '11,000원',
  },
  {
    id: 'menu-5',
    name: '차돌짬뽕',
    description: '국물은 칼칼, 고기는 고소, 둘이 만나 감칠맛 폭발',
    price: '13,000원',
  },
  {
    id: 'menu-6',
    name: '크림새우',
    description: '겉은 바삭, 속은 탱글, 새우 위에 달콤한 크림이 사르르',
    price: '14,000원',
  },
];

const defaultRestaurantMeta: RestaurantMeta = {
  category: '중식',
  photoUris: [],
  reviewCount: '3,643',
  address: '경기 용인시 처인구 명지로60번길 15-29 102호',
  openingHours: '브레이크타임 · 17:00에 영업 시작',
  phone: '0507-1494-0341',
  features:
    '포장, 배달, 무선 인터넷, 예약, 남/녀 화장실 구분, 단체 이용 가능',
  menuItems: defaultMenuItems,
};

const restaurantMetaByName: Record<string, Partial<RestaurantMeta>> = {
  와이앤웍: {
    category: '중식',
    photoUris: [],
    reviewCount: '3,643',
    address: '경기 용인시 처인구 명지로60번길 15-29 102호',
    openingHours: '브레이크타임 · 17:00에 영업 시작',
    phone: '0507-1494-0341',
    features:
      '포장, 배달, 무선 인터넷, 예약, 남/녀 화장실 구분, 단체 이용 가능',
    menuItems: defaultMenuItems,
  },
  '와이앤웍 용인직영점': {
    category: '중식',
    photoUris: [],
    reviewCount: '3,643',
    address: '경기 용인시 처인구 명지로60번길 15-29 102호',
    openingHours: '브레이크타임 · 17:00에 영업 시작',
    phone: '0507-1494-0341',
    features:
      '포장, 배달, 무선 인터넷, 예약, 남/녀 화장실 구분, 단체 이용 가능',
    menuItems: defaultMenuItems,
  },
  미식공간: {
    category: '양식',
    photoUris: [],
    reviewCount: '2,148',
    address: '경기 용인시 수지구 현암로 148 2층',
    openingHours: '매일 11:30 - 22:00',
    phone: '0507-1380-2214',
    features: '예약, 포장, 무선 인터넷, 주차, 남/녀 화장실 구분',
    menuItems: [
      {
        id: 'menu-1',
        name: '트러플 크림 파스타',
        description: '트러플 향이 은은하게 번지는 부드러운 크림 파스타',
        price: '16,000원',
      },
      {
        id: 'menu-2',
        name: '부라타 샐러드',
        description: '상큼한 토마토와 부라타 치즈가 어우러진 시그니처 샐러드',
        price: '15,000원',
      },
      {
        id: 'menu-3',
        name: '채끝 스테이크',
        description: '육즙 가득한 채끝을 미디엄 레어로 구워낸 대표 메뉴',
        price: '34,000원',
      },
    ],
  },
  미식회관: {
    category: '양식',
    photoUris: [],
    reviewCount: '2,148',
    address: '경기 용인시 수지구 현암로 148 2층',
    openingHours: '매일 11:30 - 22:00',
    phone: '0507-1380-2214',
    features: '예약, 포장, 무선 인터넷, 주차, 남/녀 화장실 구분',
    menuItems: [
      {
        id: 'menu-1',
        name: '트러플 크림 파스타',
        description: '트러플 향이 은은하게 번지는 부드러운 크림 파스타',
        price: '16,000원',
      },
      {
        id: 'menu-2',
        name: '부라타 샐러드',
        description: '상큼한 토마토와 부라타 치즈가 어우러진 시그니처 샐러드',
        price: '15,000원',
      },
      {
        id: 'menu-3',
        name: '채끝 스테이크',
        description: '육즙 가득한 채끝을 미디엄 레어로 구워낸 대표 메뉴',
        price: '34,000원',
      },
    ],
  },
  진미관: {
    category: '중식',
    photoUris: [],
    reviewCount: '1,086',
    address: '경기 용인시 기흥구 강남로 12',
    openingHours: '매일 10:30 - 21:30',
    phone: '031-222-1040',
    features: '포장, 배달, 유아의자, 단체 이용 가능',
    menuItems: defaultMenuItems,
  },
  제주하레국수: {
    category: '한식',
    photoUris: [],
    reviewCount: '954',
    address: '경기 용인시 수지구 풍덕천로 119',
    openingHours: '매일 10:00 - 20:00',
    phone: '031-555-0192',
    features: '포장, 유아의자, 대기공간, 무선 인터넷',
    menuItems: [
      {
        id: 'menu-1',
        name: '고기국수',
        description: '진한 사골 육수에 부드러운 수육이 올라간 제주식 국수',
        price: '9,500원',
      },
      {
        id: 'menu-2',
        name: '비빔국수',
        description: '새콤달콤한 양념이 매력적인 매콤한 제주식 비빔국수',
        price: '9,000원',
      },
      {
        id: 'menu-3',
        name: '돔베고기',
        description: '두툼하게 썬 제주식 삶은 돼지고기 한 접시',
        price: '18,000원',
      },
    ],
  },
  제주둘레국수: {
    category: '한식',
    photoUris: [],
    reviewCount: '954',
    address: '경기 용인시 수지구 풍덕천로 119',
    openingHours: '매일 10:00 - 20:00',
    phone: '031-555-0192',
    features: '포장, 유아의자, 대기공간, 무선 인터넷',
    menuItems: [
      {
        id: 'menu-1',
        name: '고기국수',
        description: '진한 사골 육수에 부드러운 수육이 올라간 제주식 국수',
        price: '9,500원',
      },
      {
        id: 'menu-2',
        name: '비빔국수',
        description: '새콤달콤한 양념이 매력적인 매콤한 제주식 비빔국수',
        price: '9,000원',
      },
      {
        id: 'menu-3',
        name: '돔베고기',
        description: '두툼하게 썬 제주식 삶은 돼지고기 한 접시',
        price: '18,000원',
      },
    ],
  },
};

function MenuList({ menuItems }: { menuItems: RestaurantMenuItem[] }) {
  return (
    <View style={styles.menuSection}>
      {menuItems.map((item, index) => (
        <View key={item.id}>
          <View style={styles.menuItem}>
            <Text style={styles.menuName}>{item.name}</Text>
            <Text style={styles.menuDescription}>{item.description}</Text>
            <Text style={styles.menuPrice}>{item.price}</Text>
          </View>
          {index < menuItems.length - 1 ? <View style={styles.menuDivider} /> : null}
        </View>
      ))}
    </View>
  );
}

function ThumbUpIcon({ color }: { color: string }) {
  return (
    <Text style={[styles.reactionIcon, { color }]}>👍</Text>
  );
}

function ThumbDownIcon({ color }: { color: string }) {
  return (
    <Text style={[styles.reactionIcon, { color }]}>👎</Text>
  );
}

function ReviewReactionButton({
  count,
  icon,
}: {
  count: number;
  icon: React.ReactNode;
}) {
  return (
    <View style={styles.reviewReactionButton}>
      {icon}
      <Text style={styles.reviewReactionCount}>{count}</Text>
    </View>
  );
}

function ReviewCard({ review }: { review: RestaurantReview }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewCardHeader}>
        <View style={styles.reviewAuthorRow}>
          <View style={styles.reviewAvatar} />
          <View style={styles.reviewAuthorCopy}>
            <Text style={styles.reviewAuthorName}>{review.authorName}</Text>
            <Text style={styles.reviewDate}>{review.date}</Text>
          </View>
        </View>

        <View style={styles.reviewReactionRow}>
          <ReviewReactionButton count={review.likes} icon={<ThumbUpIcon color="#666666" />} />
          <ReviewReactionButton
            count={review.dislikes}
            icon={<ThumbDownIcon color="#666666" />}
          />
        </View>
      </View>

      <Text style={styles.reviewText}>{review.content}</Text>

      {review.imageUris?.length ? (
        <View style={styles.reviewImageRow}>
          {review.imageUris.slice(0, 3).map((imageUri, index) => (
            <View key={`${review.id}-${index}`} style={styles.reviewImageCard}>
              <Text style={styles.reviewImagePlaceholder}>사진</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function BaseTabScroll({
  children,
  scrollEnabled,
  onScroll,
  fill,
}: React.PropsWithChildren<TabScrollProps & { fill?: boolean }>) {
  return (
    <ScrollView
      scrollEnabled={scrollEnabled}
      showsVerticalScrollIndicator={false}
      alwaysBounceVertical
      bounces
      contentContainerStyle={[styles.tabScrollContent, fill && styles.fillTabScrollContent]}
      scrollEventThrottle={16}
      onScroll={onScroll}
    >
      {children}
    </ScrollView>
  );
}

function HomeTabContent({
  restaurantMeta,
  scrollEnabled,
  onScroll,
  onPressMoreMenu,
}: {
  restaurantMeta: RestaurantMeta;
  onPressMoreMenu: () => void;
} & TabScrollProps) {
  return (
    <BaseTabScroll scrollEnabled={scrollEnabled} onScroll={onScroll}>
      <View style={styles.tabInner}>
        <View style={styles.infoList}>
          <View style={styles.infoRow}>
            <LocationIcon width={18} height={18} color="#C4C4C4" />
            <Text style={styles.infoText}>
              {restaurantMeta.address} <Text style={styles.linkText}>복사</Text>
            </Text>
          </View>

          <View style={styles.infoRow}>
            <ClockIcon width={18} height={18} color="#C4C4C4" />
            <Text style={styles.infoText}>{restaurantMeta.openingHours}</Text>
          </View>

          <View style={styles.infoRow}>
            <PhoneIcon width={18} height={18} color="#C4C4C4" />
            <Text style={styles.infoText}>
              {restaurantMeta.phone} <Text style={styles.linkText}>전화</Text>
            </Text>
          </View>

          <View style={styles.infoRow}>
            <ShopIcon width={18} height={18} color="#C4C4C4" />
            <Text style={styles.infoText}>{restaurantMeta.features}</Text>
          </View>
        </View>
      </View>

      <View style={styles.fullBleedDividerWrap}>
        <View style={styles.sectionDivider} />
      </View>

      <View style={styles.tabInner}>
        <Text style={styles.menuSectionTitle}>메뉴</Text>
        <MenuList menuItems={restaurantMeta.menuItems.slice(0, 4)} />
        {restaurantMeta.menuItems.length > 4 ? (
          <Pressable style={styles.moreMenuButton} onPress={onPressMoreMenu}>
            <Text style={styles.moreMenuButtonText}>더보기</Text>
          </Pressable>
        ) : null}
      </View>
    </BaseTabScroll>
  );
}

function MenuTabContent({
  restaurantMeta,
  scrollEnabled,
  onScroll,
}: {
  restaurantMeta: RestaurantMeta;
} & TabScrollProps) {
  return (
    <BaseTabScroll scrollEnabled={scrollEnabled} onScroll={onScroll}>
      <View style={styles.tabInner}>
        <MenuList menuItems={restaurantMeta.menuItems} />
      </View>
    </BaseTabScroll>
  );
}

function EmptyTabContent({ scrollEnabled, onScroll }: TabScrollProps) {
  return (
    <BaseTabScroll scrollEnabled={scrollEnabled} onScroll={onScroll} fill>
      <View style={styles.emptyTabContent} />
    </BaseTabScroll>
  );
}

function PhotoTabContent({ scrollEnabled, onScroll }: TabScrollProps) {
  return (
    <BaseTabScroll scrollEnabled={scrollEnabled} onScroll={onScroll}>
      <View style={styles.photoGrid} />
    </BaseTabScroll>
  );
}

function PhotoGalleryTabContent({
  visiblePhotoUris,
  scrollEnabled,
  onOpenPreview,
  onScroll,
}: {
  visiblePhotoUris: string[];
  onOpenPreview: (index: number) => void;
} & TabScrollProps) {
  return (
    <BaseTabScroll scrollEnabled={scrollEnabled} onScroll={onScroll}>
      <View style={styles.photoGrid}>
        {visiblePhotoUris.map((photoUri, index) => (
          <Pressable key={`${photoUri}-${index}`} onPress={() => onOpenPreview(index)}>
            <Image source={{ uri: photoUri }} style={styles.photoCard} />
          </Pressable>
        ))}
      </View>
    </BaseTabScroll>
  );
}

function ReviewTabContent({
  reviews,
  reviewSort,
  onChangeSort,
  scrollEnabled,
  onScroll,
}: {
  reviews: RestaurantReview[];
  reviewSort: ReviewSort;
  onChangeSort: (sort: ReviewSort) => void;
} & TabScrollProps) {
  return (
    <BaseTabScroll scrollEnabled={scrollEnabled} onScroll={onScroll}>
      <View style={styles.reviewTabInner}>
        <View style={styles.reviewSortRow}>
          <Pressable
            style={[
              styles.reviewSortButton,
              reviewSort === 'latest' && styles.reviewSortButtonActive,
            ]}
            onPress={() => onChangeSort('latest')}
          >
            <Text
              style={[
                styles.reviewSortLabel,
                reviewSort === 'latest' && styles.reviewSortLabelActive,
              ]}
            >
              최신순
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.reviewSortButton,
              reviewSort === 'popular' && styles.reviewSortButtonActive,
            ]}
            onPress={() => onChangeSort('popular')}
          >
            <Text
              style={[
                styles.reviewSortLabel,
                reviewSort === 'popular' && styles.reviewSortLabelActive,
              ]}
            >
              인기순
            </Text>
          </Pressable>
        </View>

        <View style={styles.reviewList}>
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <View key={review.id}>
                <ReviewCard review={review} />
                {index < reviews.length - 1 ? <View style={styles.reviewDivider} /> : null}
              </View>
            ))
          ) : (
            <View style={styles.emptyReviewState}>
              <Text style={styles.emptyReviewTitle}>아직 등록된 리뷰가 없어요</Text>
              <Text style={styles.emptyReviewDescription}>
                이 가게의 첫 리뷰를 남겨보세요.
              </Text>
            </View>
          )}
        </View>
      </View>
    </BaseTabScroll>
  );
}

export function RestaurantDetailScreen({
  onBack,
  restaurantName = '와이앤웍',
}: RestaurantDetailScreenProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const indicatorX = useRef(new Animated.Value(0)).current;
  const heroProgress = useRef(new Animated.Value(0)).current;
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHeroTransitioningRef = useRef(false);
  const previewScrollRef = useRef<ScrollView>(null);

  const [activeTab, setActiveTab] = useState<RestaurantDetailTab>('home');
  const [reviewSort, setReviewSort] = useState<ReviewSort>('latest');
  const [isHeroCollapsed, setIsHeroCollapsed] = useState(false);
  const [isTabScrollEnabled, setIsTabScrollEnabled] = useState(true);
  const [visiblePhotoCount, setVisiblePhotoCount] = useState(PHOTO_LOAD_BATCH);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [previewCurrentIndex, setPreviewCurrentIndex] = useState(0);
  const [previewImageSizes, setPreviewImageSizes] = useState<
    Record<string, { width: number; height: number }>
  >({});

  const restaurantMeta = useMemo(
    () => {
      const matchedRestaurant = restaurants.find(
        (item) => item.name === restaurantName || item.shortName === restaurantName,
      );
      const matchedMeta =
        restaurantMetaByName[restaurantName] ??
        (matchedRestaurant
          ? restaurantMetaByName[matchedRestaurant.name] ??
            restaurantMetaByName[matchedRestaurant.shortName]
          : undefined);

      return {
        ...defaultRestaurantMeta,
        ...(matchedRestaurant
          ? {
              category: matchedRestaurant.category,
              photoUris: matchedRestaurant.photoUris,
              reviewCount: matchedRestaurant.reviewCount,
              address: matchedRestaurant.address,
              openingHours: matchedRestaurant.openingHours,
              phone: matchedRestaurant.phone,
              features: matchedRestaurant.features,
              menuItems: matchedRestaurant.menuItems,
            }
          : {}),
        ...matchedMeta,
        category:
          matchedRestaurant?.category ??
          matchedMeta?.category ??
          defaultRestaurantMeta.category,
        photoUris:
          matchedRestaurant?.photoUris ??
          matchedMeta?.photoUris ??
          defaultRestaurantMeta.photoUris,
        reviewCount:
          matchedRestaurant?.reviewCount ??
          matchedMeta?.reviewCount ??
          defaultRestaurantMeta.reviewCount,
        address:
          matchedRestaurant?.address ??
          matchedMeta?.address ??
          defaultRestaurantMeta.address,
        openingHours:
          matchedRestaurant?.openingHours ??
          matchedMeta?.openingHours ??
          defaultRestaurantMeta.openingHours,
        phone:
          matchedRestaurant?.phone ??
          matchedMeta?.phone ??
          defaultRestaurantMeta.phone,
        features:
          matchedRestaurant?.features ??
          matchedMeta?.features ??
          defaultRestaurantMeta.features,
        menuItems:
          matchedRestaurant?.menuItems ??
          matchedMeta?.menuItems ??
          defaultRestaurantMeta.menuItems,
      };
    },
    [restaurantName],
  );

  const visiblePhotoUris = useMemo(
    () => restaurantMeta.photoUris.slice(0, visiblePhotoCount),
    [restaurantMeta.photoUris, visiblePhotoCount],
  );

  const restaurantReviewList = useMemo(() => {
    const matchedRestaurant = restaurants.find(
      (item) => item.name === restaurantName || item.shortName === restaurantName,
    );

    const filteredReviews = restaurantReviews.filter(
      (review) =>
        review.restaurantName === restaurantName ||
        review.restaurantName === matchedRestaurant?.name ||
        review.restaurantName === matchedRestaurant?.shortName,
    );

    return [...filteredReviews].sort((left, right) => {
      if (reviewSort === 'popular') {
        return right.likes - left.likes;
      }

      const leftDate = Number(left.date.replaceAll('.', ''));
      const rightDate = Number(right.date.replaceAll('.', ''));
      return rightDate - leftDate;
    });
  }, [restaurantName, reviewSort]);

  useEffect(() => {
    setVisiblePhotoCount(PHOTO_LOAD_BATCH);
    setSelectedPhotoIndex(null);
    setPreviewCurrentIndex(0);
  }, [restaurantName]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    restaurantMeta.photoUris.forEach((photoUri) => {
      if (previewImageSizes[photoUri]) {
        return;
      }

      Image.getSize(
        photoUri,
        (width, height) => {
          setPreviewImageSizes((current) => ({
            ...current,
            [photoUri]: { width, height },
          }));
        },
        () => {
          setPreviewImageSizes((current) => ({
            ...current,
            [photoUri]: { width: 1, height: 1 },
          }));
        },
      );
    });
  }, [previewImageSizes, restaurantMeta.photoUris]);

  const finishHeroTransition = () => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    transitionTimeoutRef.current = setTimeout(() => {
      isHeroTransitioningRef.current = false;
      setIsTabScrollEnabled(true);
      transitionTimeoutRef.current = null;
    }, HERO_TRANSITION_MS);
  };

  const animateIndicatorToTab = (tab: RestaurantDetailTab) => {
    const nextIndex = tabs.findIndex((item) => item.id === tab);

    Animated.spring(indicatorX, {
      toValue:
        nextIndex * (TAB_WIDTH + TAB_GAP) + (TAB_WIDTH - TAB_INDICATOR_WIDTH) / 2,
      useNativeDriver: true,
      speed: 24,
      bounciness: 0,
    }).start();
  };

  const runHeroTransition = (collapse: boolean) => {
    if (isHeroTransitioningRef.current || isHeroCollapsed === collapse) {
      return;
    }

    isHeroTransitioningRef.current = true;
    setIsTabScrollEnabled(false);
    setIsHeroCollapsed(collapse);

    Animated.timing(heroProgress, {
      toValue: collapse ? 1 : 0,
      duration: HERO_TRANSITION_MS,
      useNativeDriver: false,
    }).start(() => {
      finishHeroTransition();
    });
  };

  const handlePressTab = (tab: RestaurantDetailTab) => {
    if (tab === activeTab || isHeroTransitioningRef.current) {
      return;
    }

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }

    if (tab === 'home') {
      setActiveTab('home');
      setIsTabScrollEnabled(true);
      animateIndicatorToTab('home');
      return;
    }

    if (activeTab === 'home' && !isHeroCollapsed) {
      isHeroTransitioningRef.current = true;
      setIsTabScrollEnabled(false);
      setIsHeroCollapsed(true);
      Animated.timing(heroProgress, {
        toValue: 1,
        duration: HERO_TRANSITION_MS,
        useNativeDriver: false,
      }).start(() => {
        setActiveTab(tab);
        setIsTabScrollEnabled(true);
        isHeroTransitioningRef.current = false;
        finishHeroTransition();
      });
      animateIndicatorToTab(tab);
      return;
    }

    setActiveTab(tab);
    setIsHeroCollapsed(true);
    heroProgress.setValue(1);
    setIsTabScrollEnabled(true);
    animateIndicatorToTab(tab);
  };

  const handlePressMoreMenu = () => {
    handlePressTab('menu');
  };

  const handleTabScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isHeroTransitioningRef.current) {
      return;
    }

    const offsetY = event.nativeEvent.contentOffset.y;

    if (!isHeroCollapsed && offsetY > COLLAPSE_TRIGGER) {
      runHeroTransition(true);
      return;
    }

    if (isHeroCollapsed && offsetY < EXPAND_TRIGGER) {
      runHeroTransition(false);
    }
  };

  const handlePhotoTabScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    handleTabScroll(event);

    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;

    if (
      contentOffset.y + layoutMeasurement.height >= contentSize.height - 60 &&
      visiblePhotoCount < restaurantMeta.photoUris.length
    ) {
      setVisiblePhotoCount((current) =>
        Math.min(current + PHOTO_LOAD_BATCH, restaurantMeta.photoUris.length),
      );
    }
  };

  const openPhotoPreview = (index: number) => {
    setSelectedPhotoIndex(index);
    setPreviewCurrentIndex(index);
    requestAnimationFrame(() => {
      previewScrollRef.current?.scrollTo({
        x: windowWidth * index,
        animated: false,
      });
    });
  };

  const getPreviewImageFrame = (imageUri: string) => {
    const maxWidth = windowWidth - 32;
    const maxHeight = windowHeight * 0.72;
    const imageSize = previewImageSizes[imageUri];

    if (!imageSize) {
      return {
        width: maxWidth,
        height: maxHeight,
      };
    }

    const imageRatio = imageSize.width / imageSize.height;
    const frameRatio = maxWidth / maxHeight;

    if (imageRatio > frameRatio) {
      return {
        width: maxWidth,
        height: maxWidth / imageRatio,
      };
    }

    return {
      width: maxHeight * imageRatio,
      height: maxHeight,
    };
  };

  const heroSectionHeight = heroProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [HERO_HEIGHT, 0],
  });

  const heroSectionOpacity = heroProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const heroSectionTranslateY = heroProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18],
  });

  const tabSectionMarginTop = heroProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 18],
  });

  const showHero = !isHeroCollapsed;

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.headerRow}>
          <View style={styles.headerTitleRow}>
            <Pressable style={styles.backButton} onPress={onBack}>
              <ArrowLeftIcon width={24} height={24} />
            </Pressable>
            <Animated.Text
              style={[
                styles.headerTitle,
                {
                  opacity: heroProgress,
                  transform: [
                    {
                      translateX: heroProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-8, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              {restaurantName}
            </Animated.Text>
          </View>
          <Pressable style={styles.favoriteButton}>
            <StarIcon width={22} height={22} />
          </Pressable>
        </View>

        <Animated.View
          pointerEvents={showHero ? 'auto' : 'none'}
          style={[
            styles.heroSection,
            {
              height: heroSectionHeight,
              opacity: heroSectionOpacity,
              transform: [{ translateY: heroSectionTranslateY }],
            },
          ]}
        >
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>{restaurantName}</Text>
            <Text style={styles.heroMeta}>
              {restaurantMeta.category} · 리뷰 {restaurantMeta.reviewCount}
            </Text>
          </View>

          <View style={styles.galleryWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.galleryContent}
            >
              {restaurantMeta.photoUris.slice(0, 5).map((photoUri, index) => (
                <Image
                  key={`${photoUri}-${index}`}
                  source={{ uri: photoUri }}
                  style={styles.galleryCard}
                />
              ))}
            </ScrollView>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.tabSection,
            { marginTop: tabSectionMarginTop },
          ]}
        >
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
                { transform: [{ translateX: indicatorX }] },
              ]}
            />
          </View>
        </Animated.View>

        <View style={styles.contentArea}>
          {activeTab === 'home' ? (
            <HomeTabContent
              restaurantMeta={restaurantMeta}
              scrollEnabled={isTabScrollEnabled}
              onScroll={handleTabScroll}
              onPressMoreMenu={handlePressMoreMenu}
            />
          ) : null}
          {activeTab === 'menu' ? (
            <MenuTabContent
              restaurantMeta={restaurantMeta}
              scrollEnabled={isTabScrollEnabled}
              onScroll={handleTabScroll}
            />
          ) : null}
          {activeTab === 'review' ? (
            <ReviewTabContent
              reviews={restaurantReviewList}
              reviewSort={reviewSort}
              onChangeSort={setReviewSort}
              scrollEnabled={isTabScrollEnabled}
              onScroll={handleTabScroll}
            />
          ) : null}
          {activeTab === 'photo' ? (
            <PhotoGalleryTabContent
              visiblePhotoUris={visiblePhotoUris}
              scrollEnabled={isTabScrollEnabled}
              onOpenPreview={openPhotoPreview}
              onScroll={handlePhotoTabScroll}
            />
          ) : null}
        </View>

        <Modal
          visible={selectedPhotoIndex !== null}
          transparent
          animationType="none"
          onRequestClose={() => setSelectedPhotoIndex(null)}
        >
          <View style={styles.imageModalBackdrop}>
            <View style={styles.photoPreviewHeader}>
              <View style={styles.imageIndexBadge}>
                <Text style={styles.imageIndexBadgeText}>
                  {restaurantMeta.photoUris.length ? (
                    <>
                      <Text style={styles.imageIndexBadgeTextCurrent}>
                        {previewCurrentIndex + 1}
                      </Text>
                      <Text style={styles.imageIndexBadgeTextMuted}>
                        /{restaurantMeta.photoUris.length}
                      </Text>
                    </>
                  ) : (
                    ''
                  )}
                </Text>
              </View>
            </View>

            <ScrollView
              ref={previewScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.imagePreviewScroll}
              contentOffset={{
                x: selectedPhotoIndex !== null ? windowWidth * selectedPhotoIndex : 0,
                y: 0,
              }}
              onMomentumScrollEnd={(event) => {
                const nextIndex = Math.round(
                  event.nativeEvent.contentOffset.x / windowWidth,
                );
                setPreviewCurrentIndex(nextIndex);
              }}
            >
              {restaurantMeta.photoUris.map((photoUri, index) => {
                const imageFrame = getPreviewImageFrame(photoUri);

                return (
                  <Pressable
                    key={`${photoUri}-${index}`}
                    style={[styles.imagePreviewPage, { width: windowWidth }]}
                    onPress={() => setSelectedPhotoIndex(null)}
                  >
                    <Pressable
                      style={[
                        styles.imageModalImageWrap,
                        {
                          width: imageFrame.width,
                          height: imageFrame.height,
                        },
                      ]}
                      onPress={(event) => event.stopPropagation()}
                    >
                      <Image source={{ uri: photoUri }} style={styles.imageModalImage} />
                    </Pressable>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Modal>
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
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 25,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleRow: {
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
  headerTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '500',
    color: '#000000',
    includeFontPadding: false,
  },
  favoriteButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSection: {
    width: screenWidth,
    marginLeft: -HORIZONTAL_PADDING,
    overflow: 'hidden',
  },
  heroCopy: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 26,
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    color: '#000000',
  },
  heroMeta: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '500',
    color: '#000000',
  },
  galleryWrap: {
    marginTop: 25,
  },
  galleryContent: {
    paddingLeft: HORIZONTAL_PADDING,
    gap: 6,
  },
  galleryCard: {
    width: 161,
    height: 161,
    borderRadius: 5,
    backgroundColor: '#D9D9D9',
  },
  tabSection: {
    gap: 10,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: TAB_SIDE_PADDING,
  },
  tabButton: {
    width: TAB_WIDTH,
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '500',
    color: '#000000',
  },
  activeTabLabel: {
    fontWeight: '600',
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
    marginHorizontal: -HORIZONTAL_PADDING,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  tabScrollContent: {
    paddingTop: 25,
    paddingBottom: 36,
    gap: 25,
  },
  fillTabScrollContent: {
    flexGrow: 1,
  },
  tabInner: {
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  infoList: {
    width: '100%',
    gap: 25,
    paddingHorizontal: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: '#000000',
  },
  linkText: {
    color: '#1427FF',
  },
  fullBleedDividerWrap: {
    width: screenWidth + HORIZONTAL_PADDING * 2,
    marginLeft: -HORIZONTAL_PADDING,
  },
  sectionDivider: {
    width: '100%',
    height: 5,
    backgroundColor: '#F5F5F5',
  },
  menuSection: {
    width: '100%',
    gap: 20,
  },
  menuSectionTitle: {
    marginBottom: 20,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    color: '#000000',
  },
  moreMenuButton: {
    marginTop: 20,
    width: '100%',
    height: 42,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreMenuButtonText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: '#000000',
  },
  menuItem: {
    width: '100%',
    gap: 10,
  },
  menuName: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '500',
    color: '#000000',
  },
  menuDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '300',
    color: '#000000',
  },
  menuPrice: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '500',
    color: '#000000',
  },
  menuDivider: {
    width: '100%',
    height: 1,
    marginTop: 20,
    backgroundColor: '#F5F5F5',
  },
  emptyTabContent: {
    flex: 1,
  },
  reviewTabInner: {
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: 20,
  },
  reviewSortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewSortButton: {
    minWidth: 62,
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewSortButtonActive: {
    backgroundColor: '#000000',
  },
  reviewSortLabel: {
    fontSize: 14,
    lineHeight: 19.5,
    fontWeight: '500',
    color: '#666666',
  },
  reviewSortLabelActive: {
    color: '#FFFFFF',
  },
  reviewList: {
    gap: 25,
  },
  emptyReviewState: {
    width: '100%',
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyReviewTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: '#000000',
  },
  emptyReviewDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: '#999999',
    textAlign: 'center',
  },
  reviewCard: {
    gap: 12,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  reviewAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
  },
  reviewAuthorCopy: {
    gap: 4,
  },
  reviewAuthorName: {
    fontSize: 15,
    lineHeight: 22.5,
    fontWeight: '500',
    color: '#000000',
  },
  reviewDate: {
    fontSize: 13,
    lineHeight: 19.5,
    fontWeight: '400',
    color: '#999999',
  },
  reviewReactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reviewReactionButton: {
    minWidth: 44,
    height: 27.5,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#F5F5F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  reactionIcon: {
    fontSize: 12,
    lineHeight: 14,
  },
  reviewReactionCount: {
    fontSize: 13,
    lineHeight: 19.5,
    fontWeight: '500',
    color: '#666666',
  },
  reviewText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    color: '#000000',
  },
  reviewImageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  reviewImageCard: {
    width: 80,
    height: 80,
    borderRadius: 5,
    backgroundColor: '#D9D9D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewImagePlaceholder: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#8A8A8A',
  },
  reviewDivider: {
    width: '100%',
    height: 1,
    marginTop: 25,
    backgroundColor: '#F5F5F5',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  photoCard: {
    width: PHOTO_CARD_SIZE,
    height: PHOTO_CARD_SIZE,
    borderRadius: 5,
    backgroundColor: '#D9D9D9',
  },
  imageModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
  },
  photoPreviewHeader: {
    position: 'absolute',
    top: 18,
    right: 16,
    zIndex: 2,
  },
  imageIndexBadge: {
    minWidth: 54,
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: 'rgba(17, 17, 17, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageIndexBadgeText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  imageIndexBadgeTextCurrent: {
    color: '#FFFFFF',
  },
  imageIndexBadgeTextMuted: {
    color: 'rgba(255, 255, 255, 0.55)',
  },
  imagePreviewScroll: {
    flex: 1,
  },
  imagePreviewPage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  imageModalImageWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageModalImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    resizeMode: 'contain',
  },
});
