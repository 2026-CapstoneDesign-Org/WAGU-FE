import { RankingEntry } from '../data/rankings';
import { MyList } from '../data/myLists';

import { apiRequest, getApiBaseUrl } from './client';

export type AuthProvider = 'google' | 'kakao' | 'naver';

export type ApiRestaurant = {
  address: string;
  categories?: string[];
  id: number;
  imageUrl?: string;
  imageUrls?: string[];
  lat?: number;
  lng?: number;
  name: string;
  photoUrls?: string[];
  photos?: string[];
  regionName: string;
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

export async function getRestaurant(token: string, restaurantId: number) {
  return apiRequest<ApiRestaurant>(`/restaurants/${restaurantId}`, {
    token,
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

export async function getFollowCount(token: string, userId: number) {
  return apiRequest<ApiFollowCount>(`/users/${userId}/follow/count`, {
    token,
  });
}

export function getRestaurantPhotoUris(restaurant: Pick<ApiRestaurant, 'imageUrl' | 'imageUrls' | 'photoUrls' | 'photos'>) {
  const photoUris = [
    ...(restaurant.imageUrls ?? []),
    ...(restaurant.photoUrls ?? []),
    ...(restaurant.photos ?? []),
    ...(restaurant.imageUrl ? [restaurant.imageUrl] : []),
  ].filter(Boolean);

  return Array.from(new Set(photoUris));
}

export function getRestaurantPrimaryImageUri(
  restaurant: Pick<ApiRestaurant, 'imageUrl' | 'imageUrls' | 'photoUrls' | 'photos'>,
) {
  return getRestaurantPhotoUris(restaurant)[0];
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
      name: item.restaurant.name,
      address: item.restaurant.address,
      imageUri: getRestaurantPrimaryImageUri(item.restaurant),
      ratings:
        item.tasteScore !== undefined &&
        item.valueScore !== undefined &&
        item.moodScore !== undefined
          ? {
              taste: item.tasteScore,
              service: item.moodScore,
              value: item.valueScore,
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
