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

export type ApiReview = {
  categoryName?: string;
  content: string;
  createdAt: string;
  dislikeCount: number;
  id: number;
  imageUrls?: string[];
  likeCount: number;
  nickname: string;
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

type ApiReviewVoteRequest = {
  voteType: 'DISLIKE' | 'LIKE';
};

export type ApiListRecommendationItem = {
  categorySummary?: string[];
  description?: string;
  fallbackRegion?: boolean;
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

type ApiUserListSummary = {
  createdAt?: string;
  description?: string;
  id: number;
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

export function getOAuthAuthorizationUrl(provider: AuthProvider) {
  return `${getApiBaseUrl()}/oauth2/authorization/${provider}`;
}

export function extractAuthTokens(url: string) {
  try {
    const parsedUrl = new URL(url);
    const accessToken = parsedUrl.searchParams.get('accessToken');
    const refreshToken = parsedUrl.searchParams.get('refreshToken');

    if (!accessToken) {
      return null;
    }

    return {
      accessToken,
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
  return apiRequest<ApiRestaurantRankingResponse>('/rankings/restaurants', {
    token,
    query,
  });
}

export async function searchRestaurants(token: string, keyword: string) {
  return apiRequest<ApiRestaurant[]>('/restaurants', {
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

export async function getListRecommendations(token: string) {
  return apiRequest<ApiListRecommendationResponse>('/recommendations/lists', {
    token,
  });
}

export async function getRestaurantReviews(token: string, restaurantId: number) {
  return apiRequest<ApiReview[]>(`/restaurants/${restaurantId}/reviews`, {
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

export async function getUserInfo(token: string, userId: number) {
  return apiRequest<ApiUser>(`/users/${userId}`, {
    token,
  });
}

export async function getUserReviews(token: string, userId: number) {
  return apiRequest<ApiReview[]>(`/users/${userId}/reviews`, {
    token,
  });
}

export async function getMyLists(token: string) {
  return apiRequest<ApiUserListSummary[]>('/lists', {
    token,
  });
}

export async function createList(
  token: string,
  body: {
    description?: string;
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
  return apiRequest<ApiUserListDetail>(`/lists/${listId}`, {
    token,
  });
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
  return apiRequest<ApiFollowUser[]>(`/users/${userId}/followings`, {
    token,
  });
}

export async function getFollowStatus(token: string, userId: number) {
  return apiRequest<boolean>(`/users/${userId}/follow/status`, {
    token,
  });
}

export async function getReliabilityScore(token: string, userId: number) {
  return apiRequest<ApiReliabilityScore>(`/users/${userId}/reliability`, {
    token,
  });
}

export async function getFollowers(token: string, userId: number) {
  return apiRequest<ApiFollowUser[]>(`/users/${userId}/followers`, {
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
  return items.map((item) => ({
    id: `ranking-${item.restaurantId}`,
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
