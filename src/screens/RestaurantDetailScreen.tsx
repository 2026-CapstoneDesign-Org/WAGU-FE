import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Linking,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';
import { ApiError } from '../api/client';
import {
  ApiReview,
  ApiBusinessHoursDisplayRow,
  ApiRestaurant,
  ApiRestaurantMenuItem,
  ApiReviewSummary,
  cancelReviewVote,
  deleteReview,
  followUser,
  getRestaurant,
  getRestaurantPhotoUris,
  getRestaurantReviews,
  getRestaurantReviewSummary,
  searchRestaurants,
  unfollowUser,
  voteReview,
} from '../api/wagu';
import ClockIcon from '../../assets/icons/clock.svg';
import { MOCK_DATA_ENABLED } from '../config/mockData';
import LocationIcon from '../../assets/icons/location.svg';
import ParkingIcon from '../../assets/icons/parking.svg';
import PhoneIcon from '../../assets/icons/phone.svg';
import ShopIcon from '../../assets/icons/shop.svg';
import StarIcon from '../../assets/icons/star.svg';
import TrashIcon from '../../assets/icons/trash.svg';
import { Restaurant, RestaurantMenuItem, restaurants } from '../data/restaurants';
import { RestaurantReview, restaurantReviews } from '../data/restaurantReviews';
import { ReviewMediaItem } from '../types/reviews';

type RestaurantDetailTab = 'home' | 'menu' | 'review' | 'photo';
type ReviewSort = 'latest' | 'popular';
type ReviewReaction = 'like' | 'dislike' | null;

type RestaurantDetailScreenProps = {
  accessToken?: string | null;
  currentUserId?: number | null;
  followingUserIds?: number[];
  initialTab?: RestaurantDetailTab;
  onBack: () => void;
  restaurantName?: string;
  onAddToList?: (restaurant: Restaurant) => void;
  onEditReview?: (reviewId: number, restaurantName: string, restaurantId?: number, content?: string) => void;
  onOpenUserProfile?: (authorName: string) => void;
  onReportReview?: (reviewId: string, reason: string) => void;
  onReviewAuthorFollowChange?: (userId: string, nextIsFollowing: boolean) => void;
  onOpenWriteReview?: (restaurantName: string, restaurantId?: number) => void;
  favoriteColor?: string;
  reviewsData?: RestaurantReview[];
};

type RestaurantMeta = {
  category: string;
  photoUris: string[];
  reviewCount: string;
  address: string;
  regionName?: string;
  openingHours: string;
  openingHoursCollapsed?: string;
  openingHoursRows?: ApiBusinessHoursDisplayRow[];
  openingHoursStatus?: string;
  parkingLots?: { distanceText?: string; name: string }[];
  parkingSummary?: string;
  phone: string;
  features: string;
  menuItems: RestaurantMenuItem[];
};

type TabScrollProps = {
  scrollEnabled: boolean;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

type RestaurantReviewDisplay = RestaurantReview & {
  isFollowPending?: boolean;
  isMenuOpen?: boolean;
  currentReaction?: ReviewReaction;
  isVotePending?: boolean;
  onCloseMenu?: () => void;
  onToggleMenu?: (reviewId: string) => void;
};

type RestaurantReviewSummaryDisplay = {
  negatives: string[];
  positives: string[];
  reviewCount: number;
  sentiment?: string;
  summary?: string;
};

const { width: screenWidth } = Dimensions.get('window');

const HORIZONTAL_PADDING = 16;
const TAB_SIDE_PADDING = 13;
const TAB_WIDTH = 34;
const TAB_INDICATOR_WIDTH = 31;
const TAB_ROW_WIDTH = screenWidth - HORIZONTAL_PADDING * 2 - TAB_SIDE_PADDING * 2;
const TAB_GAP = (TAB_ROW_WIDTH - TAB_WIDTH * 4) / 3;
const PHOTO_CARD_SIZE = (screenWidth - HORIZONTAL_PADDING * 2 - 6) / 2;
const REVIEW_IMAGE_SIZE = 172;
const PHOTO_LOAD_BATCH = 10;
const HERO_HEIGHT = 284;
const COLLAPSE_TRIGGER = 18;
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

const emptyRestaurantMeta: RestaurantMeta = {
  category: '',
  photoUris: [],
  reviewCount: '0',
  address: '',
  regionName: '',
  openingHours: '',
  openingHoursRows: [],
  phone: '',
  parkingLots: [],
  parkingSummary: '',
  features: '',
  menuItems: [],
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

function formatPriceText(item: ApiRestaurantMenuItem) {
  if (item.priceText?.trim()) {
    return item.priceText.trim();
  }

  if (typeof item.priceValue === 'number' && Number.isFinite(item.priceValue)) {
    return `${Math.round(item.priceValue).toLocaleString('ko-KR')}원`;
  }

  return '';
}

function mapRemoteMenuItems(
  remoteMenus?: ApiRestaurantMenuItem[],
): RestaurantMenuItem[] {
  if (!remoteMenus?.length) {
    return [];
  }

  return [...remoteMenus]
    .sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0))
    .map((item, index) => ({
      id: String(item.id ?? `remote-menu-${index}`),
      name: item.menuName?.trim() || `메뉴 ${index + 1}`,
      description: item.description?.trim() || undefined,
      price: formatPriceText(item),
    }));
}

function buildOpeningHoursText(restaurant?: ApiRestaurant) {
  if (!restaurant) {
    return '';
  }

  const statusLine = restaurant.currentBusinessStatus?.label?.trim();
  const summaryLine = restaurant.businessHoursDisplay?.summaryLine?.trim();
  const displayStatusLine = restaurant.businessHoursDisplay?.statusLine?.trim();
  const freeText = restaurant.businessHours?.freeText?.trim();

  return [statusLine || displayStatusLine, summaryLine, freeText]
    .filter((value, index, values): value is string => Boolean(value) && values.indexOf(value) === index)
    .join(' · ');
}

function formatOpeningHoursRow(row: ApiBusinessHoursDisplayRow) {
  const parts = [row.timeText?.trim(), ...(row.subTexts ?? []).map((item) => item.trim()).filter(Boolean)];
  const body = row.isClosed ? '휴무' : parts.join(' · ');

  return [row.dayText?.trim(), body].filter(Boolean).join(' ');
}

function formatOpeningHoursRowCompact(row: ApiBusinessHoursDisplayRow) {
  const parts = [row.timeText?.trim(), ...(row.subTexts ?? []).map((item) => item.trim()).filter(Boolean)];
  return row.isClosed ? '휴무' : parts.join(' · ');
}

function buildOpeningHoursRows(restaurant?: ApiRestaurant) {
  if (!restaurant?.businessHoursDisplay?.rows?.length) {
    return [];
  }

  return restaurant.businessHoursDisplay.rows
    .map((row) => ({
      ...row,
      dayText: row.dayText?.trim(),
      subTexts: row.subTexts?.map((item) => item.trim()).filter(Boolean),
      timeText: row.timeText?.trim(),
    }))
    .filter((row) => Boolean(row.dayText || row.timeText || row.subTexts?.length || row.isClosed));
}

function buildOpeningHoursStatus(restaurant?: ApiRestaurant) {
  if (!restaurant) {
    return '';
  }

  const status = restaurant.currentBusinessStatus?.status?.trim().toUpperCase() || '';
  const label = restaurant.currentBusinessStatus?.label?.trim() || '';
  const reason = restaurant.currentBusinessStatus?.reason?.trim() || '';
  const time = restaurant.currentBusinessStatus?.time?.trim() || '';
  const summaryStatus = restaurant.businessHoursDisplay?.statusLine?.trim() || '';

  const isBreakTime =
    status.includes('BREAK') ||
    label.includes('브레이크') ||
    reason.includes('브레이크');
  const isBeforeOpen =
    status.includes('BEFORE') ||
    status.includes('PREOPEN') ||
    label.includes('영업 전') ||
    label.includes('영업준비') ||
    reason.includes('영업 전');
  const isOpen =
    restaurant.currentBusinessStatus?.isOpen === true ||
    status === 'OPEN' ||
    status.includes('OPEN_NOW') ||
    label.includes('영업 중');
  const isClosed =
    status.includes('CLOSED') ||
    label.includes('영업 종료') ||
    reason.includes('영업 종료');

  if (isBreakTime) {
    return '브레이크타임';
  }

  if (isBeforeOpen) {
    return '영업 전';
  }

  if (isOpen) {
    return '영업중';
  }

  if (isClosed) {
    return '영업 종료';
  }

  return label || summaryStatus || reason || time;
}

function buildOpeningHoursCollapsedText(restaurant?: ApiRestaurant) {
  if (!restaurant) {
    return '';
  }

  const statusLabel = buildOpeningHoursStatus(restaurant);
  const todayRow =
    restaurant.businessHoursDisplay?.rows?.find(
      (row) => row.isToday && (row.dayText || row.timeText || row.subTexts?.length || row.isClosed),
    ) || restaurant.businessHoursDisplay?.rows?.[0];
  const todayTimeText = todayRow ? formatOpeningHoursRowCompact(todayRow) : '';

  return [statusLabel, todayTimeText].filter(Boolean).join(' · ');
}

function buildFeaturesText(restaurant?: ApiRestaurant) {
  if (!restaurant) {
    return '';
  }

  const convenienceItems = restaurant.conveniences ?? [];
  const tagItems = (restaurant.additionalInfoTags ?? [])
    .map((tag) => tag.tagName?.trim())
    .filter((value): value is string => Boolean(value));

  const items = [
    ...convenienceItems,
    ...(typeof restaurant.parkingAvailable === 'boolean'
      ? [restaurant.parkingAvailable ? '주차 가능' : '주차 정보 없음']
      : []),
    ...tagItems.slice(0, 3),
  ];

  return Array.from(new Set(items)).join(', ');
}

function formatParkingDistance(distanceMeters?: number) {
  if (typeof distanceMeters !== 'number' || !Number.isFinite(distanceMeters)) {
    return '';
  }

  return distanceMeters >= 1000
    ? `${(distanceMeters / 1000).toFixed(1)}km`
    : `${Math.round(distanceMeters)}m`;
}

function buildParkingLots(restaurant?: ApiRestaurant) {
  if (!restaurant?.nearbyParkingLots?.length) {
    return [];
  }

  return restaurant.nearbyParkingLots
    .map((lot) => ({
      distanceText: formatParkingDistance(lot.distanceMeters),
      name: lot.parkingLotName?.trim() || lot.roadAddress?.trim() || lot.lotAddress?.trim() || '',
    }))
    .filter((lot) => Boolean(lot.name))
    .slice(0, 5);
}

function buildParkingSummary(restaurant?: ApiRestaurant) {
  if (!restaurant) {
    return '';
  }

  const availability =
    typeof restaurant.parkingAvailable === 'boolean'
      ? restaurant.parkingAvailable
        ? '주차 가능'
        : '주차 정보 없음'
      : '';
  const lots = buildParkingLots(restaurant);
  const nearbyText = lots.length > 0 ? `근처 주차장 ${lots.length}곳` : '';

  return [availability, nearbyText].filter(Boolean).join(' · ');
}

function MenuList({ menuItems }: { menuItems: RestaurantMenuItem[] }) {
  return (
    <View style={styles.menuSection}>
      {menuItems.map((item, index) => (
        <View key={item.id}>
          <View style={styles.menuItem}>
            <Text style={styles.menuName}>{item.name}</Text>
            {item.description ? (
              <Text style={styles.menuDescription}>{item.description}</Text>
            ) : null}
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
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 21H5.4C4.84 21 4.56 21 4.346 20.891C4.157 20.795 4.005 20.643 3.909 20.454C3.8 20.24 3.8 19.96 3.8 19.4V11.6C3.8 11.04 3.8 10.76 3.909 10.546C4.005 10.357 4.157 10.205 4.346 10.109C4.56 10 4.84 10 5.4 10H9M9 21V10M9 21L13.649 21C14.593 21 15.441 20.417 15.777 19.535L18.467 12.475C18.961 11.178 18.002 9.8 16.614 9.8H13.2V6.6C13.2 5.495 12.305 4.6 11.2 4.6C10.869 4.6 10.6 4.869 10.6 5.2V7.076C10.6 7.551 10.431 8.011 10.123 8.374L9 10"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ThumbDownIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 3H5.4C4.84 3 4.56 3 4.346 3.109C4.157 3.205 4.005 3.357 3.909 3.546C3.8 3.76 3.8 4.04 3.8 4.6V12.4C3.8 12.96 3.8 13.24 3.909 13.454C4.005 13.643 4.157 13.795 4.346 13.891C4.56 14 4.84 14 5.4 14H9M9 3V14M9 3L13.649 3C14.593 3 15.441 3.583 15.777 4.465L18.467 11.525C18.961 12.822 18.002 14.2 16.614 14.2H13.2V17.4C13.2 18.505 12.305 19.4 11.2 19.4C10.869 19.4 10.6 19.131 10.6 18.8V16.924C10.6 16.449 10.431 15.989 10.123 15.626L9 14"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PenIcon({ color }: { color: string }) {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13.5 6.5L17.5 10.5M5 19L8.386 18.624C8.801 18.578 9.008 18.555 9.201 18.492C9.371 18.437 9.533 18.36 9.682 18.264C9.851 18.155 9.999 18.007 10.294 17.712L19 9.006C19.552 8.454 19.552 7.559 19 7.006L16.994 5C16.441 4.448 15.546 4.448 14.994 5L6.288 13.706C5.993 14.001 5.845 14.149 5.736 14.318C5.64 14.467 5.563 14.629 5.508 14.799C5.445 14.992 5.422 15.199 5.376 15.614L5 19Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function MoreDotsIcon() {
  return (
    <View style={styles.reviewMoreDots}>
      <View style={styles.reviewMoreDot} />
      <View style={styles.reviewMoreDot} />
      <View style={styles.reviewMoreDot} />
    </View>
  );
}

function ReviewReactionButton({
  count,
  icon,
  active = false,
  disabled = false,
  onPress,
}: {
  count: number;
  icon: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.reviewReactionButton,
        active ? styles.reviewReactionButtonActive : null,
        disabled ? styles.reviewReactionButtonDisabled : null,
      ]}
    >
      {icon}
      <Text
        style={[
          styles.reviewReactionCount,
          active ? styles.reviewReactionCountActive : null,
          disabled ? styles.reviewReactionCountDisabled : null,
        ]}
      >
        {count}
      </Text>
    </Pressable>
  );
}

function getReviewMediaItems(
  review: Pick<RestaurantReview, 'media' | 'imageUris'>,
): ReviewMediaItem[] {
  if (review.media?.length) {
    return review.media;
  }

  return (review.imageUris ?? []).map((uri, index) => ({
    id: `legacy-media-${index}-${uri}`,
    type: 'image',
    uri,
  }));
}

function formatReviewDate(createdAt: string) {
  const parsedDate = new Date(createdAt);

  if (Number.isNaN(parsedDate.getTime())) {
    return createdAt;
  }

  const year = parsedDate.getFullYear();
  const month = `${parsedDate.getMonth() + 1}`.padStart(2, '0');
  const day = `${parsedDate.getDate()}`.padStart(2, '0');

  return `${year}.${month}.${day}`;
}

function mapReviewSummary(
  reviewSummary: ApiReviewSummary,
  fallbackReviewCount: number,
): RestaurantReviewSummaryDisplay {
  return {
    negatives: reviewSummary.negatives ?? [],
    positives: reviewSummary.positives ?? [],
    reviewCount: reviewSummary.reviewCount ?? fallbackReviewCount,
    sentiment: reviewSummary.sentiment,
    summary: reviewSummary.summary,
  };
}

function mapApiReviewToDisplayReview(
  review: ApiReview,
  restaurantName: string,
  currentUserId?: number | null,
): RestaurantReview {
  return {
    authorUserId: review.userId,
    authorName: review.nickname,
    content: review.content,
    date: formatReviewDate(review.createdAt),
    dislikes: review.dislikeCount,
    id: String(review.id),
    imageUris: review.imageUrls,
    isOwner: review.userId === currentUserId,
    likes: review.likeCount,
    myReaction:
      review.myVoteType === 'LIKE'
        ? 'like'
        : review.myVoteType === 'DISLIKE'
          ? 'dislike'
          : null,
    restaurantName,
  };
}

function ReviewCard({
  review,
  onEditReview,
  onReportReview,
  onToggleFollow,
  onToggleReaction,
  onDeleteReview,
  onOpenImagePreview,
  onOpenUserProfile,
}: {
  review: RestaurantReviewDisplay;
  onEditReview: (reviewId: string, content: string) => void;
  onReportReview?: (reviewId: string, reason: string) => void;
  onToggleFollow: (reviewId: string) => void;
  onToggleReaction: (reviewId: string, reaction: Exclude<ReviewReaction, null>) => void;
  onDeleteReview: (reviewId: string) => void;
  onOpenImagePreview: (images: string[], index: number) => void;
  onOpenUserProfile?: (authorName: string) => void;
}) {
  const reviewMedia = getReviewMediaItems(review);
  const imageUris = reviewMedia.filter((item) => item.type === 'image').map((item) => item.uri);
  const isMenuOpen = review.isMenuOpen ?? false;
  const [isReportSheetOpen, setIsReportSheetOpen] = useState(false);

  const handlePressMore = () => {
    review.onToggleMenu?.(review.id);
  };

  const handlePressEdit = () => {
    review.onCloseMenu?.();
    onEditReview(review.id, review.content);
  };

  const handlePressDelete = () => {
    review.onCloseMenu?.();
    onDeleteReview(review.id);
  };

  const handlePressReport = () => {
    if (!onReportReview) {
      return;
    }

    review.onCloseMenu?.();
    setIsReportSheetOpen(true);
  };

  const handleSelectReportReason = (reason: string) => {
    setIsReportSheetOpen(false);
    onReportReview?.(review.id, reason);
  };

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewCardHeader}>
        <Pressable
          style={styles.reviewAuthorRow}
          onPress={() => onOpenUserProfile?.(review.authorName)}
          disabled={!onOpenUserProfile || review.isOwner}
        >
          <View style={styles.reviewAvatar} />
          <View style={styles.reviewAuthorCopy}>
            <Text style={styles.reviewAuthorName}>{review.authorName}</Text>
            <Text style={styles.reviewDate}>{review.date}</Text>
          </View>
        </Pressable>

        <View style={styles.reviewHeaderActions}>
          {review.isOwner ? (
            <View style={styles.reviewOwnerBadge}>
              <Text style={styles.reviewOwnerBadgeLabel}>내 리뷰</Text>
            </View>
          ) : (
            <Pressable
              onPress={() => onToggleFollow(review.id)}
              disabled={review.isFollowPending}
              style={[
                styles.reviewFollowButton,
                review.isFollowPending ? styles.reviewActionPending : null,
                review.isFollowing ? styles.reviewFollowingButton : null,
              ]}
            >
              <Text
                style={[
                  styles.reviewFollowButtonLabel,
                  review.isFollowing ? styles.reviewFollowingButtonLabel : null,
                ]}
              >
                {review.isFollowing ? '팔로잉' : '팔로우'}
              </Text>
            </Pressable>
          )}
          <Pressable hitSlop={14} onPress={handlePressMore} style={styles.reviewMoreButton}>
            <MoreDotsIcon />
          </Pressable>
          {isMenuOpen ? (
            <View style={styles.reviewMoreMenu}>
              {review.isOwner ? (
                <>
                  <Pressable onPress={handlePressEdit} style={styles.reviewMoreMenuItem}>
                    <Text style={styles.reviewMoreMenuLabel}>수정하기</Text>
                  </Pressable>
                  <Pressable onPress={handlePressDelete} style={styles.reviewMoreMenuItem}>
                    <Text style={[styles.reviewMoreMenuLabel, styles.reviewMoreMenuLabelDanger]}>
                      삭제하기
                    </Text>
                  </Pressable>
                </>
              ) : (
                <Pressable onPress={handlePressReport} style={styles.reviewMoreMenuItem}>
                  <Text style={[styles.reviewMoreMenuLabel, styles.reviewMoreMenuLabelDanger]}>
                    신고하기
                  </Text>
                </Pressable>
              )}
            </View>
          ) : null}
        </View>
      </View>

      <Text style={styles.reviewText}>{review.content}</Text>

      {false && review.imageUris?.length ? (
        <View style={styles.reviewImageRow}>
          {(review.imageUris ?? []).slice(0, 3).map((_, index) => (
            <View key={`${review.id}-${index}`} style={styles.reviewImageCard}>
              <Text style={styles.reviewImagePlaceholder}>사진</Text>
            </View>
          ))}
        </View>
      ) : null}

      {reviewMedia.length ? (
        <View style={[styles.reviewImagesCarousel, { width: screenWidth }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reviewImagesRow}
          >
            {reviewMedia.slice(0, 5).map((item, index, items) =>
              item.type === 'image' ? (
                <Pressable
                  key={item.id}
                  style={[
                    styles.reviewImage,
                    index < items.length - 1 ? styles.reviewImageSpacing : null,
                  ]}
                  onPress={() =>
                    onOpenImagePreview(
                      imageUris,
                      imageUris.findIndex((uri) => uri === item.uri),
                    )
                  }
                >
                  <Image source={{ uri: item.uri }} style={styles.reviewImageFill} />
                </Pressable>
              ) : (
                <View
                  key={item.id}
                  style={[
                    styles.reviewImage,
                    styles.videoReviewCard,
                    index < items.length - 1 ? styles.reviewImageSpacing : null,
                  ]}
                >
                  <Text style={styles.videoReviewBadge}>VIDEO</Text>
                </View>
              ),
            )}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.reviewReactionRow}>
        <ReviewReactionButton
          count={review.likes}
          active={review.currentReaction === 'like'}
          disabled={review.isOwner || review.isVotePending}
          onPress={() => onToggleReaction(review.id, 'like')}
          icon={
            <ThumbUpIcon color={review.currentReaction === 'like' ? '#F92A1D' : '#666666'} />
          }
        />
        <ReviewReactionButton
          count={review.dislikes}
          active={review.currentReaction === 'dislike'}
          disabled={review.isOwner || review.isVotePending}
          onPress={() => onToggleReaction(review.id, 'dislike')}
          icon={
            <ThumbDownIcon
              color={review.currentReaction === 'dislike' ? '#F92A1D' : '#666666'}
            />
          }
        />

      </View>

      <Modal
        animationType="fade"
        transparent
        visible={isReportSheetOpen}
        onRequestClose={() => setIsReportSheetOpen(false)}
      >
        <View style={styles.reportSheetOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setIsReportSheetOpen(false)}
          />
          <View style={styles.reportSheet}>
            <Text style={styles.reportSheetTitle}>신고 사유를 선택해 주세요</Text>
            <Pressable
              onPress={() => handleSelectReportReason('스팸/광고')}
              style={styles.reportSheetItem}
            >
              <Text style={styles.reportSheetItemLabel}>스팸/광고</Text>
            </Pressable>
            <Pressable
              onPress={() => handleSelectReportReason('욕설/비방')}
              style={styles.reportSheetItem}
            >
              <Text style={styles.reportSheetItemLabel}>욕설/비방</Text>
            </Pressable>
            <Pressable
              onPress={() => handleSelectReportReason('허위 정보')}
              style={styles.reportSheetItem}
            >
              <Text style={styles.reportSheetItemLabel}>허위 정보</Text>
            </Pressable>
            <Pressable
              onPress={() => handleSelectReportReason('기타')}
              style={styles.reportSheetItem}
            >
              <Text style={[styles.reportSheetItemLabel, styles.reportSheetItemLabelDanger]}>
                기타
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  reviewSummary,
  isLoading,
  hasLoadError,
  scrollEnabled,
  onScroll,
  onPressMoreMenu,
}: {
  restaurantMeta: RestaurantMeta;
  reviewSummary?: RestaurantReviewSummaryDisplay | null;
  isLoading: boolean;
  hasLoadError: boolean;
  onPressMoreMenu: () => void;
} & TabScrollProps) {
  const [isHoursExpanded, setIsHoursExpanded] = useState(false);
  const [isFeaturesExpanded, setIsFeaturesExpanded] = useState(false);
  const [isParkingExpanded, setIsParkingExpanded] = useState(false);
  const openingHoursRows = restaurantMeta.openingHoursRows ?? [];
  const openingHoursStatus = restaurantMeta.openingHoursStatus?.trim();
  const parkingLots = restaurantMeta.parkingLots ?? [];
  const hasParkingLots = parkingLots.length > 0;
  const parkingText = hasParkingLots
    ? isParkingExpanded
      ? parkingLots
          .map((lot) => [lot.name, lot.distanceText].filter(Boolean).join(' · '))
          .join('\n')
      : restaurantMeta.parkingSummary || [parkingLots[0]?.name, parkingLots[0]?.distanceText].filter(Boolean).join(' · ')
    : restaurantMeta.parkingSummary || '';
  const hasOpeningHoursRows = openingHoursRows.length > 0;
  const todayOpeningHoursText =
    openingHoursRows.find((row) => row.isToday && (row.dayText || row.timeText || row.subTexts?.length || row.isClosed)) ||
    openingHoursRows[0];
  const collapsedOpeningHoursText =
    restaurantMeta.openingHoursCollapsed ||
    (todayOpeningHoursText
      ? [openingHoursStatus, formatOpeningHoursRowCompact(todayOpeningHoursText)].filter(Boolean).join(' · ')
      : restaurantMeta.openingHours);
  const expandedOpeningHoursText = [
    openingHoursStatus,
    ...openingHoursRows.map((row) => formatOpeningHoursRow(row)).filter(Boolean),
  ]
    .filter(Boolean)
    .join('\n');
  const openingHoursText = hasOpeningHoursRows
    ? isHoursExpanded
      ? expandedOpeningHoursText
      : collapsedOpeningHoursText
    : restaurantMeta.openingHours;
  const hasInfo =
      Boolean(restaurantMeta.address) ||
    Boolean(openingHoursText) ||
      Boolean(restaurantMeta.phone) ||
      Boolean(parkingText) ||
      Boolean(restaurantMeta.features) ||
      Boolean(restaurantMeta.regionName);
  const hasMenuItems = restaurantMeta.menuItems.length > 0;
  const phoneNumber = restaurantMeta.phone.trim();

  const handlePressCall = () => {
    if (!phoneNumber) {
      return;
    }

    Alert.alert('전화 걸기', `${phoneNumber}로 전화를 걸까요?`, [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '전화',
        onPress: () => {
          void (async () => {
            const telUrl = `tel:${phoneNumber.replace(/[^0-9+]/g, '')}`;
            const canOpen = await Linking.canOpenURL(telUrl);

            if (!canOpen) {
              Alert.alert('안내', '이 기기에서는 전화를 연결할 수 없어요.');
              return;
            }

            await Linking.openURL(telUrl);
          })();
        },
      },
    ]);
  };

  return (
    <BaseTabScroll scrollEnabled={scrollEnabled} onScroll={onScroll}>
      <View style={styles.tabInner}>
        {hasInfo ? (
          <View style={styles.infoList}>
            <DetailInfoRow
              icon={<LocationIcon width={18} height={18} color="#C4C4C4" />}
              text={restaurantMeta.address}
            />
            <DetailInfoRow
              actionElement={
                hasOpeningHoursRows ? <ChevronIcon direction={isHoursExpanded ? 'up' : 'down'} /> : undefined
              }
              icon={<ClockIcon width={18} height={18} color="#C4C4C4" />}
              onPress={hasOpeningHoursRows ? () => setIsHoursExpanded((current) => !current) : undefined}
              singleLine={!isHoursExpanded}
              text={openingHoursText}
            />
            <DetailInfoRow
              icon={<PhoneIcon width={18} height={18} color="#C4C4C4" />}
              actionLabel="전화"
              actionLabelStyle={styles.phoneActionLabel}
              inlineAction
              onPress={handlePressCall}
              singleLine
              text={restaurantMeta.phone}
            />
            <DetailInfoRow
              actionElement={
                hasParkingLots ? <ChevronIcon direction={isParkingExpanded ? 'up' : 'down'} /> : undefined
              }
              icon={<ParkingIcon width={18} height={18} color="#C4C4C4" />}
              onPress={hasParkingLots ? () => setIsParkingExpanded((current) => !current) : undefined}
              singleLine={!isParkingExpanded}
              text={parkingText}
            />
            <DetailInfoRow
              actionElement={
                <ChevronIcon direction={isFeaturesExpanded ? 'up' : 'down'} />
              }
              icon={<ShopIcon width={18} height={18} color="#C4C4C4" />}
              onPress={() => setIsFeaturesExpanded((current) => !current)}
              singleLine={!isFeaturesExpanded}
              text={restaurantMeta.features || restaurantMeta.regionName || ''}
            />
          </View>
        ) : (
          <EmptySectionState
            title={isLoading ? '식당 정보를 불러오는 중이에요' : '아직 등록된 상세 정보가 없어요'}
            description={
              hasLoadError
                ? '잠시 후 다시 시도해 주세요.'
                : '주소와 기본 정보가 준비되면 여기에 보여드릴게요.'
            }
            compact
          />
        )}
      </View>

      <View style={styles.fullBleedDividerWrap}>
        <View style={styles.sectionDivider} />
      </View>

      <View style={styles.tabInner}>
        <Text style={styles.menuSectionTitle}>메뉴</Text>
        {hasMenuItems ? <MenuList menuItems={restaurantMeta.menuItems.slice(0, 4)} /> : null}
        {restaurantMeta.menuItems.length > 4 ? (
          <Pressable style={styles.moreMenuButton} onPress={onPressMoreMenu}>
            <Text style={styles.moreMenuButtonText}>더보기</Text>
          </Pressable>
        ) : null}
        {!hasMenuItems ? (
          <EmptySectionState
            title="메뉴 정보가 아직 없어요"
            description="이 식당의 메뉴 정보는 준비되는 대로 업데이트할게요."
            compact
          />
        ) : null}
      </View>

      {reviewSummary &&
      (reviewSummary.summary ||
        reviewSummary.positives.length > 0 ||
        reviewSummary.negatives.length > 0) ? (
        <>
          <View style={styles.fullBleedDividerWrap}>
            <View style={styles.sectionDivider} />
          </View>

          <View style={styles.tabInner}>
            <View style={styles.reviewSummaryCard}>
              <View style={styles.reviewSummaryHeader}>
                <Text style={styles.reviewSummaryTitle}>AI 요약</Text>
              </View>

              {reviewSummary.summary ? (
                <Text style={styles.reviewSummaryBody}>{reviewSummary.summary}</Text>
              ) : null}

              {reviewSummary.positives.length > 0 ? (
                <View style={styles.reviewSummarySection}>
                  <Text style={styles.reviewSummarySectionTitle}>좋았던 점</Text>
                  {reviewSummary.positives.slice(0, 3).map((item, index) => (
                    <Text key={`home-positive-${index}`} style={styles.reviewSummaryBullet}>
                      • {item}
                    </Text>
                  ))}
                </View>
              ) : null}

              {reviewSummary.negatives.length > 0 ? (
                <View style={styles.reviewSummarySection}>
                  <Text style={styles.reviewSummarySectionTitle}>아쉬운 점</Text>
                  {reviewSummary.negatives.slice(0, 3).map((item, index) => (
                    <Text key={`home-negative-${index}`} style={styles.reviewSummaryBullet}>
                      • {item}
                    </Text>
                  ))}
                </View>
              ) : null}
            </View>
          </View>
        </>
      ) : null}
    </BaseTabScroll>
  );
}

function ChevronIcon({
  color = '#8A8A8A',
  direction,
}: {
  color?: string;
  direction: 'down' | 'up';
}) {
  return (
    <Svg width={10} height={6} viewBox="0 0 10 6" fill="none">
      <Path
        d={direction === 'down' ? 'M1 1L5 5L9 1' : 'M1 5L5 1L9 5'}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
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
        {restaurantMeta.menuItems.length ? (
          <MenuList menuItems={restaurantMeta.menuItems} />
        ) : (
          <EmptySectionState
            title="메뉴 정보가 아직 없어요"
            description="백엔드에서 메뉴 데이터를 주면 이 탭에 바로 연결할게요."
          />
        )}
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
  onOpenPreview: (images: string[], index: number) => void;
} & TabScrollProps) {
  return (
    <BaseTabScroll scrollEnabled={scrollEnabled} onScroll={onScroll}>
      {visiblePhotoUris.length ? (
        <View style={styles.photoGrid}>
          {visiblePhotoUris.map((photoUri, index) => (
            <Pressable
              key={`${photoUri}-${index}`}
              onPress={() => onOpenPreview(visiblePhotoUris, index)}
            >
              <Image source={{ uri: photoUri }} style={styles.photoCard} />
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={styles.tabInner}>
          <EmptySectionState
            title="등록된 사진이 아직 없어요"
            description="식당 사진은 준비되는 대로 여기에 보여드릴게요."
          />
        </View>
      )}
    </BaseTabScroll>
  );
}

function EmptySectionState({
  title,
  description,
  compact = false,
}: {
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <View style={[styles.emptySectionState, compact ? styles.emptySectionStateCompact : null]}>
      <Text style={styles.emptySectionTitle}>{title}</Text>
      <Text style={styles.emptySectionDescription}>{description}</Text>
    </View>
  );
}

function DetailInfoRow({
  actionElement,
  actionLabel,
  actionLabelStyle,
  icon,
  inlineAction = false,
  onPress,
  singleLine = false,
  text,
}: {
  actionElement?: React.ReactNode;
  actionLabel?: string;
  actionLabelStyle?: StyleProp<TextStyle>;
  icon: React.ReactNode;
  inlineAction?: boolean;
  onPress?: () => void;
  singleLine?: boolean;
  text: string;
}) {
  if (!text) {
    return null;
  }

  const resolvedInlineActionLabel = inlineAction ? '전화' : actionLabel;

  const content = (
    <View style={styles.infoRow}>
      {icon}
      <View style={styles.infoTextWrap}>
        {inlineAction && resolvedInlineActionLabel ? (
          <Text
            style={styles.infoText}
            numberOfLines={singleLine ? 1 : undefined}
            ellipsizeMode={singleLine ? 'tail' : undefined}
          >
            {text}
            <Text style={[styles.infoActionLabel, actionLabelStyle]}>{'   '}{resolvedInlineActionLabel}</Text>
          </Text>
        ) : (
          <Text
            style={styles.infoText}
            numberOfLines={singleLine ? 1 : undefined}
            ellipsizeMode={singleLine ? 'tail' : undefined}
          >
            {text}
          </Text>
        )}
      </View>
      {!inlineAction && actionElement ? <View style={styles.infoActionIconWrap}>{actionElement}</View> : null}
      {!inlineAction && actionLabel ? (
        <Text style={[styles.infoActionLabel, actionLabelStyle]}>{actionLabel}</Text>
      ) : null}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return <Pressable onPress={onPress}>{content}</Pressable>;
}

function ReviewTabContent({
  reviews,
  reviewSummary,
  reviewSort,
  onChangeSort,
  onEditReview,
  onReportReview,
  onToggleFollow,
  onToggleReaction,
  onDeleteReview,
  onOpenImagePreview,
  onOpenUserProfile,
  onPressWriteReview,
  scrollEnabled,
  onScroll,
}: {
  reviews: RestaurantReviewDisplay[];
  reviewSummary?: RestaurantReviewSummaryDisplay | null;
  reviewSort: ReviewSort;
  onChangeSort: (sort: ReviewSort) => void;
  onEditReview: (reviewId: string, content: string) => void;
  onReportReview?: (reviewId: string, reason: string) => void;
  onToggleFollow: (reviewId: string) => void;
  onToggleReaction: (reviewId: string, reaction: Exclude<ReviewReaction, null>) => void;
  onDeleteReview: (reviewId: string) => void;
  onOpenImagePreview: (images: string[], index: number) => void;
  onOpenUserProfile?: (authorName: string) => void;
  onPressWriteReview: () => void;
} & TabScrollProps) {
  const [openMenuReviewId, setOpenMenuReviewId] = useState<string | null>(null);

  return (
    <BaseTabScroll scrollEnabled={scrollEnabled} onScroll={onScroll}>
      <View style={styles.reviewTabInner}>
        {openMenuReviewId ? (
          <Pressable
            style={styles.reviewMenuBackdrop}
            onPress={() => setOpenMenuReviewId(null)}
          />
        ) : null}
        {reviewSummary &&
        (reviewSummary.summary ||
          reviewSummary.positives.length > 0 ||
          reviewSummary.negatives.length > 0) ? (
          <View style={styles.reviewSummaryCard}>
            <View style={styles.reviewSummaryHeader}>
              <Text style={styles.reviewSummaryTitle}>AI 요약</Text>
            </View>

            {reviewSummary.summary ? (
              <Text style={styles.reviewSummaryBody}>{reviewSummary.summary}</Text>
            ) : null}

            {reviewSummary.positives.length > 0 ? (
              <View style={styles.reviewSummarySection}>
                <Text style={styles.reviewSummarySectionTitle}>좋았던 점</Text>
                {reviewSummary.positives.slice(0, 3).map((item, index) => (
                  <Text key={`positive-${index}`} style={styles.reviewSummaryBullet}>
                    • {item}
                  </Text>
                ))}
              </View>
            ) : null}

            {reviewSummary.negatives.length > 0 ? (
              <View style={styles.reviewSummarySection}>
                <Text style={styles.reviewSummarySectionTitle}>아쉬운 점</Text>
                {reviewSummary.negatives.slice(0, 3).map((item, index) => (
                  <Text key={`negative-${index}`} style={styles.reviewSummaryBullet}>
                    • {item}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

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
                <ReviewCard
                  review={{
                    ...review,
                    isMenuOpen: openMenuReviewId === review.id,
                    onCloseMenu: () => setOpenMenuReviewId(null),
                    onToggleMenu: (reviewId) =>
                      setOpenMenuReviewId((current) => (current === reviewId ? null : reviewId)),
                  }}
                  onEditReview={onEditReview}
                  onReportReview={onReportReview}
                  onToggleFollow={onToggleFollow}
                  onToggleReaction={onToggleReaction}
                  onDeleteReview={onDeleteReview}
                  onOpenImagePreview={onOpenImagePreview}
                  onOpenUserProfile={onOpenUserProfile}
                />
                {index < reviews.length - 1 ? <View style={styles.reviewDivider} /> : null}
              </View>
            ))
          ) : (
            <View style={styles.emptyReviewState}>
              <Text style={styles.emptyReviewTitle}>아직 등록된 리뷰가 없어요</Text>
              <Text style={styles.emptyReviewDescription}>
                이 가게의 첫 리뷰를 남겨보세요.
              </Text>
              <Pressable style={styles.writeReviewInlineButton} onPress={onPressWriteReview}>
                <Text style={styles.writeReviewInlineButtonLabel}>+  리뷰 쓰기</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </BaseTabScroll>
  );
}

function normalizeRestaurantName(value: string) {
  return value.replace(/\s+/g, '').trim().toLowerCase();
}

function getTabIndicatorOffset(tab: RestaurantDetailTab) {
  const nextIndex = tabs.findIndex((item) => item.id === tab);

  return nextIndex * (TAB_WIDTH + TAB_GAP) + (TAB_WIDTH - TAB_INDICATOR_WIDTH) / 2;
}

export function RestaurantDetailScreen({
  accessToken,
  currentUserId,
  followingUserIds,
  initialTab = 'home',
  onBack,
  restaurantName = '와이앤웍',
  onAddToList,
  onEditReview,
  onOpenUserProfile,
  onReportReview,
  onReviewAuthorFollowChange,
  onOpenWriteReview,
  favoriteColor = '#D9D9D9',
  reviewsData,
}: RestaurantDetailScreenProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const indicatorX = useRef(new Animated.Value(0)).current;
  const heroProgress = useRef(new Animated.Value(0)).current;
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHeroTransitioningRef = useRef(false);
  const previewScrollRef = useRef<ScrollView>(null);

  const [activeTab, setActiveTab] = useState<RestaurantDetailTab>(initialTab);
  const [reviewSort, setReviewSort] = useState<ReviewSort>('latest');
  const [isHeroCollapsed, setIsHeroCollapsed] = useState(false);
  const [isHeroAnimating, setIsHeroAnimating] = useState(false);
  const [isTabScrollEnabled, setIsTabScrollEnabled] = useState(true);
  const [visiblePhotoCount, setVisiblePhotoCount] = useState(PHOTO_LOAD_BATCH);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [previewCurrentIndex, setPreviewCurrentIndex] = useState(0);
  const [reviewFollowStates, setReviewFollowStates] = useState<Record<string, boolean>>({});
  const [reviewFollowPendingIds, setReviewFollowPendingIds] = useState<Record<string, boolean>>(
    {},
  );
  const [reviewReactionStates, setReviewReactionStates] = useState<
    Record<string, ReviewReaction>
  >({});
  const [reviewVotePendingIds, setReviewVotePendingIds] = useState<Record<string, boolean>>({});
  const [remoteRestaurant, setRemoteRestaurant] = useState<ApiRestaurant | null>(null);
  const [remoteReviews, setRemoteReviews] = useState<RestaurantReview[] | null>(null);
  const [remoteReviewSummary, setRemoteReviewSummary] =
    useState<RestaurantReviewSummaryDisplay | null>(null);
  const [isRestaurantLoading, setIsRestaurantLoading] = useState(false);
  const [hasRestaurantLoadError, setHasRestaurantLoadError] = useState(false);
  const [previewImageSizes, setPreviewImageSizes] = useState<
    Record<string, { width: number; height: number }>
  >({});
  const followingUserIdSet = useMemo(
    () => new Set((followingUserIds ?? []).filter((userId) => Number.isFinite(userId))),
    [followingUserIds],
  );
  const followingUserIdsKey = useMemo(
    () =>
      (followingUserIds ?? [])
        .filter((userId) => Number.isFinite(userId))
        .sort((left, right) => left - right)
        .join(','),
    [followingUserIds],
  );

  useEffect(() => {
    setReviewFollowStates((current) => (Object.keys(current).length > 0 ? {} : current));
  }, [followingUserIdsKey]);

  const handlePressWriteReview = () => {
    if (onOpenWriteReview) {
      onOpenWriteReview(remoteRestaurant?.name ?? restaurantName, remoteRestaurant?.id);
      return;
    }

    Alert.alert('리뷰 쓰기', '리뷰 작성 기능은 곧 추가됩니다.');
  };

  useEffect(() => {
    setActiveTab(initialTab);
    setIsHeroCollapsed(initialTab !== 'home');
    setIsHeroAnimating(false);
    setIsTabScrollEnabled(true);
    heroProgress.setValue(initialTab === 'home' ? 0 : 1);
    indicatorX.setValue(getTabIndicatorOffset(initialTab));
  }, [initialTab, restaurantName]);

  useEffect(() => {
    if (!accessToken) {
      setRemoteRestaurant(null);
      setRemoteReviews(null);
      setRemoteReviewSummary(null);
      setIsRestaurantLoading(false);
      setHasRestaurantLoadError(false);
      return;
    }

    let cancelled = false;

    const loadRestaurant = async () => {
      setIsRestaurantLoading(true);
      setHasRestaurantLoadError(false);

      try {
        const candidates = await searchRestaurants(accessToken, restaurantName);
        const normalizedTargetName = normalizeRestaurantName(restaurantName);
        const matchedCandidate =
          candidates.find((item) => normalizeRestaurantName(item.name) === normalizedTargetName) ??
          candidates.find((item) =>
            normalizeRestaurantName(item.name).includes(normalizedTargetName),
          ) ??
          candidates.find((item) =>
            normalizedTargetName.includes(normalizeRestaurantName(item.name)),
          ) ??
          candidates[0];

          if (!matchedCandidate) {
            if (!cancelled) {
              setRemoteRestaurant(null);
              setRemoteReviews([]);
              setRemoteReviewSummary(null);
              setHasRestaurantLoadError(true);
              setIsRestaurantLoading(false);
            }
          return;
        }

        try {
          const detail = await getRestaurant(accessToken, Number(matchedCandidate.id));
          const restaurantId = Number(matchedCandidate.id);
          const [reviews, reviewSummary] = await Promise.all([
            getRestaurantReviews(accessToken, restaurantId),
            getRestaurantReviewSummary(accessToken, restaurantId).catch(() => null),
          ]);

          if (!cancelled) {
            setRemoteRestaurant(detail);
            setRemoteReviews(reviews.map((review) => mapApiReviewToDisplayReview(review, detail.name, currentUserId)));
            setRemoteReviewSummary(
              reviewSummary
                ? mapReviewSummary(reviewSummary, reviews.length)
                : null,
            );
          }
        } catch {
          if (!cancelled) {
            setRemoteRestaurant(matchedCandidate);
            setRemoteReviews(null);
            setRemoteReviewSummary(null);
          }
        }
      } catch {
        if (!cancelled) {
          setRemoteRestaurant(null);
          setRemoteReviews(null);
          setRemoteReviewSummary(null);
          setHasRestaurantLoadError(true);
        }
      } finally {
        if (!cancelled) {
          setIsRestaurantLoading(false);
        }
      }
    };

    void loadRestaurant();

    return () => {
      cancelled = true;
    };
  }, [accessToken, restaurantName]);

  const restaurantMeta = useMemo(
    () => {
      const matchedRestaurant = MOCK_DATA_ENABLED
        ? restaurants.find(
            (item) => item.name === restaurantName || item.shortName === restaurantName,
          )
        : undefined;
      const matchedMeta = MOCK_DATA_ENABLED
        ? restaurantMetaByName[restaurantName] ??
          (matchedRestaurant
            ? restaurantMetaByName[matchedRestaurant.name] ??
              restaurantMetaByName[matchedRestaurant.shortName]
            : undefined)
        : undefined;
      const baseRestaurantMeta = MOCK_DATA_ENABLED ? defaultRestaurantMeta : emptyRestaurantMeta;
        const remotePhotoUris = remoteRestaurant ? getRestaurantPhotoUris(remoteRestaurant) : [];
        const remoteMenuItems = mapRemoteMenuItems(remoteRestaurant?.menus);
        const remoteOpeningHours = buildOpeningHoursText(remoteRestaurant ?? undefined);
        const remoteOpeningHoursCollapsed = buildOpeningHoursCollapsedText(remoteRestaurant ?? undefined);
        const remoteOpeningHoursRows = buildOpeningHoursRows(remoteRestaurant ?? undefined);
        const remoteOpeningHoursStatus = buildOpeningHoursStatus(remoteRestaurant ?? undefined);
        const remoteParkingLots = buildParkingLots(remoteRestaurant ?? undefined);
        const remoteParkingSummary = buildParkingSummary(remoteRestaurant ?? undefined);
        const remoteFeatures = buildFeaturesText(remoteRestaurant ?? undefined);
      const remoteAddress =
        remoteRestaurant?.roadAddress?.trim() ||
        remoteRestaurant?.address?.trim() ||
        remoteRestaurant?.lotAddress?.trim() ||
        '';
      const remotePhone = remoteRestaurant?.phoneNumber?.trim() || '';
      const remoteCategory =
        remoteRestaurant?.primaryCategoryName?.trim() ||
        remoteRestaurant?.categoryName?.trim() ||
        remoteRestaurant?.categories?.[0] ||
        remoteRestaurant?.regionName ||
        '';

      return {
        ...baseRestaurantMeta,
        ...(matchedRestaurant
          ? {
              category: matchedRestaurant.category,
                photoUris: matchedRestaurant.photoUris,
                reviewCount: matchedRestaurant.reviewCount,
                address: matchedRestaurant.address,
                openingHours: matchedRestaurant.openingHours,
                openingHoursCollapsed: matchedRestaurant.openingHours,
                openingHoursRows: [],
                openingHoursStatus: '',
                parkingLots: [],
                parkingSummary: '',
                phone: matchedRestaurant.phone,
                features: matchedRestaurant.features,
                menuItems: matchedRestaurant.menuItems,
            }
          : {}),
        ...(remoteRestaurant
          ? {
              category: remoteCategory,
                photoUris: remotePhotoUris,
                address: remoteAddress,
                regionName: remoteRestaurant.regionName,
                openingHours: remoteOpeningHours,
                openingHoursCollapsed: remoteOpeningHoursCollapsed,
                openingHoursRows: remoteOpeningHoursRows,
                openingHoursStatus: remoteOpeningHoursStatus,
                parkingLots: remoteParkingLots,
                parkingSummary: remoteParkingSummary,
                phone: remotePhone,
                features: remoteFeatures,
                menuItems: remoteMenuItems,
            }
          : {}),
        ...matchedMeta,
        category:
          remoteCategory ||
          matchedRestaurant?.category ||
          matchedMeta?.category ||
          baseRestaurantMeta.category,
        photoUris:
          (remotePhotoUris.length ? remotePhotoUris : undefined) ??
          matchedRestaurant?.photoUris ??
          matchedMeta?.photoUris ??
          baseRestaurantMeta.photoUris,
        reviewCount:
          matchedRestaurant?.reviewCount ??
          matchedMeta?.reviewCount ??
          baseRestaurantMeta.reviewCount,
        address:
          remoteAddress ||
          matchedRestaurant?.address ||
          matchedMeta?.address ||
          baseRestaurantMeta.address,
        regionName:
          remoteRestaurant?.regionName ??
          matchedMeta?.regionName ??
          baseRestaurantMeta.regionName,
          openingHours:
            remoteOpeningHours ||
            matchedRestaurant?.openingHours ||
            matchedMeta?.openingHours ||
            baseRestaurantMeta.openingHours,
          openingHoursCollapsed:
            remoteOpeningHoursCollapsed ||
            matchedMeta?.openingHoursCollapsed ||
            matchedRestaurant?.openingHours ||
            baseRestaurantMeta.openingHours,
          openingHoursRows:
            remoteOpeningHoursRows.length > 0
              ? remoteOpeningHoursRows
              : matchedMeta?.openingHoursRows || [],
          openingHoursStatus:
            remoteOpeningHoursStatus ||
            matchedMeta?.openingHoursStatus ||
            '',
          parkingLots:
            remoteParkingLots.length > 0
              ? remoteParkingLots
              : matchedMeta?.parkingLots || [],
          parkingSummary:
            remoteParkingSummary ||
            matchedMeta?.parkingSummary ||
            '',
          phone:
            remotePhone ||
          matchedRestaurant?.phone ||
          matchedMeta?.phone ||
          baseRestaurantMeta.phone,
        features:
          remoteFeatures ||
          matchedRestaurant?.features ||
          matchedMeta?.features ||
          baseRestaurantMeta.features,
        menuItems:
          (remoteMenuItems.length ? remoteMenuItems : undefined) ??
          matchedRestaurant?.menuItems ??
          matchedMeta?.menuItems ??
          baseRestaurantMeta.menuItems,
      };
    },
    [remoteRestaurant, restaurantName],
  );

  const visiblePhotoUris = useMemo(
    () => restaurantMeta.photoUris.slice(0, visiblePhotoCount),
    [restaurantMeta.photoUris, visiblePhotoCount],
  );

  const addToListRestaurant = useMemo<Restaurant>(() => {
    const matchedRestaurant = MOCK_DATA_ENABLED
      ? restaurants.find((item) => item.name === restaurantName || item.shortName === restaurantName)
      : undefined;

    return {
      address: restaurantMeta.address,
      category: restaurantMeta.category || '맛집',
      id: String(remoteRestaurant?.id ?? matchedRestaurant?.id ?? restaurantName),
      imageUri: restaurantMeta.photoUris[0] ?? matchedRestaurant?.imageUri,
      name: remoteRestaurant?.name ?? matchedRestaurant?.name ?? restaurantName,
      photoUris: restaurantMeta.photoUris,
      shortName: matchedRestaurant?.shortName ?? remoteRestaurant?.name ?? restaurantName,
    };
  }, [
    remoteRestaurant?.id,
    remoteRestaurant?.name,
    restaurantMeta.address,
    restaurantMeta.category,
    restaurantMeta.photoUris,
    restaurantName,
  ]);

  const restaurantReviewList = useMemo(() => {
    const resolvedRestaurantName = remoteRestaurant?.name ?? restaurantName;
    const matchedRestaurant = MOCK_DATA_ENABLED
      ? restaurants.find((item) => item.name === restaurantName || item.shortName === restaurantName)
      : undefined;
    const reviewSource =
      reviewsData ??
      remoteReviews ??
      (MOCK_DATA_ENABLED ? restaurantReviews : []);

    const filteredReviews = reviewSource.filter(
          (review) =>
            review.restaurantName === resolvedRestaurantName ||
            review.restaurantName === restaurantName ||
            review.restaurantName === matchedRestaurant?.name ||
            review.restaurantName === matchedRestaurant?.shortName,
        );

    const reviewsWithFollowState = filteredReviews.map((review) => ({
      ...review,
      isFollowing:
        reviewFollowStates[review.id] ??
        (review.authorUserId ? followingUserIdSet.has(review.authorUserId) : undefined) ??
        review.isFollowing ??
        false,
      isFollowPending: reviewFollowPendingIds[review.id] ?? false,
      currentReaction: reviewReactionStates[review.id] ?? review.myReaction ?? null,
      likes: review.likes,
      dislikes: review.dislikes,
      isVotePending: reviewVotePendingIds[review.id] ?? false,
    }));

    return [...reviewsWithFollowState].sort((left, right) => {
      if (reviewSort === 'popular') {
        return right.likes - left.likes;
      }

      const leftDate = Number(left.date.replaceAll('.', ''));
      const rightDate = Number(right.date.replaceAll('.', ''));
      return rightDate - leftDate;
    });
  }, [
    remoteRestaurant?.name,
    restaurantName,
    reviewSort,
    reviewFollowStates,
    reviewFollowPendingIds,
    reviewReactionStates,
    reviewVotePendingIds,
    followingUserIdSet,
    remoteReviews,
    reviewsData,
  ]);

  const displayReviewCount = restaurantReviewList.length
    ? String(restaurantReviewList.length)
    : remoteReviewSummary?.reviewCount
      ? String(remoteReviewSummary.reviewCount)
      : restaurantMeta.reviewCount;
  const heroMetaParts = [
    restaurantMeta.category,
    restaurantMeta.regionName,
    displayReviewCount ? `리뷰 ${displayReviewCount}` : '',
  ].filter(Boolean);
  const hasHeroPhotos = restaurantMeta.photoUris.length > 0;

  const handleToggleReviewFollow = (reviewId: string) => {
    const reviewSource = remoteReviews ?? reviewsData ?? (MOCK_DATA_ENABLED ? restaurantReviews : []);
    const targetReview = reviewSource.find((review) => review.id === reviewId);

    if (targetReview?.isOwner || reviewFollowPendingIds[reviewId]) {
      return;
    }

    const currentValue =
      reviewFollowStates[reviewId] ??
      (targetReview?.authorUserId ? followingUserIdSet.has(targetReview.authorUserId) : undefined) ??
      targetReview?.isFollowing ??
      false;
    const nextValue = !currentValue;

    if (!accessToken || !targetReview?.authorUserId) {
      setReviewFollowStates((current) => ({
        ...current,
        [reviewId]: nextValue,
      }));
      return;
    }

    const targetAuthorUserId = targetReview.authorUserId;

    setReviewFollowPendingIds((current) => ({
      ...current,
      [reviewId]: true,
    }));

    void (async () => {
      try {
        if (nextValue) {
          await followUser(accessToken, targetAuthorUserId);
        } else {
          await unfollowUser(accessToken, targetAuthorUserId);
        }

        setReviewFollowStates((current) => ({
          ...current,
          [reviewId]: nextValue,
        }));
        onReviewAuthorFollowChange?.(String(targetAuthorUserId), nextValue);
      } catch (error) {
        if (!nextValue && error instanceof ApiError && [400, 404].includes(error.status)) {
          setReviewFollowStates((current) => ({
            ...current,
            [reviewId]: false,
          }));
          onReviewAuthorFollowChange?.(String(targetAuthorUserId), false);
          return;
        }

        const message =
          error instanceof ApiError ? error.message : '팔로우를 변경하지 못했습니다.';
        Alert.alert('안내', message);
      } finally {
        setReviewFollowPendingIds((current) => ({
          ...current,
          [reviewId]: false,
        }));
      }
    })();
  };

  const handleToggleReviewReaction = async (
    reviewId: string,
    reaction: Exclude<ReviewReaction, null>,
  ) => {
    const reviewSource = remoteReviews ?? reviewsData ?? (MOCK_DATA_ENABLED ? restaurantReviews : []);
    const targetReview = reviewSource.find((review) => review.id === reviewId);

    if (targetReview?.isOwner || reviewVotePendingIds[reviewId]) {
      return;
    }

    const currentValue = reviewReactionStates[reviewId] ?? null;
    const nextValue = currentValue === reaction ? null : reaction;

    setReviewVotePendingIds((current) => ({
      ...current,
      [reviewId]: true,
    }));

    try {
      if (accessToken) {
        const numericReviewId = Number(reviewId);

        if (Number.isNaN(numericReviewId)) {
          throw new Error('invalid_review_id');
        }

        if (nextValue === null) {
          await cancelReviewVote(accessToken, numericReviewId);
        } else {
          await voteReview(accessToken, numericReviewId, {
            voteType: nextValue === 'like' ? 'LIKE' : 'DISLIKE',
          });
        }
      }

      if (accessToken && remoteRestaurant?.id) {
        const [reviews, reviewSummary] = await Promise.all([
          getRestaurantReviews(accessToken, remoteRestaurant.id),
          getRestaurantReviewSummary(accessToken, remoteRestaurant.id).catch(() => null),
        ]);

        setRemoteReviews(
          reviews.map((review) =>
            mapApiReviewToDisplayReview(review, remoteRestaurant.name, currentUserId),
          ),
        );
        setRemoteReviewSummary(
          reviewSummary ? mapReviewSummary(reviewSummary, reviews.length) : null,
        );
      }

      setReviewReactionStates((current) => ({
        ...current,
        [reviewId]: nextValue,
      }));
    } catch {
      Alert.alert('안내', '리뷰 반응을 저장하지 못했습니다.');
    } finally {
      setReviewVotePendingIds((current) => ({
        ...current,
        [reviewId]: false,
      }));
    }
  };

  const handleDeleteReview = (reviewId: string) => {
    Alert.alert('리뷰 삭제', '정말 이 리뷰를 삭제하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            if (!accessToken) {
              Alert.alert('안내', '로그인 정보가 없어 리뷰를 삭제할 수 없습니다.');
              return;
            }

            const numericReviewId = Number(reviewId);

            if (Number.isNaN(numericReviewId)) {
              Alert.alert('안내', '리뷰 정보를 확인하지 못했습니다.');
              return;
            }

            try {
              await deleteReview(accessToken, numericReviewId);
              setRemoteReviews((current) =>
                current ? current.filter((review) => review.id !== reviewId) : current,
              );
              setReviewReactionStates((current) => {
                const next = { ...current };
                delete next[reviewId];
                return next;
              });
            } catch {
              Alert.alert('안내', '리뷰를 삭제하지 못했습니다.');
            }
          })();
        },
      },
    ]);
  };

  const handleEditReview = (reviewId: string, content: string) => {
    const numericReviewId = Number(reviewId);

    if (Number.isNaN(numericReviewId)) {
      Alert.alert('안내', '리뷰 정보를 확인하지 못했습니다.');
      return;
    }

    onEditReview?.(
      numericReviewId,
      remoteRestaurant?.name ?? restaurantName,
      remoteRestaurant?.id,
      content,
    );
  };

  useEffect(() => {
    setVisiblePhotoCount(PHOTO_LOAD_BATCH);
    setPreviewImages([]);
    setSelectedPhotoIndex(null);
    setPreviewCurrentIndex(0);
  }, [restaurantName]);

  useEffect(() => {
    previewImages.forEach((photoUri) => {
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
  }, [previewImageSizes, previewImages]);

  const animateIndicatorToTab = (tab: RestaurantDetailTab) => {
    Animated.spring(indicatorX, {
      toValue: getTabIndicatorOffset(tab),
      useNativeDriver: true,
      speed: 24,
      bounciness: 0,
    }).start();
  };

  const finishHeroTransition = () => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    transitionTimeoutRef.current = setTimeout(() => {
      isHeroTransitioningRef.current = false;
      setIsHeroAnimating(false);
      setIsTabScrollEnabled(true);
    }, HERO_TRANSITION_MS);
  };

  const runHeroTransition = (
    collapse: boolean,
    onComplete?: () => void,
  ) => {
    if (isHeroTransitioningRef.current || isHeroCollapsed === collapse) {
      onComplete?.();
      return;
    }

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }

    isHeroTransitioningRef.current = true;
    setIsHeroAnimating(true);
    setIsTabScrollEnabled(false);
    setIsHeroCollapsed(collapse);

    Animated.timing(heroProgress, {
      toValue: collapse ? 1 : 0,
      duration: HERO_TRANSITION_MS,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (!finished) {
        isHeroTransitioningRef.current = false;
        setIsHeroAnimating(false);
        setIsTabScrollEnabled(true);
        return;
      }

      onComplete?.();
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
      setActiveTab(tab);
      setIsTabScrollEnabled(true);
      animateIndicatorToTab(tab);
      return;
    }

    if (activeTab === 'home' && !isHeroCollapsed) {
      animateIndicatorToTab(tab);
      runHeroTransition(true, () => {
        setActiveTab(tab);
        setIsTabScrollEnabled(true);
      });
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

  const handlePressPhotoGallery = () => {
    handlePressTab('photo');
  };

  const isContentScrollEnabled = isTabScrollEnabled && !isHeroAnimating;

  const handleTabScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isHeroTransitioningRef.current) {
      return;
    }

    const offsetY = event.nativeEvent.contentOffset.y;

    if (!isHeroCollapsed && offsetY > COLLAPSE_TRIGGER) {
      runHeroTransition(true);
      return;
    }

    if (isHeroCollapsed && offsetY <= 0) {
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

  const openPhotoPreview = (images: string[], index: number) => {
    setPreviewImages(images);
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

  const displayRestaurantName = remoteRestaurant?.name ?? restaurantName;

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

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

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
              {displayRestaurantName}
            </Animated.Text>
          </View>
          <Pressable
            style={styles.favoriteButton}
            onPress={() => onAddToList?.(addToListRestaurant)}
          >
            <StarIcon width={22} height={22} color={favoriteColor} />
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
            <Text style={styles.heroTitle}>{displayRestaurantName}</Text>
            {heroMetaParts.length ? (
              <Text style={styles.heroMeta}>{heroMetaParts.join(' · ')}</Text>
            ) : (
              <Text style={styles.heroMetaMuted}>
                {isRestaurantLoading
                  ? '식당 정보를 불러오는 중이에요'
                  : hasRestaurantLoadError
                    ? '식당 정보를 다시 불러와 주세요'
                    : '등록된 기본 정보가 아직 없어요'}
              </Text>
            )}
          </View>

          <View style={styles.galleryWrap}>
            {hasHeroPhotos ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.galleryContent}
                >
                  {restaurantMeta.photoUris.slice(0, 5).map((photoUri, index) => (
                    <Pressable
                      key={`${photoUri}-${index}`}
                      onPress={handlePressPhotoGallery}
                    >
                      <Image
                        source={{ uri: photoUri }}
                        style={styles.galleryCard}
                      />
                    </Pressable>
                  ))}
                </ScrollView>
            ) : (
              <View style={styles.galleryPlaceholderWrap}>
                <View style={styles.galleryPlaceholderCard}>
                  <Text style={styles.galleryPlaceholderLabel}>
                    {isRestaurantLoading ? '사진을 불러오는 중' : '등록된 사진이 아직 없어요'}
                  </Text>
                </View>
              </View>
            )}
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
              reviewSummary={remoteReviewSummary}
              isLoading={isRestaurantLoading}
              hasLoadError={hasRestaurantLoadError}
              scrollEnabled={isContentScrollEnabled}
              onScroll={handleTabScroll}
              onPressMoreMenu={handlePressMoreMenu}
            />
          ) : null}
          {activeTab === 'menu' ? (
            <MenuTabContent
              restaurantMeta={restaurantMeta}
              scrollEnabled={isContentScrollEnabled}
              onScroll={handleTabScroll}
            />
          ) : null}
          {activeTab === 'review' ? (
          <ReviewTabContent
            reviews={restaurantReviewList}
            reviewSummary={remoteReviewSummary}
            reviewSort={reviewSort}
            onChangeSort={setReviewSort}
              onEditReview={handleEditReview}
              onReportReview={onReportReview}
              onToggleFollow={handleToggleReviewFollow}
              onToggleReaction={handleToggleReviewReaction}
              onDeleteReview={handleDeleteReview}
              onOpenImagePreview={openPhotoPreview}
              onOpenUserProfile={onOpenUserProfile}
              onPressWriteReview={handlePressWriteReview}
              scrollEnabled={isContentScrollEnabled}
              onScroll={handleTabScroll}
            />
          ) : null}
          {activeTab === 'photo' ? (
            <PhotoGalleryTabContent
              visiblePhotoUris={visiblePhotoUris}
              scrollEnabled={isContentScrollEnabled}
              onOpenPreview={openPhotoPreview}
              onScroll={handlePhotoTabScroll}
            />
          ) : null}
        </View>

        {activeTab === 'review' && restaurantReviewList.length > 0 ? (
          <Pressable
            style={styles.writeReviewFloatingButton}
            onPress={handlePressWriteReview}
          >
            <Text style={styles.writeReviewFloatingButtonLabel}>+  리뷰 쓰기</Text>
          </Pressable>
        ) : null}

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
                  {previewImages.length ? (
                    <>
                      <Text style={styles.imageIndexBadgeTextCurrent}>
                        {previewCurrentIndex + 1}
                      </Text>
                      <Text style={styles.imageIndexBadgeTextMuted}>
                        /{previewImages.length}
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
              {previewImages.map((photoUri, index) => {
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
  heroMetaMuted: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    color: '#8A8A8A',
  },
  galleryWrap: {
    marginTop: 25,
  },
  galleryContent: {
    paddingLeft: HORIZONTAL_PADDING,
    gap: 6,
  },
  galleryPlaceholderWrap: {
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  galleryPlaceholderCard: {
    width: screenWidth - HORIZONTAL_PADDING * 2,
    height: 161,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryPlaceholderLabel: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '500',
    color: '#8A8A8A',
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
  infoTextWrap: {
    flex: 1,
  },
  infoInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  infoInlineText: {
    flexShrink: 0,
    flexGrow: 0,
  },
  infoActionLabel: {
    marginLeft: 6,
    fontSize: 12,
    lineHeight: 12,
    fontWeight: '600',
    color: '#8A8A8A',
  },
  infoActionIconWrap: {
    marginLeft: 6,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneActionLabel: {
    color: '#F92A1D',
    marginLeft: 10,
    fontSize: 13,
    lineHeight: 16,
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
  emptySectionState: {
    width: '100%',
    minHeight: 180,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptySectionStateCompact: {
    minHeight: 140,
  },
  emptySectionTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  emptySectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: '#999999',
    textAlign: 'center',
  },
  reviewTabInner: {
    position: 'relative',
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: 20,
  },
  reviewMenuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  reviewSummaryCard: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 14,
  },
  reviewSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  reviewSummaryTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    color: '#111111',
  },
  reviewSummaryMeta: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: '#888888',
  },
  reviewSummaryBody: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
    color: '#333333',
  },
  reviewSummarySection: {
    gap: 8,
  },
  reviewSummarySectionTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
    color: '#111111',
  },
  reviewSummaryBullet: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
    color: '#666666',
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
  writeReviewInlineButton: {
    minWidth: 116,
    height: 42,
    marginTop: 10,
    paddingHorizontal: 22,
    borderRadius: 21,
    backgroundColor: '#FF0000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  writeReviewInlineButtonLabel: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  writeReviewFloatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    minWidth: 110,
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 22,
    backgroundColor: '#FF0000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 7,
  },
  writeReviewFloatingButtonLabel: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
    color: '#FFFFFF',
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
  reviewHeaderActions: {
    marginLeft: 'auto',
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewMoreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewMoreDots: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
  },
  reviewMoreDot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 999,
    backgroundColor: '#999999',
  },
  reviewMoreMenu: {
    position: 'absolute',
    top: 34,
    right: 0,
    minWidth: 110,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    zIndex: 20,
  },
  reviewMoreMenuItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  reviewMoreMenuLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: '#222222',
  },
  reviewMoreMenuLabelDanger: {
    color: '#F92A1D',
  },
  reportSheetOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17, 17, 17, 0.28)',
  },
  reportSheet: {
    width: '84%',
    maxWidth: 340,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingTop: 24,
    paddingBottom: 18,
    paddingHorizontal: 20,
  },
  reportSheetTitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600',
    color: '#111111',
    textAlign: 'center',
    marginBottom: 14,
  },
  reportSheetItem: {
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EFEFEF',
  },
  reportSheetItemLabel: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    color: '#222222',
  },
  reportSheetItemLabelDanger: {
    color: '#F92A1D',
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
  reviewOwnerActions: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reviewEditButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewDeleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewFollowButton: {
    minWidth: 62,
    height: 31,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewFollowingButton: {
    backgroundColor: '#F5F5F5',
  },
  reviewActionPending: {
    opacity: 0.55,
  },
  reviewFollowButtonLabel: {
    fontSize: 14,
    lineHeight: 19.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reviewOwnerBadge: {
    minWidth: 62,
    height: 31,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#FFF0EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewOwnerBadgeLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: '#F92A1D',
  },
  reviewFollowingButtonLabel: {
    color: '#666666',
  },
  reviewReactionButton: {
    minWidth: 44,
    height: 27.5,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#F5F5F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  reviewReactionButtonActive: {
    backgroundColor: '#FFF0EE',
    borderColor: '#FFC4BC',
  },
  reviewReactionButtonDisabled: {
    opacity: 0.45,
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
  reviewReactionCountActive: {
    color: '#F92A1D',
    fontWeight: '600',
  },
  reviewReactionCountDisabled: {
    color: '#888888',
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
  reviewImagesCarousel: {
    overflow: 'hidden',
    marginLeft: -HORIZONTAL_PADDING,
  },
  reviewImagesRow: {
    flexDirection: 'row',
    paddingLeft: 16,
  },
  reviewImage: {
    width: REVIEW_IMAGE_SIZE,
    height: REVIEW_IMAGE_SIZE,
    borderRadius: 5,
    backgroundColor: '#F0F0F0',
    overflow: 'hidden',
  },
  reviewImageFill: {
    width: '100%',
    height: '100%',
  },
  videoReviewCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F1F1F',
  },
  videoReviewBadge: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  reviewImageSpacing: {
    marginRight: 4,
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
    top: 34,
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
