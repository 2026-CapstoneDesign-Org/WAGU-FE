import { RankingEntry } from '../data/rankings';
import { MyList } from '../data/myLists';

import { apiRequest, getApiBaseUrl } from './client';

export type AuthProvider = 'google' | 'kakao' | 'naver';

export type ApiRestaurant = {
  address: string;
  additionalInfoTags?: ApiRestaurantTag[];
  businessHours?: ApiRestaurantBusinessHours;
  businessHoursDisplay?: ApiRestaurantBusinessHoursDisplay;
  categories?: string[];
  categoryName?: string;
  conveniences?: string[];
  currentBusinessStatus?: ApiRestaurantCurrentBusinessStatus;
  id: number;
  imageUrl?: string;
  imageUrls?: string[];
  lat?: number;
  lng?: number;
  lotAddress?: string;
  menus?: ApiRestaurantMenuItem[];
  name: string;
  nearbyParkingLots?: ApiParkingLot[];
  parkingAvailable?: boolean;
  phoneNumber?: string;
  photoUrls?: string[];
  photos?: ApiRestaurantPhoto[];
  primaryCategoryName?: string;
  regionName: string;
  roadAddress?: string;
};

export type ApiRestaurantPhoto = {
  displayOrder?: number;
  imageUrl?: string;
  source?: string;
};

export type ApiRestaurantMenuItem = {
  description?: string;
  displayOrder?: number;
  id?: number;
  menuName?: string;
  priceText?: string;
  priceValue?: number;
};

export type ApiRestaurantTag = {
  isPrimary?: boolean;
  matchedMenuCount?: number;
  parentTagKey?: string;
  tagId?: number;
  tagKey?: string;
  tagName?: string;
};

export type ApiRestaurantCurrentBusinessStatus = {
  checkedAt?: string;
  day?: string;
  isOpen?: boolean;
  label?: string;
  reason?: string;
  status?: string;
  time?: string;
};

export type ApiBusinessHoursDisplayRow = {
  dayText?: string;
  isClosed?: boolean;
  isToday?: boolean;
  subTexts?: string[];
  timeText?: string;
};

export type ApiRestaurantBusinessHoursDisplay = {
  noticeText?: string;
  rows?: ApiBusinessHoursDisplayRow[];
  statusLine?: string;
  summaryLine?: string;
};

export type ApiRestaurantBusinessHours = {
  comingIrregularClosedDays?: unknown[];
  comingRegularClosedDays?: string;
  days?: unknown[];
  freeText?: string;
  source?: string;
};

export type ApiParkingLot = {
  additionalUnitFee?: number;
  additionalUnitTime?: number;
  alternateNoDivision?: string;
  basicParkingFee?: number;
  basicParkingTime?: number;
  currentParkingCount?: number;
  currentParkingTime?: string;
  distanceMeters?: number;
  holidayOperatingHours?: string;
  id?: number;
  lat?: number;
  lng?: number;
  lotAddress?: string;
  parkingCapacity?: number;
  parkingLotDivision?: string;
  parkingLotName?: string;
  parkingLotType?: string;
  phoneNumber?: string;
  realtimeParkingAvailable?: boolean;
  realtimeParkingCode?: string;
  realtimeSource?: string;
  roadAddress?: string;
  saturdayOperatingHours?: string;
  weekdayOperatingHours?: string;
};

type ApiRestaurantRankingItem = {
  adjustedScore: number;
  averageAutoScore?: number;
  categories?: string[];
  evaluationCount?: number;
  imageUrl?: string;
  rank: number;
  regionName: string;
  restaurantId: number;
  restaurantName: string;
};

type ApiRestaurantRankingResponse = {
  items: ApiRestaurantRankingItem[];
};

export type ApiUser = {
  birthDay?: number;
  birthMonth?: number;
  birthYear?: number;
  gender?: 'FEMALE' | 'MALE';
  id: number;
  nickname: string;
  profileImageUrl?: string;
  role?: 'ADMIN' | 'USER';
};

type ApiFollowCount = {
  followerCount: number;
  followingCount: number;
};

export type ApiFollowUser = {
  nickname: string;
  profileImageUrl?: string;
  userId: number;
};

export type ApiRecommendationOwner = {
  nickname: string;
  ownerId: number;
  profileImageUrl?: string;
};

export type ApiRestaurantRecommendationItem = {
  categories?: string[];
  categoryFitScore?: number;
  collaborativeScore?: number;
  fallbackRegion?: boolean;
  finalScore?: number;
  imageUrl?: string;
  rank: number;
  rankingAdjustmentScore?: number;
  regionName: string;
  regionScore?: number;
  restaurantId: number;
  restaurantName: string;
  userPreferenceScore?: number;
};

export type ApiHiddenGemRestaurantItem = {
  address?: string;
  adjustedScore?: number;
  averageAutoScore?: number;
  evaluationCount?: number;
  lat?: number;
  lng?: number;
  rank: number;
  recommendationScore?: number;
  regionName?: string;
  regionTownName?: string;
  restaurantId: number;
  restaurantName: string;
};

export type ApiReview = {
  categoryName?: string;
  content: string;
  createdAt: string;
  dislikeCount: number;
  id: number;
  imageUrls?: string[];
  likeCount: number;
  myVoteType?: 'DISLIKE' | 'LIKE';
  nickname: string;
  restaurant?: {
    address?: string;
    id: number;
    imageUrl?: string;
    name: string;
    regionName?: string;
  };
  restaurantName?: string;
  userId: number;
};

export type ApiReviewSummary = {
  negatives?: string[];
  positives?: string[];
  restaurantId: number;
  restaurantName: string;
  reviewCount: number;
  sentiment?: string;
  summary?: string;
};

export type ApiReservationStatus =
  | 'REQUESTED'
  | 'CALLING'
  | 'CONFIRMED'
  | 'UNAVAILABLE'
  | 'NEEDS_CONFIRMATION'
  | 'FAILED'
  | 'CANCELED';

export type ApiCreateAiCallReservationRequest = {
  partySize: number;
  requestNote?: string;
  reservationDate: string;
  reservationTime: string;
};

export type ApiReservation = {
  aiSummary?: string;
  attemptCount?: number;
  canceledAt?: string;
  confirmedAt?: string;
  createdAt?: string;
  failureReason?: string;
  partySize: number;
  provider?: string;
  providerCallId?: string;
  providerStatus?: string;
  requestNote?: string;
  reservationDateTime: string;
  reservationId: number;
  restaurantAddress?: string;
  restaurantId: number;
  restaurantName: string;
  restaurantPhoneNumberMasked?: string;
  resultMessage?: string;
  status: ApiReservationStatus;
  updatedAt?: string;
};

type ApiReservationListResponse = {
  items: ApiReservation[];
};

export type ApiSearchRestaurantItem = {
  address?: string;
  categories?: string[];
  externalPlaceId?: string;
  imageUrl?: string;
  lat?: number;
  lng?: number;
  matchedBy?: string;
  primaryCategoryName?: string;
  regionName?: string;
  restaurantId: number;
  restaurantName: string;
  source?: string;
};

export type ApiSearchUserItem = {
  nickname: string;
  profileImageUrl?: string;
  userId: number;
};

export type ApiSearchRegionItem = {
  displayName?: string;
  rankingPath?: string;
  regionKeyword?: string;
  regionName?: string;
};

export type ApiSearchResponse = {
  interpretation?: string;
  primaryType?: string;
  query: string;
  regionCount?: number;
  regions?: ApiSearchRegionItem[];
  restaurantCount?: number;
  restaurants?: ApiSearchRestaurantItem[];
  userCount?: number;
  users?: ApiSearchUserItem[];
};

export type ApiReliabilityScore = {
  grade?: string;
  honorPeriod?: string;
  honorTitle?: string;
  nickname?: string;
  score?: number;
  updatedAt?: string;
  userId: number;
};

export type ApiNotificationType =
  | 'FOLLOW'
  | 'FOLLOWING_NEW_LIST'
  | 'FOLLOWING_NEW_REVIEW'
  | 'LIST_LIKE'
  | 'REVIEW_LIKE';

export type ApiNotification = {
  createdAt?: string;
  id: number;
  isRead?: boolean;
  message?: string;
  targetId?: number;
  targetType?: string;
  type: ApiNotificationType;
};

type ApiReviewVoteRequest = {
  voteType: 'DISLIKE' | 'LIKE';
};

type ApiCreateReportRequest = {
  reason: string;
  targetId: number;
  targetType: 'LIST' | 'REVIEW' | 'USER';
};

export type ApiListRecommendationItem = {
  categorySummary?: string[];
  description?: string;
  fallbackRegion?: boolean;
  isLiked?: boolean;
  listId: number;
  owner: ApiRecommendationOwner;
  rank: number;
  recommendationScore?: number;
  regionName: string;
  restaurantCount?: number;
  title: string;
};

type ApiListRecommendationResponse = {
  items: ApiListRecommendationItem[];
};

type ApiRestaurantRecommendationResponse = {
  items: ApiRestaurantRecommendationItem[];
};

type ApiHiddenGemRestaurantResponse = {
  generatedAt?: string;
  items: ApiHiddenGemRestaurantItem[];
  limit?: number;
  regionTownName?: string;
};

type UnknownRecord = Record<string, unknown>;

function isUnknownRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function getNestedRecord(source: unknown, key: string) {
  if (!isUnknownRecord(source)) {
    return undefined;
  }

  const candidate = source[key];
  return isUnknownRecord(candidate) ? candidate : undefined;
}

function getNumberField(source: unknown, key: string) {
  if (!isUnknownRecord(source)) {
    return undefined;
  }

  const candidate = source[key];
  if (typeof candidate === 'number' && Number.isFinite(candidate)) {
    return candidate;
  }

  if (typeof candidate === 'string') {
    const parsed = Number(candidate);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function getStringField(source: unknown, key: string) {
  if (!isUnknownRecord(source)) {
    return undefined;
  }

  const candidate = source[key];
  if (typeof candidate !== 'string') {
    return undefined;
  }

  const normalized = candidate.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function getBooleanField(source: unknown, key: string) {
  if (!isUnknownRecord(source)) {
    return undefined;
  }

  const candidate = source[key];
  return typeof candidate === 'boolean' ? candidate : undefined;
}

function getStringArrayField(source: unknown, key: string) {
  if (!isUnknownRecord(source)) {
    return undefined;
  }

  const candidate = source[key];
  if (!Array.isArray(candidate)) {
    return undefined;
  }

  const normalized = candidate.filter(
    (item): item is string => typeof item === 'string' && item.trim().length > 0,
  );

  return normalized.length > 0 ? normalized : undefined;
}

function extractWrappedItems(source: unknown) {
  if (Array.isArray(source)) {
    return source;
  }

  if (!isUnknownRecord(source)) {
    return [];
  }

  const items = source.items;
  if (Array.isArray(items)) {
    return items;
  }

  const content = source.content;
  if (Array.isArray(content)) {
    return content;
  }

  return [];
}

function normalizeRestaurantRecommendationItem(
  source: unknown,
  index: number,
): ApiRestaurantRecommendationItem {
  const nestedRestaurant = getNestedRecord(source, 'restaurant');

  return {
    categories:
      getStringArrayField(source, 'categories') ??
      getStringArrayField(nestedRestaurant, 'categories'),
    categoryFitScore: getNumberField(source, 'categoryFitScore'),
    collaborativeScore: getNumberField(source, 'collaborativeScore'),
    fallbackRegion: getBooleanField(source, 'fallbackRegion'),
    finalScore: getNumberField(source, 'finalScore'),
    imageUrl:
      getStringField(source, 'imageUrl') ?? getStringField(nestedRestaurant, 'imageUrl'),
    rank: getNumberField(source, 'rank') ?? index + 1,
    rankingAdjustmentScore: getNumberField(source, 'rankingAdjustmentScore'),
    regionName:
      getStringField(source, 'regionName') ??
      getStringField(nestedRestaurant, 'regionName') ??
      '',
    regionScore: getNumberField(source, 'regionScore'),
    restaurantId:
      getNumberField(source, 'restaurantId') ??
      getNumberField(source, 'id') ??
      getNumberField(nestedRestaurant, 'id') ??
      index + 1,
    restaurantName:
      getStringField(source, 'restaurantName') ??
      getStringField(source, 'name') ??
      getStringField(nestedRestaurant, 'name') ??
      `추천 맛집 ${index + 1}`,
    userPreferenceScore: getNumberField(source, 'userPreferenceScore'),
  };
}

function normalizeRestaurantRankingItem(source: unknown, index: number): ApiRestaurantRankingItem {
  const nestedRestaurant = getNestedRecord(source, 'restaurant');

  return {
    adjustedScore: getNumberField(source, 'adjustedScore') ?? 0,
    averageAutoScore: getNumberField(source, 'averageAutoScore'),
    categories:
      getStringArrayField(source, 'categories') ??
      getStringArrayField(nestedRestaurant, 'categories'),
    evaluationCount: getNumberField(source, 'evaluationCount'),
    imageUrl:
      getStringField(source, 'imageUrl') ?? getStringField(nestedRestaurant, 'imageUrl'),
    rank: getNumberField(source, 'rank') ?? index + 1,
    regionName:
      getStringField(source, 'regionName') ??
      getStringField(nestedRestaurant, 'regionName') ??
      '',
    restaurantId:
      getNumberField(source, 'restaurantId') ??
      getNumberField(source, 'id') ??
      getNumberField(nestedRestaurant, 'id') ??
      index + 1,
    restaurantName:
      getStringField(source, 'restaurantName') ??
      getStringField(source, 'name') ??
      getStringField(nestedRestaurant, 'name') ??
      `랭킹 맛집 ${index + 1}`,
  };
}

function normalizeListRecommendationOwner(source: unknown, index: number): ApiRecommendationOwner {
  const nestedOwner =
    getNestedRecord(source, 'owner') ??
    getNestedRecord(source, 'user') ??
    getNestedRecord(source, 'author');
  const nestedProfile = getNestedRecord(nestedOwner, 'profile');

  return {
    nickname:
      getStringField(nestedOwner, 'nickname') ??
      getStringField(source, 'ownerNickname') ??
      getStringField(source, 'nickname') ??
      `추천 유저 ${index + 1}`,
    ownerId:
      getNumberField(nestedOwner, 'ownerId') ??
      getNumberField(nestedOwner, 'userId') ??
      getNumberField(nestedOwner, 'id') ??
      getNumberField(source, 'ownerId') ??
      getNumberField(source, 'userId') ??
      index + 1,
    profileImageUrl:
      getStringField(nestedOwner, 'profileImageUrl') ??
      getStringField(nestedOwner, 'imageUrl') ??
      getStringField(nestedOwner, 'avatarUrl') ??
      getStringField(nestedProfile, 'profileImageUrl') ??
      getStringField(nestedProfile, 'imageUrl') ??
      getStringField(source, 'ownerProfileImageUrl') ??
      getStringField(source, 'profileImageUrl') ??
      getStringField(source, 'ownerImageUrl') ??
      getStringField(source, 'avatarUrl'),
  };
}

function normalizeListRecommendationItem(source: unknown, index: number): ApiListRecommendationItem {
  return {
    categorySummary: getStringArrayField(source, 'categorySummary'),
    description: getStringField(source, 'description'),
    fallbackRegion: getBooleanField(source, 'fallbackRegion'),
    isLiked: getBooleanField(source, 'isLiked'),
    listId:
      getNumberField(source, 'listId') ??
      getNumberField(source, 'id') ??
      index + 1,
    owner: normalizeListRecommendationOwner(source, index),
    rank: getNumberField(source, 'rank') ?? index + 1,
    recommendationScore: getNumberField(source, 'recommendationScore'),
    regionName: getStringField(source, 'regionName') ?? '',
    restaurantCount: getNumberField(source, 'restaurantCount'),
    title:
      getStringField(source, 'title') ??
      getStringField(source, 'listTitle') ??
      `추천 리스트 ${index + 1}`,
  };
}

function normalizeUserListSummaryItem(source: unknown, index: number): ApiUserListSummary {
  return {
    createdAt: getStringField(source, 'createdAt'),
    description: getStringField(source, 'description'),
    id:
      getNumberField(source, 'id') ??
      getNumberField(source, 'listId') ??
      index + 1,
    isLiked: getBooleanField(source, 'isLiked'),
    isPublic: getBooleanField(source, 'isPublic') ?? true,
    isRepresentative: getBooleanField(source, 'isRepresentative') ?? false,
    regionName: getStringField(source, 'regionName') ?? '',
    title:
      getStringField(source, 'title') ??
      getStringField(source, 'listTitle') ??
      `리스트 ${index + 1}`,
  };
}

function normalizeRestaurantForListItem(source: unknown, index: number): ApiRestaurant {
  return {
    address: getStringField(source, 'address') ?? '',
    categories: getStringArrayField(source, 'categories'),
    id:
      getNumberField(source, 'id') ??
      getNumberField(source, 'restaurantId') ??
      index + 1,
    imageUrl: getStringField(source, 'imageUrl'),
    imageUrls: getStringArrayField(source, 'imageUrls'),
    name:
      getStringField(source, 'name') ??
      getStringField(source, 'restaurantName') ??
      `식당 ${index + 1}`,
    photoUrls: getStringArrayField(source, 'photoUrls'),
    primaryCategoryName: getStringField(source, 'primaryCategoryName'),
    regionName: getStringField(source, 'regionName') ?? '',
  };
}

function normalizeUserListDetail(source: unknown): ApiUserListDetail {
  const root =
    getNestedRecord(source, 'data') ??
    getNestedRecord(source, 'result') ??
    getNestedRecord(source, 'payload') ??
    source;
  const summary = normalizeUserListSummaryItem(root, 0);
  const rawRestaurants = extractWrappedItems(
    getNestedRecord(root, 'restaurants') ??
      getNestedRecord(root, 'listRestaurants') ??
      getNestedRecord(root, 'items') ??
      (isUnknownRecord(root)
        ? (root.restaurants ??
            root.listRestaurants ??
            root.items)
        : undefined),
  );

  return {
    ...summary,
    restaurants: rawRestaurants.map((item, index) => {
      const nestedRestaurant = getNestedRecord(item, 'restaurant') ?? item;

      return {
        autoScore: getNumberField(item, 'autoScore'),
        id:
          getNumberField(item, 'id') ??
          getNumberField(item, 'listItemId') ??
          index + 1,
        moodScore: getNumberField(item, 'moodScore'),
        restaurant: normalizeRestaurantForListItem(nestedRestaurant, index),
        tasteScore: getNumberField(item, 'tasteScore'),
        valueScore: getNumberField(item, 'valueScore'),
      };
    }),
  };
}

type ApiTokenResponse = {
  accessToken: string;
  refreshToken?: string | null;
};

type ApiUserListSummary = {
  createdAt?: string;
  description?: string;
  id: number;
  isLiked?: boolean;
  isPublic: boolean;
  isRepresentative: boolean;
  regionName: string;
  title: string;
};

type ApiUserListDetail = ApiUserListSummary & {
  restaurants: Array<{
    autoScore?: number;
    id: number;
    moodScore?: number;
    restaurant: ApiRestaurant;
    tasteScore?: number;
    valueScore?: number;
  }>;
};

const LIST_ACCENT_COLORS = ['#F46A67', '#56CDB5', '#8361C8', '#F6B033', '#5D8DF4', '#E96DC0'];
const DEFAULT_PAGE_SIZE = 50;

async function fetchPaginatedArray<T>(
  path: string,
  options: {
    query?: Record<string, string | number | boolean | undefined>;
    token: string;
  },
) {
  const aggregated: T[] = [];
  let page = 0;

  while (true) {
    const response = await apiRequest<unknown>(path, {
      token: options.token,
      query: {
        ...options.query,
        page,
        size: DEFAULT_PAGE_SIZE,
      },
    });

    if (Array.isArray(response)) {
      return response as T[];
    }

    const items = extractWrappedItems(response) as T[];
    aggregated.push(...items);

    const hasNext = getBooleanField(response, 'hasNext');
    const currentPage = getNumberField(response, 'page');
    const totalPages = getNumberField(response, 'totalPages');

    if (hasNext === true) {
      page += 1;
      continue;
    }

    if (
      hasNext === undefined &&
      currentPage !== undefined &&
      totalPages !== undefined &&
      currentPage + 1 < totalPages
    ) {
      page += 1;
      continue;
    }

    return aggregated;
  }
}

export function getOAuthAuthorizationUrl(provider: AuthProvider) {
  return `${getApiBaseUrl()}/oauth2/authorization/${provider}`;
}

export function extractAuthTokens(url: string) {
  try {
    const parsedUrl = new URL(url);
    const accessToken = parsedUrl.searchParams.get('accessToken');
    const refreshToken = parsedUrl.searchParams.get('refreshToken');
    const needsProfileParam = parsedUrl.searchParams.get('needsProfile');

    if (!accessToken) {
      return null;
    }

    return {
      accessToken,
      needsProfile:
        needsProfileParam === null ? null : needsProfileParam.toLowerCase() === 'true',
      refreshToken,
    };
  } catch {
    return null;
  }
}

export async function getRestaurantRankings(
  token: string,
  query: {
    category?: string;
    limit?: number;
    regionName?: string;
  },
) {
  const response = await apiRequest<unknown>('/rankings/restaurants', {
    token,
    query,
  });

  return {
    items: extractWrappedItems(response).map((item, index) =>
      normalizeRestaurantRankingItem(item, index),
    ),
  } satisfies ApiRestaurantRankingResponse;
}

export async function searchRestaurants(token: string, keyword: string) {
  return fetchPaginatedArray<ApiRestaurant>('/restaurants', {
    token,
    query: { keyword },
  });
}

export async function searchAll(token: string, query: string) {
  return apiRequest<ApiSearchResponse>('/search', {
    token,
    query: { query },
  });
}

export async function getRestaurant(token: string, restaurantId: number) {
  return apiRequest<ApiRestaurant>(`/restaurants/${restaurantId}`, {
    token,
  });
}

export async function getRestaurantParkingLots(
  token: string,
  restaurantId: number,
  query?: {
    limit?: number;
    parkingLotDivision?: string;
  },
) {
  return apiRequest<ApiParkingLot[]>(`/restaurants/${restaurantId}/parking-lots`, {
    token,
    query,
  });
}

export async function getListRecommendations(token: string) {
  const response = await apiRequest<unknown>('/recommendations/lists', {
    token,
  });

  return {
    items: extractWrappedItems(response).map((item, index) =>
      normalizeListRecommendationItem(item, index),
    ),
  } satisfies ApiListRecommendationResponse;
}

export async function getRestaurantRecommendations(token: string) {
  const response = await apiRequest<unknown>('/recommendations/restaurants', {
    token,
  });

  return {
    items: extractWrappedItems(response).map((item, index) =>
      normalizeRestaurantRecommendationItem(item, index),
    ),
  } satisfies ApiRestaurantRecommendationResponse;
}

export async function createAiCallReservation(
  token: string,
  restaurantId: number,
  body: ApiCreateAiCallReservationRequest,
) {
  return apiRequest<ApiReservation>(`/restaurants/${restaurantId}/reservations/ai-call`, {
    method: 'POST',
    token,
    body,
  });
}

export async function getMyReservations(token: string) {
  return apiRequest<ApiReservationListResponse>('/reservations', {
    token,
  });
}

export async function getReservation(token: string, reservationId: number) {
  return apiRequest<ApiReservation>(`/reservations/${reservationId}`, {
    token,
  });
}

export async function cancelReservation(token: string, reservationId: number) {
  return apiRequest<void>(`/reservations/${reservationId}/cancel`, {
    method: 'PATCH',
    token,
  });
}

export async function getHiddenGemRestaurants(
  token: string,
  query?: {
    regionKeyword?: string;
    regionName?: string;
    regionTownName?: string;
    townName?: string;
  },
) {
  return apiRequest<ApiHiddenGemRestaurantResponse>('/recommendations/restaurants/hidden-gems', {
    token,
    query,
  });
}

export async function getRestaurantReviews(token: string, restaurantId: number) {
  return fetchPaginatedArray<ApiReview>(`/restaurants/${restaurantId}/reviews`, {
    token,
  });
}

export async function getRestaurantReviewSummary(token: string, restaurantId: number) {
  return apiRequest<ApiReviewSummary>(`/restaurants/${restaurantId}/reviews/summary`, {
    token,
  });
}

export async function createRestaurantReview(
  token: string,
  restaurantId: number,
  body: {
    content: string;
    imageUrls?: string[];
  },
) {
  return apiRequest<ApiReview>(`/restaurants/${restaurantId}/reviews`, {
    method: 'POST',
    token,
    body,
  });
}

export async function voteReview(
  token: string,
  reviewId: number,
  body: ApiReviewVoteRequest,
) {
  return apiRequest<void>(`/reviews/${reviewId}/vote`, {
    method: 'POST',
    token,
    body,
  });
}

export async function cancelReviewVote(token: string, reviewId: number) {
  return apiRequest<void>(`/reviews/${reviewId}/vote`, {
    method: 'DELETE',
    token,
  });
}

export async function deleteReview(token: string, reviewId: number) {
  return apiRequest<void>(`/reviews/${reviewId}`, {
    method: 'DELETE',
    token,
  });
}

export async function updateReview(
  token: string,
  reviewId: number,
  body: {
    content: string;
    imageUrls?: string[];
  },
) {
  return apiRequest<void>(`/reviews/${reviewId}`, {
    method: 'PATCH',
    token,
    body,
  });
}

export async function createReport(
  token: string,
  body: ApiCreateReportRequest,
) {
  return apiRequest<void>('/reports', {
    method: 'POST',
    token,
    body,
  });
}

export async function getMyInfo(token: string) {
  return apiRequest<ApiUser>('/users/me', {
    token,
  });
}

export async function signupProfile(
  token: string,
  body: {
    birthDay: number;
    birthMonth: number;
    birthYear: number;
    gender: 'FEMALE' | 'MALE';
  },
) {
  return apiRequest<void>('/auth/signup/profile', {
    method: 'POST',
    token,
    body,
  });
}

export async function refreshAuthToken(refreshToken: string) {
  return apiRequest<ApiTokenResponse>('/auth/refresh', {
    method: 'POST',
    body: {
      refreshToken,
    },
    skipAuthRefresh: true,
  });
}

export async function updateMyUser(
  token: string,
  body: {
    nickname?: string;
    profileImageUrl?: string;
  },
) {
  return apiRequest<void>('/users/me', {
    method: 'PATCH',
    token,
    body,
  });
}

export async function deleteMyUser(token: string) {
  return apiRequest<void>('/users/me', {
    method: 'DELETE',
    token,
  });
}

export async function getUserInfo(token: string, userId: number) {
  return apiRequest<ApiUser>(`/users/${userId}`, {
    token,
  });
}

export async function getUserReviews(token: string, userId: number) {
  return fetchPaginatedArray<ApiReview>(`/users/${userId}/reviews`, {
    token,
  });
}

export async function getMyLists(token: string) {
  const items = await fetchPaginatedArray<unknown>('/lists', {
    token,
  });

  return items.map((item, index) => normalizeUserListSummaryItem(item, index));
}

export async function createList(
  token: string,
  body: {
    description?: string;
    isPublic?: boolean;
    regionName: string;
    restaurants: Array<{
      moodScore: number;
      restaurantId: number;
      tasteScore: number;
      valueScore: number;
    }>;
    title: string;
  },
) {
  return apiRequest<ApiUserListSummary>('/lists', {
    method: 'POST',
    token,
    body,
  });
}

export async function setRepresentativeList(token: string, listId: number) {
  return apiRequest<void>(`/lists/${listId}/representative`, {
    method: 'PATCH',
    token,
  });
}

export async function getListDetail(token: string, listId: number) {
  const response = await apiRequest<unknown>(`/lists/${listId}`, {
    token,
  });

  const normalized = normalizeUserListDetail(response);

  if (normalized.restaurants.length === 0 && isUnknownRecord(response)) {
    console.log('[getListDetail] empty restaurants after normalize', {
      keys: Object.keys(response),
      listId,
      rawRestaurantsKeys: ['restaurants', 'listRestaurants', 'items'].filter(
        (key) => key in response,
      ),
    });
  }

  return normalized;
}

export async function getUserRepresentativeList(token: string, userId: number) {
  const response = await apiRequest<unknown>(`/lists/users/${userId}/representative`, {
    token,
  });

  const normalized = normalizeUserListDetail(response);

  if (normalized.restaurants.length === 0 && isUnknownRecord(response)) {
    console.log('[getUserRepresentativeList] empty restaurants after normalize', {
      keys: Object.keys(response),
      nestedDataKeys: getNestedRecord(response, 'data')
        ? Object.keys(getNestedRecord(response, 'data')!)
        : undefined,
      userId,
    });
  }

  return normalized;
}

export async function updateList(
  token: string,
  listId: number,
  body: {
    title: string;
    description?: string;
  },
) {
  return apiRequest<ApiUserListSummary>(`/lists/${listId}`, {
    method: 'PATCH',
    token,
    body,
  });
}

export async function deleteList(token: string, listId: number) {
  return apiRequest<void>(`/lists/${listId}`, {
    method: 'DELETE',
    token,
  });
}

export async function toggleListVisibility(token: string, listId: number) {
  return apiRequest<void>(`/lists/${listId}/visibility`, {
    method: 'PATCH',
    token,
  });
}

export async function removeRestaurantFromList(
  token: string,
  listId: number,
  restaurantId: number,
) {
  return apiRequest<void>(`/lists/${listId}/restaurants/${restaurantId}`, {
    method: 'DELETE',
    token,
  });
}

export async function addRestaurantToList(
  token: string,
  listId: number,
  body: {
    moodScore: number;
    restaurantId: number;
    tasteScore: number;
    valueScore: number;
  },
) {
  return apiRequest<void>(`/lists/${listId}/restaurants`, {
    method: 'POST',
    token,
    body,
  });
}

export async function addExternalRestaurantToListFallback(
  token: string,
  listId: number,
  body: {
    externalPlaceId: string;
    moodScore: number;
    searchQuery: string;
    tasteScore: number;
    valueScore: number;
  },
) {
  return apiRequest<void>(`/lists/${listId}/restaurants/external-fallback`, {
    method: 'POST',
    token,
    body,
  });
}

export async function likeList(token: string, listId: number) {
  return apiRequest<void>(`/lists/${listId}/like`, {
    method: 'POST',
    token,
  });
}

export async function unlikeList(token: string, listId: number) {
  return apiRequest<void>(`/lists/${listId}/like`, {
    method: 'DELETE',
    token,
  });
}

export async function getListLikeCount(token: string, listId: number) {
  return apiRequest<number>(`/lists/${listId}/like/count`, {
    token,
  });
}

export async function updateRestaurantInList(
  token: string,
  listId: number,
  restaurantId: number,
  body: {
    moodScore: number;
    tasteScore: number;
    valueScore: number;
  },
) {
  return apiRequest<void>(`/lists/${listId}/restaurants/${restaurantId}`, {
    method: 'PATCH',
    token,
    body,
  });
}

export async function getFollowCount(token: string, userId: number) {
  return apiRequest<ApiFollowCount>(`/users/${userId}/follow/count`, {
    token,
  });
}

export async function getFollowings(token: string, userId: number) {
  return fetchPaginatedArray<ApiFollowUser>(`/users/${userId}/followings`, {
    token,
  });
}

export async function getFollowStatus(token: string, userId: number) {
  const response = await apiRequest<unknown>(`/users/${userId}/follow/status`, {
    token,
  });

  if (typeof response === 'boolean') {
    return response;
  }

  return (
    getBooleanField(response, 'isFollowing') ??
    getBooleanField(response, 'following') ??
    getBooleanField(response, 'followed') ??
    getBooleanField(response, 'value') ??
    false
  );
}

export async function getReliabilityScore(token: string, userId: number) {
  return apiRequest<ApiReliabilityScore>(`/users/${userId}/reliability`, {
    token,
  });
}

export async function getFollowers(token: string, userId: number) {
  return fetchPaginatedArray<ApiFollowUser>(`/users/${userId}/followers`, {
    token,
  });
}

export async function followUser(token: string, userId: number) {
  return apiRequest<void>(`/users/${userId}/follow`, {
    method: 'POST',
    token,
  });
}

export async function unfollowUser(token: string, userId: number) {
  return apiRequest<void>(`/users/${userId}/follow`, {
    method: 'DELETE',
    token,
  });
}

export async function getNotifications(token: string) {
  return fetchPaginatedArray<ApiNotification>('/notifications', {
    token,
  });
}

export async function getUnreadNotificationCount(token: string) {
  return apiRequest<number>('/notifications/unread/count', {
    token,
  });
}

export async function markNotificationAsRead(token: string, notificationId: number) {
  return apiRequest<void>(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
    token,
  });
}

export async function markAllNotificationsAsRead(token: string) {
  return apiRequest<void>('/notifications/read/all', {
    method: 'PATCH',
    token,
  });
}

export function getRestaurantPhotoUris(
  restaurant: Pick<ApiRestaurant, 'imageUrl' | 'imageUrls' | 'photoUrls' | 'photos'>,
) {
  const photoUris = [
    ...(restaurant.imageUrls ?? []),
    ...(restaurant.photoUrls ?? []),
    ...(restaurant.photos ?? []).map((photo) => photo?.imageUrl),
    ...(restaurant.imageUrl ? [restaurant.imageUrl] : []),
  ].filter((uri): uri is string => typeof uri === 'string' && uri.trim().length > 0);

  return Array.from(new Set(photoUris));
}

export function getRestaurantPrimaryImageUri(
  restaurant: Pick<ApiRestaurant, 'imageUrl' | 'imageUrls' | 'photoUrls' | 'photos'>,
) {
  return getRestaurantPhotoUris(restaurant)[0];
}

function convertTenPointToFiveStar(value: number) {
  return value / 2;
}

export function mapRankingItems(items: ApiRestaurantRankingItem[]): RankingEntry[] {
  return items.map((item, index) => ({
    id: `ranking-${item.restaurantId ?? index + 1}-${index}`,
    name: item.restaurantName,
    meta: [item.categories?.[0], item.regionName].filter(Boolean).join(' · '),
    imageUri: item.imageUrl,
  }));
}

export function mapRestaurantSearchResults(restaurants: ApiRestaurant[]) {
  return restaurants.map((restaurant) => ({
    address: restaurant.address,
    category: restaurant.categories?.[0] ?? restaurant.regionName,
    id: String(restaurant.id),
    imageUri: getRestaurantPrimaryImageUri(restaurant),
    name: restaurant.name,
    regionName: restaurant.regionName,
  }));
}

export function mapListDetailToMyList(detail: ApiUserListDetail, index: number): MyList {
  return {
    id: String(detail.id),
    title: detail.title,
    isRepresentative: detail.isRepresentative,
    isPrivate: !detail.isPublic,
    restaurantCount: detail.restaurants.length,
    accentColor: LIST_ACCENT_COLORS[index % LIST_ACCENT_COLORS.length],
    restaurants: detail.restaurants.map((item) => ({
      id: String(item.restaurant.id),
      listItemId: String(item.id),
      name: item.restaurant.name,
      address: item.restaurant.address,
      imageUri: getRestaurantPrimaryImageUri(item.restaurant),
      ratings:
        item.tasteScore !== undefined &&
        item.valueScore !== undefined &&
        item.moodScore !== undefined
          ? {
              taste: convertTenPointToFiveStar(item.tasteScore),
              service: convertTenPointToFiveStar(item.moodScore),
              value: convertTenPointToFiveStar(item.valueScore),
            }
          : undefined,
    })),
  };
}

export function mapListSummaryToMyList(summary: ApiUserListSummary, index: number): MyList {
  return {
    id: String(summary.id),
    title: summary.title,
    isRepresentative: summary.isRepresentative,
    isPrivate: !summary.isPublic,
    restaurantCount: 0,
    accentColor: LIST_ACCENT_COLORS[index % LIST_ACCENT_COLORS.length],
    restaurants: [],
  };
}

export function formatBirthDate(user: ApiUser) {
  if (!user.birthYear || !user.birthMonth || !user.birthDay) {
    return null;
  }

  return `${user.birthYear}년 ${user.birthMonth}월 ${user.birthDay}일`;
}

export function formatGenderLabel(gender?: ApiUser['gender']) {
  if (gender === 'MALE') {
    return '남성';
  }

  if (gender === 'FEMALE') {
    return '여성';
  }

  return null;
}
