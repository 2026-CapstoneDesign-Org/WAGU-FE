import { useEffect, useState } from 'react';
import { useMemo } from 'react';
import { useRef } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  ApiReservation,
  addExternalRestaurantToListFallback,
  addRestaurantToList,
  cancelReviewVote,
  createReport,
  createRestaurantReview,
  createList,
  deleteMyUser,
  deleteReview,
  deleteList,
  formatBirthDate,
  formatGenderLabel,
  followUser,
  getFollowers,
  getFollowCount,
  getFollowStatus,
  getFollowings,
  getUnreadNotificationCount,
  getListDetail,
  getListLikeCount,
  getListRecommendations,
  getUserRepresentativeList,
  getMyInfo,
  getMyLists,
  getReliabilityScore,
  getRestaurantRecommendations,
  getRestaurantRankings,
  getUserInfo,
  getUserReviews,
  mapListDetailToMyList,
  mapListSummaryToMyList,
  mapRankingItems,
  removeRestaurantFromList,
  searchRestaurants,
  setRepresentativeList,
  signupProfile,
  toggleListVisibility,
  likeList,
  unfollowUser,
  refreshAuthToken,
  unlikeList,
  updateReview,
  updateRestaurantInList,
  updateList,
  updateMyUser,
  voteReview,
} from '../api/wagu';
import { ApiError, isAuthError, setAuthRefreshHandler } from '../api/client';
import { uploadImageWithPresignedUrl } from '../api/upload';
import { AppTab } from '../components/BottomTabBar';
import { MOCK_DATA_ENABLED } from '../config/mockData';
import { FriendTabKey, FriendUser, FollowTogglePayload, MY_FOLLOWER_USERS, MY_FOLLOWING_USERS } from '../data/myFriends';
import { userFriendConnectionsByUserId } from '../data/userFriendConnections';
import { initialMyLists, MyList } from '../data/myLists';
import { MyReview, myReviews } from '../data/myReviews';
import { localRankingEntries, nationalRankingEntries, RankingEntry } from '../data/rankings';
import { Restaurant, restaurants as initialRestaurantPool } from '../data/restaurants';
import { userReviewsByUserId } from '../data/userReviews';
import { AddRestaurantToListRatingScreen } from '../screens/AddRestaurantToListRatingScreen';
import { AddRestaurantToListSelectScreen } from '../screens/AddRestaurantToListSelectScreen';
import { AiReservationFormScreen } from '../screens/AiReservationFormScreen';
import { AiReservationPendingScreen } from '../screens/AiReservationPendingScreen';
import { AiReservationResultScreen } from '../screens/AiReservationResultScreen';
import { AiChatScreen } from '../screens/AiChatScreen';
import { DeleteAccountScreen } from '../screens/DeleteAccountScreen';
import { EditNicknameScreen } from '../screens/EditNicknameScreen';
import { LadderGamePlayScreen } from '../screens/LadderGamePlayScreen';
import { LadderGameStartScreen } from '../screens/LadderGameStartScreen';
import {
  HomeProfileCardItem,
  HomeRestaurantCardItem,
  HomeScrollState,
  MainHomeScreen,
} from '../screens/MainHomeScreen';
import { MapScreen } from '../screens/MapScreen';
import { MapSearchScreen } from '../screens/MapSearchScreen';
import { LoginProvider, MyInfoScreen } from '../screens/MyInfoScreen';
import { MyFriendsScreen } from '../screens/MyFriendsScreen';
import { MyListDetailScreen } from '../screens/MyListDetailScreen';
import { MyListPlaceEditScreen } from '../screens/MyListPlaceEditScreen';
import { MyListsScreen } from '../screens/MyListsScreen';
import { MyPageScreen, MyPageScrollState } from '../screens/MyPageScreen';
import { MyReviewsScreen } from '../screens/MyReviewsScreen';
import { NewsScreen } from '../screens/NewsScreen';
import { OnboardingLoginScreen } from '../screens/OnboardingLoginScreen';
import { RankingDetailScreen } from '../screens/RankingDetailScreen';
import { RankingTabScreen, RankingTabScrollState } from '../screens/RankingTabScreen';
import { RegistrationCompleteScreen } from '../screens/RegistrationCompleteScreen';
import { ReliabilityGuideScreen } from '../screens/ReliabilityGuideScreen';
import { RestaurantDetailScreen } from '../screens/RestaurantDetailScreen';
import { SearchResultScreen } from '../screens/SearchResultScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SnailRacePlayScreen } from '../screens/SnailRacePlayScreen';
import { SnailRaceStartScreen } from '../screens/SnailRaceStartScreen';
import { SignupNicknameScreen } from '../screens/SignupNicknameScreen';
import { SignupProfileScreen } from '../screens/SignupProfileScreen';
import { TasteRatingScreen } from '../screens/TasteRatingScreen';
import { TasteListNameScreen } from '../screens/TasteListNameScreen';
import { TasteSelectionScreen } from '../screens/TasteSelectionScreen';
import { UserReviewsScreen } from '../screens/UserReviewsScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import { WorldCupBattleScreen } from '../screens/WorldCupBattleScreen';
import { WorldCupResultScreen } from '../screens/WorldCupResultScreen';
import { WorldCupStartScreen } from '../screens/WorldCupStartScreen';
import { WriteReviewDraft, WriteReviewScreen } from '../screens/WriteReviewScreen';
import { UserProfile, userProfiles } from '../data/userProfiles';
import {
  AiReservationDraft,
  AiReservationResult,
} from '../types/aiReservation';
import { LadderGameSetup } from '../types/ladderGame';
import { WorldCupCategory, WorldCupEntry } from '../types/worldCup';
import { normalizeReliabilityGrade } from '../utils/reliability';
import { buildLadderSetup } from '../utils/ladderGame';
import {
  clearStoredSession,
  readStoredSession,
  writeStoredSession,
} from './sessionStorage';

type SearchResultTabKey = 'restaurant' | 'user' | 'region';

type FlowScreen =
  | 'auth-loading'
  | 'login'
  | 'signup-nickname'
  | 'signup-profile'
  | 'taste'
  | 'taste-list-name'
  | 'rating'
  | 'complete'
  | 'add-to-list-select'
  | 'add-to-list-rating'
  | 'tabs'
  | 'ai-chat'
  | 'news'
  | 'search'
  | 'search-result'
  | 'map-search'
  | 'settings'
  | 'my-info'
  | 'my-friends'
  | 'user-friends'
  | 'my-lists'
  | 'my-list-detail'
  | 'my-list-place-edit'
  | 'my-reviews'
  | 'user-reviews'
  | 'write-review'
  | 'edit-nickname'
  | 'delete-account'
  | 'restaurant-detail'
  | 'ai-reservation-form'
  | 'ai-reservation-pending'
  | 'ai-reservation-result'
  | 'ladder-start'
  | 'ladder-play'
  | 'snail-race-start'
  | 'snail-race-play'
  | 'worldcup-start'
  | 'worldcup-battle'
  | 'worldcup-result'
  | 'reliability-guide'
  | 'ranking-detail'
  | 'user-profile';

type RankingDetailState =
  | {
      items: RankingEntry[];
      source: 'tabs';
      sourceTab: AppTab;
      title: string;
      variant: 'local' | 'national';
    }
  | {
      isLoading: boolean;
      items: RankingEntry[];
      regionName: string;
      source: 'search-result';
      title: string;
      variant: 'region';
    }
  | null;

function AuthLoadingScreen() {
  return (
    <View style={styles.authLoadingScreen}>
      <ActivityIndicator size="large" color="#FF3B30" />
    </View>
  );
}

type RestaurantDetailSource =
  | { type: 'search-result' }
  | { type: 'my-reviews' }
  | { type: 'user-reviews'; userId: string }
  | { type: 'my-list-detail'; listId: string }
  | { type: 'user-profile'; userId: string }
  | { type: 'tabs'; tab: AppTab }
  | { type: 'ranking-detail'; detail: NonNullable<RankingDetailState> }
  | null;

type UserProfileSource =
  | { type: 'my-friends'; tab: FriendTabKey }
  | { type: 'user-friends'; userId: string; tab: FriendTabKey }
  | { type: 'search-result' }
  | { type: 'home' }
  | { type: 'restaurant-detail' }
  | null;

type UserProfileHistoryEntry = {
  userId: string;
  source: UserProfileSource;
};

type ReliabilityGuideSource = 'my-page' | 'user-profile' | null;

function sortFollowersForInitialView(users: FriendUser[]) {
  return [...users].sort((left, right) => {
    if (left.isFollowing === right.isFollowing) {
      return 0;
    }

    return left.isFollowing ? 1 : -1;
  });
}

function mapFollowUsersToFriendUsers(
  users: Array<{ nickname: string; userId: number }>,
  followingUserIds: Set<number>,
) {
  return users.map((user) => ({
    id: String(user.userId),
    isFollowing: followingUserIds.has(user.userId),
    name: user.nickname,
    reliabilityGrade: undefined,
    reviewCount: 0,
    showFollowAction: true,
  }));
}

async function hydrateFriendUsersWithReliability(
  token: string,
  users: Array<{ nickname: string; userId: number }>,
  followingUserIds: Set<number>,
) {
  const results = await Promise.allSettled(
    users.map(async (user) => {
      const reliability = await getReliabilityScore(token, user.userId).catch(() => null);

      return {
        id: String(user.userId),
        isFollowing: followingUserIds.has(user.userId),
        name: user.nickname,
        reliabilityGrade: normalizeReliabilityGrade(reliability?.grade) ?? undefined,
        reviewCount: 0,
        showFollowAction: true,
      } satisfies FriendUser;
    }),
  );

  return results.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []));
}

function buildFriendUserFromSources(
  userId: string,
  sources: Array<FriendUser[]>,
  fallbackProfiles: UserProfile[],
) {
  const matchedUser = sources.flat().find((user) => user.id === userId);

  if (matchedUser) {
    return { ...matchedUser };
  }

  const targetProfile = fallbackProfiles.find((profile) => profile.id === userId);

  if (!targetProfile) {
    return null;
  }

  return {
    id: userId,
    isFollowing: true,
    name: targetProfile.nickname,
    reliabilityGrade: targetProfile.reliabilityGrade,
    reviewCount: Number(targetProfile.reviewCount ?? 0) || 0,
    showFollowAction: true,
  } satisfies FriendUser;
}

const HOME_PROFILE_ACCENT_COLORS = [
  '#F46A67',
  '#56CDB5',
  '#8361C8',
  '#F6B033',
  '#5D8DF4',
  '#E96DC0',
];

const retryAsync = async <T,>(
  operation: () => Promise<T>,
  attempts = 3,
  delayMs = 450,
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === attempts - 1) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
};

function mergeUserProfiles(
  primaryProfiles: UserProfile[],
  fallbackProfiles: UserProfile[],
) {
  const mergedProfiles = [...primaryProfiles];
  const existingIds = new Set(primaryProfiles.map((profile) => profile.id));

  fallbackProfiles.forEach((profile) => {
    if (existingIds.has(profile.id)) {
      return;
    }

    mergedProfiles.push(profile);
  });

  return mergedProfiles;
}

function createSearchResultUserProfile(user: {
  id: string;
  nickname: string;
  profileImageUrl?: string;
  reliabilityGrade?: string;
}): UserProfile {
  const numericId = Number(user.id);
  const accentColor =
    HOME_PROFILE_ACCENT_COLORS[
      Number.isFinite(numericId)
        ? Math.abs(numericId) % HOME_PROFILE_ACCENT_COLORS.length
        : 0
    ];

  return {
    id: user.id,
    nickname: user.nickname,
    profileImageUrl: user.profileImageUrl,
    reliabilityGrade: user.reliabilityGrade,
    reviewCount: '0',
    representativeAccentColor: accentColor,
    representativeListIsLiked: false,
    representativeListId: undefined,
    representativeListTitle: '대표 리스트',
    representativeRestaurants: [],
  };
}

function formatApiReviewDate(createdAt?: string) {
  if (!createdAt) {
    return '';
  }

  const parsed = new Date(createdAt);

  if (Number.isNaN(parsed.getTime())) {
    return createdAt.replaceAll('-', '.').slice(0, 10);
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
}

function mapApiReviewToMyReview(review: {
  id: number;
  content: string;
  createdAt: string;
  dislikeCount: number;
  imageUrls?: string[];
  likeCount: number;
  myVoteType?: 'DISLIKE' | 'LIKE';
  restaurant?: {
    id: number;
    imageUrl?: string;
    name: string;
    regionName?: string;
  };
  restaurantName?: string;
  categoryName?: string;
}): MyReview {
  return {
    id: String(review.id),
    myReaction:
      review.myVoteType === 'LIKE'
        ? 'like'
        : review.myVoteType === 'DISLIKE'
          ? 'dislike'
          : null,
    restaurantId: review.restaurant ? String(review.restaurant.id) : undefined,
    restaurantImageUri: review.restaurant?.imageUrl,
    restaurantName: review.restaurant?.name ?? review.restaurantName ?? '식당 정보 없음',
    category: review.categoryName ?? review.restaurant?.regionName ?? '',
    date: formatApiReviewDate(review.createdAt),
    content: review.content,
    likes: review.likeCount,
    dislikes: review.dislikeCount,
    imageUris: review.imageUrls ?? [],
  };
}

function buildAiReservationResult(
  draft: AiReservationDraft,
  reservation: ApiReservation,
): AiReservationResult {
  if (reservation.status === 'CONFIRMED') {
    return {
      detail:
        reservation.aiSummary ??
        `${draft.reservationDateLabel} ${draft.reservationTimeLabel}에 ${draft.partySize}명 예약으로 정리했어요.`,
      status: 'confirmed',
      summary:
        reservation.resultMessage ?? 'AI가 매장과 통화해 예약 가능하다는 답변을 받았어요.',
      title: '예약 완료',
    };
  }

  if (reservation.status === 'UNAVAILABLE') {
    return {
      detail:
        reservation.failureReason ??
        reservation.aiSummary ??
        '매장에서 해당 시간대는 예약이 어렵다고 안내했어요.',
      status: 'rejected',
      summary:
        reservation.resultMessage ?? '매장에서 해당 시간 예약이 어렵다고 답변했어요.',
      title: '예약 실패',
    };
  }

  if (reservation.status === 'NEEDS_CONFIRMATION') {
    return {
      detail:
        reservation.aiSummary ??
        reservation.failureReason ??
        '매장에서 추가 확인이 필요하다고 안내했어요.',
      status: 'needs-confirmation',
      summary: reservation.resultMessage ?? '추가 확인이 필요한 예약으로 접수되었어요.',
      title: '추가 확인 필요',
    };
  }

  if (reservation.status === 'CANCELED') {
    return {
      detail:
        reservation.resultMessage ??
        reservation.failureReason ??
        '예약 요청이 취소되었어요.',
      status: 'canceled',
      summary: '예약 요청이 더 이상 진행되지 않았어요.',
      title: '예약 취소',
    };
  }

  return {
    detail:
      reservation.failureReason ??
      reservation.aiSummary ??
      '전화를 받지 않아 예약 가능 여부를 확인하지 못했어요.',
    status: 'no-answer',
    summary:
      reservation.resultMessage ?? '매장과 연결되지 않아 예약 확인을 마치지 못했어요.',
    title: '전화 연결 실패',
  };
}

type AuthSession = {
  accessToken: string;
  needsProfile?: boolean | null;
  refreshToken: string | null;
};

export function AppRoot() {
  const fallbackMyLists = MOCK_DATA_ENABLED ? initialMyLists : [];
  const fallbackFollowerCount = MOCK_DATA_ENABLED ? MY_FOLLOWER_USERS.length : 0;
  const fallbackFollowingUsers = MOCK_DATA_ENABLED ? MY_FOLLOWING_USERS : [];
  const fallbackFollowerUsers = MOCK_DATA_ENABLED ? MY_FOLLOWER_USERS : [];
  const fallbackUserProfiles = MOCK_DATA_ENABLED ? userProfiles : [];
  const visibleUserReviewsByUserId = MOCK_DATA_ENABLED ? userReviewsByUserId : {};
  const visibleUserFriendConnectionsByUserId = MOCK_DATA_ENABLED
    ? userFriendConnectionsByUserId
    : {};
  const fallbackRankingEntries = MOCK_DATA_ENABLED
    ? {
        local: localRankingEntries,
        national: nationalRankingEntries,
      }
    : {
        local: [] as RankingEntry[],
        national: [] as RankingEntry[],
      };
  const fallbackLocalRankingRegion = '용인';
  const initialHomeScrollState: HomeScrollState = {
    bannerLoopIndex: 1,
    influencersX: 0,
    localRankingX: 0,
    mealFriendsX: 0,
    nationalRankingX: 0,
    verticalY: 0,
  };
  const initialRankingScrollState: RankingTabScrollState = {
    localRankingX: 0,
    nationalRankingX: 0,
    verticalY: 0,
  };
  const initialMyPageScrollState: MyPageScrollState = {
    verticalY: 0,
  };
  const [completionSource, setCompletionSource] = useState<'taste-flow' | 'add-to-list'>(
    'taste-flow',
  );
  const createTasteListLockRef = useRef(false);
  const [tasteFlowSource, setTasteFlowSource] = useState<'onboarding' | 'my-lists'>(
    'onboarding',
  );
  const [screen, setScreen] = useState<FlowScreen>('auth-loading');
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [rankingDetail, setRankingDetail] = useState<RankingDetailState>(null);
  const [selectedRestaurants, setSelectedRestaurants] = useState<Restaurant[]>([]);
  const [tasteListName, setTasteListName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScreenInitialQuery, setSearchScreenInitialQuery] = useState('');
  const [searchResultTab, setSearchResultTab] = useState<SearchResultTabKey>('restaurant');
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [homeScrollState, setHomeScrollState] = useState<HomeScrollState>(initialHomeScrollState);
  const [homeRestoreKey, setHomeRestoreKey] = useState(0);
  const [homeRestoreAnimated, setHomeRestoreAnimated] = useState(false);
  const [rankingScrollState, setRankingScrollState] =
    useState<RankingTabScrollState>(initialRankingScrollState);
  const [rankingRestoreKey, setRankingRestoreKey] = useState(0);
  const [rankingRestoreAnimated, setRankingRestoreAnimated] = useState(false);
  const [myPageScrollState, setMyPageScrollState] =
    useState<MyPageScrollState>(initialMyPageScrollState);
  const [myPageRestoreKey, setMyPageRestoreKey] = useState(0);
  const [myPageRestoreAnimated, setMyPageRestoreAnimated] = useState(false);
  const [myFriendsInitialTab, setMyFriendsInitialTab] =
    useState<FriendTabKey>('following');
  const [myLists, setMyLists] = useState<MyList[]>(fallbackMyLists);
  const [followerCount, setFollowerCount] = useState(fallbackFollowerCount);
  const [myFollowingUsers, setMyFollowingUsers] = useState<FriendUser[]>(fallbackFollowingUsers);
  const [myFollowerUsers, setMyFollowerUsers] =
    useState<FriendUser[]>(sortFollowersForInitialView(fallbackFollowerUsers));
  const [myReviewItems, setMyReviewItems] = useState<MyReview[]>(MOCK_DATA_ENABLED ? myReviews : []);
  const [remoteUserReviewsByUserId, setRemoteUserReviewsByUserId] = useState<
    Record<string, MyReview[]>
  >({});
  const [reviewReactionPendingIds, setReviewReactionPendingIds] = useState<string[]>([]);
  const [remoteUserFriendConnectionsByUserId, setRemoteUserFriendConnectionsByUserId] =
    useState<
      Record<
        string,
        {
          followers: FriendUser[];
          following: FriendUser[];
        }
      >
    >({});
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const [myReliabilityGrade, setMyReliabilityGrade] = useState<string | null>(null);
  const [myReliabilityScore, setMyReliabilityScore] = useState<number | null>(null);
  const [myHonorTitle, setMyHonorTitle] = useState<string | null>(null);
  const [myHonorPeriod, setMyHonorPeriod] = useState<string | null>(null);
  const [rankingEntries, setRankingEntries] = useState<{
    local: RankingEntry[];
    national: RankingEntry[];
  }>(fallbackRankingEntries);
  const [localRankingRegion, setLocalRankingRegion] = useState(fallbackLocalRankingRegion);
  const [recommendedMealFriendItems, setRecommendedMealFriendItems] = useState<
    HomeProfileCardItem[]
  >([]);
  const [recommendedRestaurantItems, setRecommendedRestaurantItems] = useState<
    HomeRestaurantCardItem[]
  >([]);
  const [hasUnreadNews, setHasUnreadNews] = useState(false);
  const [recommendedUserProfiles, setRecommendedUserProfiles] = useState<UserProfile[]>([]);
  const [remoteUserProfiles, setRemoteUserProfiles] = useState<UserProfile[]>([]);
  const [searchResultUserProfiles, setSearchResultUserProfiles] = useState<UserProfile[]>([]);
  const [userProfileFollowStateById, setUserProfileFollowStateById] = useState<Record<string, boolean>>(
    {},
  );
  const [userProfileFollowPendingIds, setUserProfileFollowPendingIds] = useState<string[]>([]);
  const [selectedMyListId, setSelectedMyListId] = useState<string | null>(null);
  const [myListLikeCountById, setMyListLikeCountById] = useState<Record<string, number>>({});
  const [myListLikeStateById, setMyListLikeStateById] = useState<Record<string, boolean>>({});
  const [myListLikePendingIds, setMyListLikePendingIds] = useState<string[]>([]);
  const [selectedUserProfileId, setSelectedUserProfileId] = useState<string | null>(null);
  const [userProfileSource, setUserProfileSource] = useState<UserProfileSource>(null);
  const [userProfileHistory, setUserProfileHistory] = useState<UserProfileHistoryEntry[]>([]);
  const [loginProvider, setLoginProvider] = useState<LoginProvider>('kakao');
  const [session, setSession] = useState<AuthSession | null>(null);
  const [requiresProfileSetup, setRequiresProfileSetup] = useState(false);
  const [pendingNickname, setPendingNickname] = useState<string | null>(null);
  const [nickname, setNickname] = useState('먹부림');
  const [selectedRestaurantName, setSelectedRestaurantName] = useState('와이앤웍');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | undefined>(undefined);
  const [restaurantDetailInitialTab, setRestaurantDetailInitialTab] = useState<'home' | 'review'>(
    'home',
  );
  const [aiReservationRestaurant, setAiReservationRestaurant] = useState<{
    address?: string;
    category?: string;
    id: number;
    name: string;
    phone?: string;
  } | null>(null);
  const [aiReservationDraft, setAiReservationDraft] = useState<AiReservationDraft | null>(null);
  const [aiReservationResult, setAiReservationResult] = useState<AiReservationResult | null>(null);
  const [ladderPlayerCount, setLadderPlayerCount] = useState(4);
  const [ladderSetup, setLadderSetup] = useState<LadderGameSetup>(buildLadderSetup(4));
  const [snailRaceCount, setSnailRaceCount] = useState(4);
  const [worldCupCategory, setWorldCupCategory] = useState<WorldCupCategory>('all');
  const [worldCupWinner, setWorldCupWinner] = useState<WorldCupEntry | null>(null);
  const [reliabilityGuideSource, setReliabilityGuideSource] =
    useState<ReliabilityGuideSource>(null);
  const [reliabilityGuideGrade, setReliabilityGuideGrade] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [birthDateLabel, setBirthDateLabel] = useState<string | null>(null);
  const [genderLabel, setGenderLabel] = useState<string | null>(null);
  const [restaurantDetailSource, setRestaurantDetailSource] =
    useState<RestaurantDetailSource>(null);
  const [addToListSource, setAddToListSource] = useState<'restaurant-detail' | 'map' | null>(
    null,
  );
  const [addToListRestaurantSnapshot, setAddToListRestaurantSnapshot] =
    useState<Restaurant | null>(null);
  const [addToListRestaurantId, setAddToListRestaurantId] = useState<string | null>(null);
  const [addToListRestaurantName, setAddToListRestaurantName] = useState<string | null>(null);
  const [addToListTargetListIds, setAddToListTargetListIds] = useState<string[]>([]);
  const [writeReviewRestaurantId, setWriteReviewRestaurantId] = useState<number | null>(null);
  const [writeReviewRestaurantName, setWriteReviewRestaurantName] = useState('');
  const [writeReviewInitialContent, setWriteReviewInitialContent] = useState('');
  const [writeReviewMode, setWriteReviewMode] = useState<'create' | 'edit'>('create');
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const visibleUserProfiles = mergeUserProfiles(
    mergeUserProfiles(
      remoteUserProfiles,
      mergeUserProfiles(searchResultUserProfiles, recommendedUserProfiles),
    ),
    fallbackUserProfiles,
  );
  const userReviewsById = {
    ...visibleUserReviewsByUserId,
    ...remoteUserReviewsByUserId,
  };
  const userFriendConnectionsById = {
    ...visibleUserFriendConnectionsByUserId,
    ...remoteUserFriendConnectionsByUserId,
  };
  const selectedVisibleUserProfile =
    selectedUserProfileId
      ? visibleUserProfiles.find((item) => item.id === selectedUserProfileId) ?? null
      : null;
  const selectedUserProfileKnownFollowing =
    selectedUserProfileId !== null &&
    myFollowingUsers.some((user) => user.id === selectedUserProfileId);
  const selectedUserProfileIsFollowing =
    selectedUserProfileId !== null
      ? userProfileFollowStateById[selectedUserProfileId] ?? selectedUserProfileKnownFollowing
      : false;
  const selectedRepresentativeListId = selectedVisibleUserProfile?.representativeListId ?? null;
  const fallbackSelectedUserProfile: UserProfile | null = selectedUserProfileId
    ? {
        id: selectedUserProfileId,
        nickname: '',
        reviewCount: '0',
        representativeAccentColor:
          HOME_PROFILE_ACCENT_COLORS[
            Math.abs(Number(selectedUserProfileId) || 0) % HOME_PROFILE_ACCENT_COLORS.length
          ],
        representativeListIsLiked: false,
        representativeListTitle: '대표 리스트',
        representativeRestaurants: [],
      }
    : null;

  useEffect(() => {
    if (
      screen !== 'ranking-detail' ||
      !session?.accessToken ||
      !rankingDetail ||
      rankingDetail.variant !== 'region' ||
      !rankingDetail.isLoading
    ) {
      return;
    }

    let cancelled = false;
    const targetRegionName = rankingDetail.regionName;

    const loadRegionRanking = async () => {
      try {
        const result = await getRestaurantRankings(session.accessToken!, {
          limit: 40,
          regionName: targetRegionName,
        });

        if (cancelled) {
          return;
        }

        setRankingDetail((current) => {
          if (
            !current ||
            current.variant !== 'region' ||
            current.regionName !== targetRegionName
          ) {
            return current;
          }

          return {
            ...current,
            isLoading: false,
            items: mapRankingItems(result.items),
          };
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.log('[ranking detail] failed to load region ranking', {
          error,
          regionName: targetRegionName,
        });

        setRankingDetail((current) => {
          if (
            !current ||
            current.variant !== 'region' ||
            current.regionName !== targetRegionName
          ) {
            return current;
          }

          return {
            ...current,
            isLoading: false,
            items: [],
          };
        });
      }
    };

    void loadRegionRanking();

    return () => {
      cancelled = true;
    };
  }, [rankingDetail, screen, session?.accessToken]);
  const mapListRestaurants = useMemo(() => {
    const restaurantsById = new Map<string, Restaurant>();

    myLists.forEach((list) => {
      list.restaurants.forEach((restaurant) => {
        if (restaurantsById.has(restaurant.id)) {
          return;
        }

        const fallbackRestaurant = initialRestaurantPool.find(
          (item) => item.id === restaurant.id,
        );

        restaurantsById.set(restaurant.id, {
          address: restaurant.address,
          category: fallbackRestaurant?.category ?? '맛집',
          id: restaurant.id,
          imageUri: restaurant.imageUri ?? fallbackRestaurant?.imageUri,
          name: restaurant.name,
          photoUris: fallbackRestaurant?.photoUris,
          shortName: fallbackRestaurant?.shortName ?? restaurant.name,
        });
      });
    });

    return Array.from(restaurantsById.values());
  }, [myLists]);

  const applyStoredSession = async (
    provider: LoginProvider,
    nextSession: AuthSession,
  ) => {
    setLoginProvider(provider);
    setSession(nextSession);
    await writeStoredSession({
      accessToken: nextSession.accessToken,
      provider,
      refreshToken: nextSession.refreshToken,
    });
  };

  const clearAuthSession = async () => {
    setSession(null);
    setMyUserId(null);
    setNickname('먹부림');
    setProfileImageUrl(null);
    setBirthDateLabel(null);
    setGenderLabel(null);
    setPendingNickname(null);
    setRequiresProfileSetup(false);
    setMyReliabilityGrade(null);
    setMyReliabilityScore(null);
    setMyHonorTitle(null);
    setMyHonorPeriod(null);
    setMyReviewItems([]);
    setMyLists([]);
    setMyFollowingUsers([]);
    setMyFollowerUsers([]);
    setFollowerCount(0);
    setRecommendedRestaurantItems([]);
    setRecommendedMealFriendItems([]);
    setRecommendedUserProfiles([]);
    setRankingEntries({
      local: [],
      national: [],
    });
    setLocalRankingRegion(fallbackLocalRankingRegion);
    setScreen('login');
    await clearStoredSession();
  };

  const hasRejectedAuthError = (
    results: PromiseSettledResult<unknown>[],
  ) => results.some((result) => result.status === 'rejected' && isAuthError(result.reason));

  useEffect(() => {
    let cancelled = false;

    const restoreStoredSession = async () => {
      const storedSession = await readStoredSession();

      if (cancelled) {
        return;
      }

      if (!storedSession) {
        setScreen('login');
        return;
      }

      setLoginProvider(storedSession.provider);

      if (storedSession.refreshToken) {
        try {
          const refreshed = await refreshAuthToken(storedSession.refreshToken);

          if (cancelled) {
            return;
          }

          const nextSession = {
            accessToken: refreshed.accessToken,
            refreshToken: refreshed.refreshToken ?? storedSession.refreshToken,
          };

          await applyStoredSession(storedSession.provider, nextSession);

          if (cancelled) {
            return;
          }

          setActiveTab('home');
          return;
        } catch {
          if (cancelled) {
            return;
          }

          await clearAuthSession();
          return;
        }
      }

      setSession({
        accessToken: storedSession.accessToken,
        refreshToken: null,
      });
      setActiveTab('home');
    };

    void restoreStoredSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!session?.refreshToken) {
      setAuthRefreshHandler(null);
      return;
    }

    setAuthRefreshHandler(async () => {
      try {
        const refreshed = await refreshAuthToken(session.refreshToken!);
        const nextSession = {
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken ?? session.refreshToken,
        };

        await applyStoredSession(loginProvider, nextSession);
        return nextSession;
      } catch {
        await clearAuthSession();
        return null;
      }
    });

    return () => {
      setAuthRefreshHandler(null);
    };
  }, [loginProvider, session?.refreshToken]);

  useEffect(() => {
    if (!session?.accessToken || !selectedUserProfileId) {
      return;
    }

    const userId = Number(selectedUserProfileId);

    if (!Number.isFinite(userId)) {
      return;
    }

    let cancelled = false;
    const baseProfile =
      remoteUserProfiles.find((item) => item.id === selectedUserProfileId) ??
      searchResultUserProfiles.find((item) => item.id === selectedUserProfileId) ??
      recommendedUserProfiles.find((item) => item.id === selectedUserProfileId) ??
      fallbackUserProfiles.find((item) => item.id === selectedUserProfileId) ??
      null;

    const hydrateUserProfile = async () => {
      const [
        userInfoResult,
        followCountResult,
        reliabilityResult,
        userReviewsResult,
        followStatusResult,
        representativeListResult,
        followingsResult,
        followersResult,
      ] =
        await Promise.allSettled([
          getUserInfo(session.accessToken, userId),
          getFollowCount(session.accessToken, userId),
          getReliabilityScore(session.accessToken, userId),
          getUserReviews(session.accessToken, userId),
          getFollowStatus(session.accessToken, userId),
          getUserRepresentativeList(session.accessToken, userId),
          getFollowings(session.accessToken, userId),
          getFollowers(session.accessToken, userId),
        ]);

      if (cancelled) {
        return;
      }

      if (
        hasRejectedAuthError([
          userInfoResult,
          followCountResult,
          reliabilityResult,
          userReviewsResult,
          followStatusResult,
          representativeListResult,
          followingsResult,
          followersResult,
        ])
      ) {
        await clearAuthSession();
        return;
      }

      const userInfo = userInfoResult.status === 'fulfilled' ? userInfoResult.value : null;
      const followCount = followCountResult.status === 'fulfilled' ? followCountResult.value : null;
      const reliability =
        reliabilityResult.status === 'fulfilled' ? reliabilityResult.value : null;
      const userReviews =
        userReviewsResult.status === 'fulfilled' ? userReviewsResult.value : null;
      const followStatus =
        followStatusResult.status === 'fulfilled' ? followStatusResult.value : null;
      const representativeList =
        representativeListResult.status === 'fulfilled'
          ? representativeListResult.value
          : null;
      const followings = followingsResult.status === 'fulfilled' ? followingsResult.value : null;
      const followers = followersResult.status === 'fulfilled' ? followersResult.value : null;

      const representativeAccentColor =
        baseProfile?.representativeAccentColor ??
        HOME_PROFILE_ACCENT_COLORS[userId % HOME_PROFILE_ACCENT_COLORS.length];

      const representativeRestaurants = representativeList
        ? representativeList.restaurants.slice(0, 5).map((restaurantItem) => ({
            address: restaurantItem.restaurant.address,
            id: String(restaurantItem.restaurant.id),
            imageUri: restaurantItem.restaurant.imageUrl,
            listItemId: String(restaurantItem.id),
            name: restaurantItem.restaurant.name,
            ratings:
              restaurantItem.tasteScore !== undefined &&
              restaurantItem.valueScore !== undefined &&
              restaurantItem.moodScore !== undefined
                ? {
                    taste: restaurantItem.tasteScore / 2,
                    service: restaurantItem.moodScore / 2,
                    value: restaurantItem.valueScore / 2,
                  }
                : undefined,
          }))
        : (baseProfile?.representativeRestaurants ?? []);

      const nextProfile: UserProfile = {
        id: selectedUserProfileId,
        nickname: userInfo?.nickname ?? baseProfile?.nickname ?? '',
        profileImageUrl: userInfo?.profileImageUrl ?? baseProfile?.profileImageUrl,
        reliabilityGrade:
          normalizeReliabilityGrade(reliability?.grade) ?? baseProfile?.reliabilityGrade,
        reliabilityScore: reliability?.score ?? baseProfile?.reliabilityScore,
        honorTitle: reliability?.honorTitle ?? baseProfile?.honorTitle,
        honorPeriod: reliability?.honorPeriod ?? baseProfile?.honorPeriod,
        followerCount:
          followCount?.followerCount !== undefined
            ? String(followCount.followerCount)
            : baseProfile?.followerCount,
        followingCount:
          followCount?.followingCount !== undefined
            ? String(followCount.followingCount)
            : baseProfile?.followingCount,
        reviewCount:
          userReviews !== null ? String(userReviews.length) : baseProfile?.reviewCount ?? '0',
        representativeListIsLiked:
          representativeList?.isLiked ?? baseProfile?.representativeListIsLiked ?? false,
        representativeListId: representativeList
          ? String(representativeList.id)
          : baseProfile?.representativeListId,
        representativeListTitle:
          representativeList?.title ?? baseProfile?.representativeListTitle ?? '대표 리스트',
        representativeAccentColor,
        representativeRestaurants,
      };

      if (userReviews !== null) {
        setRemoteUserReviewsByUserId((current) => ({
          ...current,
          [selectedUserProfileId]: userReviews.map(mapApiReviewToMyReview),
        }));
      }

      setRemoteUserProfiles((current) => {
        const existing = current.find((item) => item.id === selectedUserProfileId);

        if (
          existing &&
          existing.nickname === nextProfile.nickname &&
          existing.profileImageUrl === nextProfile.profileImageUrl &&
          existing.reliabilityGrade === nextProfile.reliabilityGrade &&
          existing.honorTitle === nextProfile.honorTitle &&
          existing.honorPeriod === nextProfile.honorPeriod &&
          existing.followerCount === nextProfile.followerCount &&
          existing.followingCount === nextProfile.followingCount &&
          existing.reviewCount === nextProfile.reviewCount &&
          existing.representativeListIsLiked === nextProfile.representativeListIsLiked &&
          existing.representativeListId === nextProfile.representativeListId &&
          existing.representativeListTitle === nextProfile.representativeListTitle &&
          existing.representativeRestaurants.length === nextProfile.representativeRestaurants.length
        ) {
          return current;
        }

        const filtered = current.filter((item) => item.id !== selectedUserProfileId);
        return [...filtered, nextProfile];
      });

      if (followStatus !== null) {
        setUserProfileFollowStateById((current) => ({
          ...current,
          [selectedUserProfileId]: followStatus,
        }));
      } else {
        setUserProfileFollowStateById((current) =>
          current[selectedUserProfileId] !== undefined
            ? current
            : {
                ...current,
                [selectedUserProfileId]: selectedUserProfileKnownFollowing,
              },
        );
      }

      if (followings !== null || followers !== null) {
        const myFollowingIdSet = new Set(
          myFollowingUsers
            .map((user) => Number(user.id))
            .filter((followedUserId) => Number.isFinite(followedUserId)),
        );

        const [hydratedFollowingsResult, hydratedFollowersResult] = await Promise.allSettled([
          followings !== null
            ? hydrateFriendUsersWithReliability(
                session.accessToken,
                followings,
                myFollowingIdSet,
              )
            : Promise.resolve<FriendUser[] | null>(null),
          followers !== null
            ? hydrateFriendUsersWithReliability(
                session.accessToken,
                followers,
                myFollowingIdSet,
              )
            : Promise.resolve<FriendUser[] | null>(null),
        ]);

        if (cancelled) {
          return;
        }

        setRemoteUserFriendConnectionsByUserId((current) => ({
          ...current,
          [selectedUserProfileId]: {
            following:
              hydratedFollowingsResult.status === 'fulfilled'
                ? hydratedFollowingsResult.value ?? current[selectedUserProfileId]?.following ?? []
                : current[selectedUserProfileId]?.following ?? [],
            followers:
              hydratedFollowersResult.status === 'fulfilled'
                ? hydratedFollowersResult.value ?? current[selectedUserProfileId]?.followers ?? []
                : current[selectedUserProfileId]?.followers ?? [],
          },
        }));
      }
    };

    void hydrateUserProfile().catch((error) => {
      console.log('[user profile] hydrate failed', {
        selectedUserProfileId,
        error,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [
    fallbackUserProfiles,
    myFollowingUsers,
    recommendedUserProfiles,
    remoteUserProfiles,
    searchResultUserProfiles,
    selectedUserProfileKnownFollowing,
    selectedUserProfileId,
    session?.accessToken,
  ]);

  useEffect(() => {
    if (!session?.accessToken || !selectedUserProfileId || screen !== 'user-friends') {
      return;
    }

    const parsedUserId = Number(selectedUserProfileId);

    if (Number.isNaN(parsedUserId)) {
      return;
    }

    let cancelled = false;

    const hydrateUserFriendConnections = async () => {
      const [followingsResult, followersResult] = await Promise.allSettled([
        getFollowings(session.accessToken!, parsedUserId),
        getFollowers(session.accessToken!, parsedUserId),
      ]);

      if (cancelled) {
        return;
      }

      if (hasRejectedAuthError([followingsResult, followersResult])) {
        await clearAuthSession();
        return;
      }

      const followings = followingsResult.status === 'fulfilled' ? followingsResult.value : null;
      const followers = followersResult.status === 'fulfilled' ? followersResult.value : null;

      if (followings === null && followers === null) {
        return;
      }

      const myFollowingIdSet = new Set(
        myFollowingUsers
          .map((user) => Number(user.id))
          .filter((followedUserId) => Number.isFinite(followedUserId)),
      );

      const [hydratedFollowings, hydratedFollowers] = await Promise.all([
        followings !== null
          ? hydrateFriendUsersWithReliability(
              session.accessToken!,
              followings,
              myFollowingIdSet,
            )
          : Promise.resolve<FriendUser[] | null>(null),
        followers !== null
          ? hydrateFriendUsersWithReliability(
              session.accessToken!,
              followers,
              myFollowingIdSet,
            )
          : Promise.resolve<FriendUser[] | null>(null),
      ]);

      if (cancelled) {
        return;
      }

      setRemoteUserFriendConnectionsByUserId((current) => ({
        ...current,
        [selectedUserProfileId]: {
          following:
            hydratedFollowings !== null
              ? hydratedFollowings
              : current[selectedUserProfileId]?.following ?? [],
          followers:
            hydratedFollowers !== null
              ? hydratedFollowers
              : current[selectedUserProfileId]?.followers ?? [],
        },
      }));
    };

    void hydrateUserFriendConnections();

    return () => {
      cancelled = true;
    };
  }, [myFollowingUsers, screen, selectedUserProfileId, session?.accessToken]);

  useEffect(() => {
    if (!session?.accessToken || !selectedUserProfileId || screen !== 'user-reviews') {
      return;
    }

    const parsedUserId = Number(selectedUserProfileId);

    if (Number.isNaN(parsedUserId)) {
      return;
    }

    let cancelled = false;

    const hydrateUserReviews = async () => {
      try {
        const reviews = await getUserReviews(session.accessToken!, parsedUserId);

        if (cancelled) {
          return;
        }

        setRemoteUserReviewsByUserId((current) => ({
          ...current,
          [selectedUserProfileId]: reviews.map(mapApiReviewToMyReview),
        }));
      } catch (error) {
        if (!cancelled && isAuthError(error)) {
          await clearAuthSession();
        }
      }
    };

    void hydrateUserReviews();

    return () => {
      cancelled = true;
    };
  }, [screen, selectedUserProfileId, session?.accessToken]);

  useEffect(() => {
    if (!session?.accessToken || !selectedMyListId || screen !== 'my-list-detail') {
      return;
    }

    const parsedListId = Number(selectedMyListId);

    if (Number.isNaN(parsedListId)) {
      return;
    }

    let cancelled = false;

    const hydrateListLikeCount = async () => {
      try {
        const likeCount = await getListLikeCount(session.accessToken!, parsedListId);

        if (cancelled) {
          return;
        }

        setMyListLikeCountById((current) => ({
          ...current,
          [selectedMyListId]: likeCount,
        }));
      } catch {
        if (cancelled) {
          return;
        }

        setMyListLikeCountById((current) =>
          current[selectedMyListId] === undefined
            ? {
                ...current,
                [selectedMyListId]: 0,
              }
            : current,
        );
      }
    };

    void hydrateListLikeCount();

    return () => {
      cancelled = true;
    };
  }, [screen, selectedMyListId, session?.accessToken]);

  useEffect(() => {
    if (!session?.accessToken || activeTab !== 'my' || screen !== 'tabs') {
      return;
    }

    const representativeListId =
      myLists.find((item) => item.isRepresentative)?.id ?? myLists[0]?.id;

    if (!representativeListId) {
      return;
    }

    const parsedListId = Number(representativeListId);

    if (Number.isNaN(parsedListId)) {
      return;
    }

    let cancelled = false;

    const hydrateRepresentativeListLikeCount = async () => {
      try {
        const likeCount = await getListLikeCount(session.accessToken!, parsedListId);

        if (cancelled) {
          return;
        }

        setMyListLikeCountById((current) => ({
          ...current,
          [representativeListId]: likeCount,
        }));
      } catch {
        if (cancelled) {
          return;
        }

        setMyListLikeCountById((current) => ({
          ...current,
          [representativeListId]: current[representativeListId] ?? 0,
        }));
      }
    };

    void hydrateRepresentativeListLikeCount();

    return () => {
      cancelled = true;
    };
  }, [activeTab, myListLikeCountById, myLists, screen, session?.accessToken]);

  useEffect(() => {
    if (!session?.accessToken || activeTab !== 'home' || screen !== 'tabs') {
      return;
    }

    let cancelled = false;

    const syncUnreadNotificationCount = async () => {
      try {
        const unreadCount = await getUnreadNotificationCount(session.accessToken);

        if (cancelled) {
          return;
        }

        setHasUnreadNews(unreadCount > 0);
      } catch {
        if (cancelled) {
          return;
        }

        setHasUnreadNews(false);
      }
    };

    void syncUnreadNotificationCount();
    const intervalId = setInterval(() => {
      void syncUnreadNotificationCount();
    }, 30000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [activeTab, screen, session?.accessToken]);

  useEffect(() => {
    if (!session?.accessToken || screen !== 'user-profile' || !selectedUserProfileId) {
      return;
    }

    const representativeListId = selectedRepresentativeListId;

    if (!representativeListId) {
      return;
    }

    const parsedListId = Number(representativeListId);

    if (Number.isNaN(parsedListId)) {
      return;
    }

    let cancelled = false;

    const hydrateSelectedProfileRepresentativeListLikeCount = async () => {
      try {
        const [likeCount, detail] = await Promise.all([
          getListLikeCount(session.accessToken!, parsedListId),
          getListDetail(session.accessToken!, parsedListId).catch(() => null),
        ]);

        if (cancelled) {
          return;
        }

        setMyListLikeCountById((current) => ({
          ...current,
          [representativeListId]: likeCount,
        }));

        if (typeof detail?.isLiked === 'boolean') {
          setMyListLikeStateById((current) => ({
            ...current,
            [representativeListId]: detail.isLiked ?? current[representativeListId] ?? false,
          }));

          const applyNextLikeState = (profile: UserProfile) =>
            profile.id === selectedUserProfileId
              ? {
                  ...profile,
                  representativeListIsLiked: detail.isLiked,
                }
              : profile;

          setRemoteUserProfiles((current) => current.map(applyNextLikeState));
          setSearchResultUserProfiles((current) => current.map(applyNextLikeState));
          setRecommendedUserProfiles((current) => current.map(applyNextLikeState));
        }
      } catch {
        if (cancelled) {
          return;
        }

        setMyListLikeCountById((current) => ({
          ...current,
          [representativeListId]: current[representativeListId] ?? 0,
        }));
      }
    };

    void hydrateSelectedProfileRepresentativeListLikeCount();

    return () => {
      cancelled = true;
    };
  }, [screen, selectedRepresentativeListId, selectedUserProfileId, session?.accessToken]);

  const handleToggleUserProfileFollow = async (userId: string, nextIsFollowing: boolean) => {
    if (!session?.accessToken) {
      return;
    }

    const parsedUserId = Number(userId);

    if (Number.isNaN(parsedUserId)) {
      Alert.alert('팔로우를 변경하지 못했습니다.');
      return;
    }

    setUserProfileFollowPendingIds((current) =>
      current.includes(userId) ? current : [...current, userId],
    );

    try {
      if (nextIsFollowing) {
        await followUser(session.accessToken, parsedUserId);
      } else {
        await unfollowUser(session.accessToken, parsedUserId);
      }

      setUserProfileFollowStateById((current) => ({
        ...current,
        [userId]: nextIsFollowing,
      }));
      setRemoteUserProfiles((current) =>
        current.map((profile) =>
          profile.id === userId
            ? {
                ...profile,
                followerCount: profile.followerCount
                  ? String(Math.max(0, Number(profile.followerCount) + (nextIsFollowing ? 1 : -1)))
                  : profile.followerCount,
              }
            : profile,
        ),
      );
      setMyFollowingUsers((current) => {
        if (nextIsFollowing) {
          if (current.some((user) => user.id === userId)) {
            return current;
          }

          const targetProfile =
            remoteUserProfiles.find((profile) => profile.id === userId) ??
            searchResultUserProfiles.find((profile) => profile.id === userId) ??
            recommendedUserProfiles.find((profile) => profile.id === userId) ??
            fallbackUserProfiles.find((profile) => profile.id === userId);

          if (!targetProfile) {
            return current;
          }

          return [
            ...current,
            {
              id: userId,
              isFollowing: true,
              name: targetProfile.nickname,
              reviewCount: Number(targetProfile.reviewCount ?? 0) || 0,
              showFollowAction: true,
            },
          ];
        }

        return current.filter((user) => user.id !== userId);
      });
      setMyFollowerUsers((current) =>
        sortFollowersForInitialView(
          current.map((user) =>
            user.id === userId ? { ...user, isFollowing: nextIsFollowing } : user,
          ),
        ),
      );
    } catch {
      Alert.alert('팔로우를 변경하지 못했습니다.');
    } finally {
      setUserProfileFollowPendingIds((current) => current.filter((id) => id !== userId));
    }
  };

  const handleCreateReport = async (
    targetType: 'REVIEW' | 'USER',
    targetId: number,
    reason: string,
  ) => {
    if (!session?.accessToken) {
      Alert.alert('안내', '로그인 후 이용해 주세요.');
      return;
    }

    try {
      await createReport(session.accessToken, {
        targetType,
        targetId,
        reason,
      });
      Alert.alert('안내', '신고가 접수되었습니다.');
    } catch (error) {
      const message =
        error instanceof ApiError
          ? `[${error.status}] ${error.message || '신고를 접수하지 못했습니다.'}`
          : '신고를 접수하지 못했습니다.';
      Alert.alert('안내', message);
    }
  };

  const handleReportReview = (reviewId: string, reason: string) => {
    const parsedReviewId = Number(reviewId);

    if (Number.isNaN(parsedReviewId)) {
      Alert.alert('안내', '신고 대상을 확인하지 못했습니다.');
      return;
    }

    void handleCreateReport('REVIEW', parsedReviewId, reason);
  };

  const handleReportUser = (userId: string, reason: string) => {
    const parsedUserId = Number(userId);

    if (Number.isNaN(parsedUserId)) {
      Alert.alert('안내', '신고 대상을 확인하지 못했습니다.');
      return;
    }

    void handleCreateReport('USER', parsedUserId, reason);
  };

  const syncFollowStateAcrossScreens = (userId: string, nextIsFollowing: boolean) => {
    setUserProfileFollowStateById((current) => ({
      ...current,
      [userId]: nextIsFollowing,
    }));
    setMyFollowingUsers((current) => {
      if (nextIsFollowing) {
        if (current.some((user) => user.id === userId)) {
          return current;
        }

        const targetProfile =
          remoteUserProfiles.find((profile) => profile.id === userId) ??
          searchResultUserProfiles.find((profile) => profile.id === userId) ??
          recommendedUserProfiles.find((profile) => profile.id === userId) ??
          fallbackUserProfiles.find((profile) => profile.id === userId);

        if (!targetProfile) {
          return current;
        }

        return [
          ...current,
          {
            id: userId,
            isFollowing: true,
            name: targetProfile.nickname,
            reviewCount: Number(targetProfile.reviewCount ?? 0) || 0,
            showFollowAction: true,
          },
        ];
      }

      return current.filter((user) => user.id !== userId);
    });
    setMyFollowerUsers((current) =>
      sortFollowersForInitialView(
        current.map((user) =>
          user.id === userId ? { ...user, isFollowing: nextIsFollowing } : user,
        ),
        ),
      );
  };

  const syncFollowStateAcrossUserConnections = (userId: string, nextIsFollowing: boolean) => {
    setUserProfileFollowStateById((current) => ({
      ...current,
      [userId]: nextIsFollowing,
    }));
    setRemoteUserFriendConnectionsByUserId((current) => {
      const nextEntries = Object.entries(current).map(([profileId, connections]) => [
        profileId,
        {
          followers: connections.followers.map((user) =>
            user.id === userId ? { ...user, isFollowing: nextIsFollowing } : user,
          ),
          following: connections.following.map((user) =>
            user.id === userId ? { ...user, isFollowing: nextIsFollowing } : user,
          ),
        },
      ]);

      return Object.fromEntries(nextEntries);
      });
  };

  const hydrateHomeRecommendations = async (
    token: string,
    options?: {
      cancelled?: () => boolean;
      retryOnEmpty?: boolean;
    },
  ) => {
    const applyRecommendations = async () => {
      const [restaurantRecommendationsResult, recommendationsResult] =
        await Promise.allSettled([
          getRestaurantRecommendations(token),
          getListRecommendations(token),
        ]);

      if (hasRejectedAuthError([restaurantRecommendationsResult, recommendationsResult])) {
        const authError =
          restaurantRecommendationsResult.status === 'rejected'
            ? restaurantRecommendationsResult.reason
            : recommendationsResult.status === 'rejected'
              ? recommendationsResult.reason
              : new Error('Authentication required.');

        throw authError;
      }

      if (restaurantRecommendationsResult.status === 'fulfilled') {
        console.log('[home recommendations][restaurants] success', {
          count: restaurantRecommendationsResult.value.items.length,
          ids: restaurantRecommendationsResult.value.items.map((item) => item.restaurantId),
        });
      } else {
        console.log(
          '[home recommendations][restaurants] failed',
          restaurantRecommendationsResult.reason,
        );
      }

      if (recommendationsResult.status === 'fulfilled') {
        console.log('[home recommendations][lists] success', {
          count: recommendationsResult.value.items.length,
          listIds: recommendationsResult.value.items.map((item) => item.listId),
          ownerIds: recommendationsResult.value.items.map((item) => item.owner.ownerId),
        });
      } else {
        console.log('[home recommendations][lists] failed', recommendationsResult.reason);
      }

      return { recommendationsResult, restaurantRecommendationsResult };
    };

    let { restaurantRecommendationsResult, recommendationsResult } = await applyRecommendations();

    if (
      options?.retryOnEmpty &&
      restaurantRecommendationsResult.status === 'fulfilled' &&
      recommendationsResult.status === 'fulfilled' &&
      restaurantRecommendationsResult.value.items.length === 0 &&
      recommendationsResult.value.items.length === 0
    ) {
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (options.cancelled?.()) {
        return;
      }

      ({ restaurantRecommendationsResult, recommendationsResult } = await applyRecommendations());
    }

    if (options?.cancelled?.()) {
      return;
    }

    if (restaurantRecommendationsResult.status === 'fulfilled') {
      setRecommendedRestaurantItems(
        restaurantRecommendationsResult.value.items.map((item) => ({
          id: `recommended-restaurant-${item.restaurantId}`,
          imageUri: item.imageUrl,
          name: item.restaurantName,
          restaurantId: item.restaurantId,
          restaurantName: item.restaurantName,
        })),
      );
    } else {
      setRecommendedRestaurantItems([]);
    }

    if (recommendationsResult.status === 'fulfilled') {
      const uniqueRecommendations = recommendationsResult.value.items.reduce<
        typeof recommendationsResult.value.items
      >((accumulator, item) => {
        if (accumulator.some((currentItem) => currentItem.owner.ownerId === item.owner.ownerId)) {
          return accumulator;
        }

        accumulator.push(item);
        return accumulator;
      }, []);

      const recommendedProfiles = await Promise.all(
        uniqueRecommendations.map(async (item, index) => {
          const [detailResult, followCountForOwnerResult, reliabilityResult] = await Promise.allSettled([
            getUserRepresentativeList(token, item.owner.ownerId),
            getFollowCount(token, item.owner.ownerId),
            getReliabilityScore(token, item.owner.ownerId),
          ]);

          if (detailResult.status !== 'fulfilled') {
            console.log('[home recommendations][lists] detail failed', {
              listId: item.listId,
              ownerId: item.owner.ownerId,
              reason: detailResult.reason,
            });
          }

          if (followCountForOwnerResult.status !== 'fulfilled') {
            console.log('[home recommendations][lists] follow count failed', {
              ownerId: item.owner.ownerId,
              reason: followCountForOwnerResult.reason,
            });
          }

          const representativeRestaurants =
            detailResult.status === 'fulfilled'
              ? detailResult.value.restaurants.slice(0, 5).map((restaurantItem) => ({
                  address: restaurantItem.restaurant.address,
                  id: String(restaurantItem.restaurant.id),
                  imageUri: restaurantItem.restaurant.imageUrl,
                  name: restaurantItem.restaurant.name,
                }))
              : [];

          return {
            card: {
              id: String(item.owner.ownerId),
              imageUri: item.owner.profileImageUrl,
              name: item.owner.nickname,
              reliabilityGrade:
                reliabilityResult.status === 'fulfilled'
                  ? normalizeReliabilityGrade(reliabilityResult.value.grade) ?? undefined
                  : undefined,
            },
            profile: {
              followerCount:
                followCountForOwnerResult.status === 'fulfilled'
                  ? String(followCountForOwnerResult.value.followerCount)
                  : undefined,
              id: String(item.owner.ownerId),
              nickname: item.owner.nickname,
              profileImageUrl: item.owner.profileImageUrl,
              reliabilityGrade:
                reliabilityResult.status === 'fulfilled'
                  ? normalizeReliabilityGrade(reliabilityResult.value.grade) ?? undefined
                  : undefined,
              representativeAccentColor:
                HOME_PROFILE_ACCENT_COLORS[index % HOME_PROFILE_ACCENT_COLORS.length],
              representativeListIsLiked: item.isLiked ?? false,
              representativeListId: String(item.listId),
              representativeListTitle: item.title,
              representativeRestaurants,
            },
          };
        }),
      );

      if (options?.cancelled?.()) {
        return;
      }

      const limitedRecommendedProfiles = recommendedProfiles.slice(0, 5);

      console.log('[home recommendations][lists] hydrated', {
        count: limitedRecommendedProfiles.length,
        withRepresentativeRestaurants: recommendedProfiles.filter(
          (item) => item.profile.representativeRestaurants.length > 0,
        ).length,
      });
      setRecommendedMealFriendItems(limitedRecommendedProfiles.map((item) => item.card));
      setRecommendedUserProfiles(limitedRecommendedProfiles.map((item) => item.profile));
    } else {
      setRecommendedMealFriendItems([]);
      setRecommendedUserProfiles([]);
    }
  };

  const refreshMyReviews = async (token: string, userId: number) => {
    const reviews = await getUserReviews(token, userId);
    setMyReviewItems(reviews.map(mapApiReviewToMyReview));
  };

  const applyStoredReviewReaction = (
    items: MyReview[],
    reviewId: string,
    nextReaction: 'dislike' | 'like' | null,
  ) =>
    items.map((review) => {
      if (review.id !== reviewId) {
        return review;
      }

      const previousReaction = review.myReaction ?? null;
      let likes = review.likes;
      let dislikes = review.dislikes;

      if (previousReaction === 'like') {
        likes = Math.max(0, likes - 1);
      } else if (previousReaction === 'dislike') {
        dislikes = Math.max(0, dislikes - 1);
      }

      if (nextReaction === 'like') {
        likes += 1;
      } else if (nextReaction === 'dislike') {
        dislikes += 1;
      }

      return {
        ...review,
        dislikes,
        likes,
        myReaction: nextReaction,
      };
    });

  const handleToggleUserReviewReaction = async (
    reviewId: string,
    nextReaction: 'dislike' | 'like' | null,
  ) => {
    if (!session?.accessToken) {
      return false;
    }

    const parsedReviewId = Number(reviewId);

    if (Number.isNaN(parsedReviewId)) {
      Alert.alert('안내', '리뷰 반응을 변경하지 못했습니다.');
      return false;
    }

    setReviewReactionPendingIds((current) =>
      current.includes(reviewId) ? current : [...current, reviewId],
    );

    try {
      if (nextReaction === null) {
        await cancelReviewVote(session.accessToken, parsedReviewId);
      } else {
        await voteReview(session.accessToken, parsedReviewId, {
          voteType: nextReaction === 'like' ? 'LIKE' : 'DISLIKE',
        });
      }

      setMyReviewItems((current) => applyStoredReviewReaction(current, reviewId, nextReaction));
      setRemoteUserReviewsByUserId((current) =>
        Object.fromEntries(
          Object.entries(current).map(([userId, reviews]) => [
            userId,
            applyStoredReviewReaction(reviews, reviewId, nextReaction),
          ]),
        ),
      );

      return true;
    } catch {
      Alert.alert('안내', '리뷰 반응을 변경하지 못했습니다.');
      return false;
    } finally {
      setReviewReactionPendingIds((current) => current.filter((id) => id !== reviewId));
    }
  };

  const handleDeleteMyReview = async (reviewId: string) => {
    if (!session?.accessToken) {
      return false;
    }

    const parsedReviewId = Number(reviewId);

    if (Number.isNaN(parsedReviewId)) {
      Alert.alert('안내', '리뷰를 삭제하지 못했습니다.');
      return false;
    }

    const syncMyReviewsFromServer = async () => {
      if (myUserId === null) {
        setMyReviewItems((current) => current.filter((review) => review.id !== reviewId));
        return false;
      }

      const reviews = await getUserReviews(session.accessToken, myUserId);
      const mappedReviews = reviews.map(mapApiReviewToMyReview);
      const stillExists = mappedReviews.some((review) => review.id === reviewId);

      setMyReviewItems(mappedReviews);
      setRemoteUserReviewsByUserId((current) => ({
        ...current,
        [String(myUserId)]: mappedReviews,
      }));

      return stillExists;
    };

    try {
      await deleteReview(session.accessToken, parsedReviewId);
      const stillExists = await syncMyReviewsFromServer();

      if (stillExists) {
        Alert.alert('안내', '리뷰를 삭제하지 못했습니다.');
        return false;
      }

      return true;
    } catch {
      try {
        const stillExists = await syncMyReviewsFromServer();

        if (!stillExists) {
          return true;
        }
      } catch {
        // Ignore sync fallback failures and surface the original delete failure below.
      }

      Alert.alert('안내', '리뷰를 삭제하지 못했습니다.');
      return false;
    }
  };

  useEffect(() => {
    if (!session?.accessToken) {
      setRecommendedRestaurantItems([]);
      setRecommendedMealFriendItems([]);
      setRecommendedUserProfiles([]);
      setHasUnreadNews(false);
      return;
    }

    let cancelled = false;

    const hydrateSession = async () => {
      try {
        const me = await retryAsync(() => getMyInfo(session.accessToken));

        if (cancelled) {
          return;
        }

        const derivedNeedsProfile = !me.birthYear || !me.birthMonth || !me.birthDay || !me.gender;

        setNickname(me.nickname);
        setProfileImageUrl(me.profileImageUrl ?? null);
        setBirthDateLabel(formatBirthDate(me));
        setGenderLabel(formatGenderLabel(me.gender));
        setMyUserId(me.id);
        setRequiresProfileSetup(derivedNeedsProfile);

        const fetchPreferredLocalRanking = async () => {
          const regionCandidates = ['용인시 처인구', '용인', '용인시', '처인구', '기흥구', '수지구'];

          for (const regionName of regionCandidates) {
            const result = await getRestaurantRankings(session.accessToken, {
              regionName,
              limit: 40,
            });

            if (result.items.length > 0) {
              return { items: result.items, regionName };
            }
          }

          const fallbackRegionName = '용인시 처인구';
          const fallbackResult = await getRestaurantRankings(session.accessToken, {
            regionName: fallbackRegionName,
            limit: 40,
          });

          return { items: fallbackResult.items, regionName: fallbackRegionName };
        };

          const [
            followCountResult,
            listsResult,
            localRankingResult,
            nationalRankingResult,
            followingsResult,
            followersResult,
            reliabilityResult,
            myReviewsResult,
            unreadNotificationCountResult,
          ] =
            await Promise.allSettled([
              getFollowCount(session.accessToken, me.id),
              getMyLists(session.accessToken),
              fetchPreferredLocalRanking(),
              getRestaurantRankings(session.accessToken, { limit: 40 }),
              getFollowings(session.accessToken, me.id),
              getFollowers(session.accessToken, me.id),
              getReliabilityScore(session.accessToken, me.id),
              getUserReviews(session.accessToken, me.id),
              getUnreadNotificationCount(session.accessToken),
            ]);

        if (
          hasRejectedAuthError([
            followCountResult,
            listsResult,
            localRankingResult,
            nationalRankingResult,
            followingsResult,
            followersResult,
            reliabilityResult,
            myReviewsResult,
            unreadNotificationCountResult,
          ])
        ) {
          await clearAuthSession();
          return;
        }

        if (cancelled) {
          return;
        }

        if (followCountResult.status === 'fulfilled') {
          setFollowerCount(followCountResult.value.followerCount);
        }

        if (reliabilityResult.status === 'fulfilled') {
          setMyReliabilityGrade(normalizeReliabilityGrade(reliabilityResult.value.grade));
          setMyReliabilityScore(reliabilityResult.value.score ?? null);
          setMyHonorTitle(reliabilityResult.value.honorTitle ?? null);
          setMyHonorPeriod(reliabilityResult.value.honorPeriod ?? null);
        }

        if (myReviewsResult.status === 'fulfilled') {
          setMyReviewItems(myReviewsResult.value.map(mapApiReviewToMyReview));
        }

        if (unreadNotificationCountResult.status === 'fulfilled') {
          setHasUnreadNews(unreadNotificationCountResult.value > 0);
        }

        const followingUserIds = new Set(
          followingsResult.status === 'fulfilled'
            ? followingsResult.value.map((user) => user.userId)
            : myFollowingUsers
                .map((user) => Number(user.id))
                .filter((userId) => Number.isFinite(userId)),
        );

        const [nextFollowingUsers, nextFollowerUsers] = await Promise.all([
          followingsResult.status === 'fulfilled'
            ? hydrateFriendUsersWithReliability(
                session.accessToken,
                followingsResult.value,
                followingUserIds,
              )
            : Promise.resolve<FriendUser[] | null>(null),
          followersResult.status === 'fulfilled'
            ? hydrateFriendUsersWithReliability(
                session.accessToken,
                followersResult.value,
                followingUserIds,
              )
            : Promise.resolve<FriendUser[] | null>(null),
        ]);

        if (cancelled) {
          return;
        }

        if (nextFollowingUsers !== null) {
          setMyFollowingUsers(nextFollowingUsers);
        }

        if (nextFollowerUsers !== null) {
          setMyFollowerUsers(
            sortFollowersForInitialView(
              nextFollowerUsers,
            ),
          );
        }

        if (localRankingResult.status === 'fulfilled' && nationalRankingResult.status === 'fulfilled') {
          setRankingEntries({
            local: mapRankingItems(localRankingResult.value.items),
            national: mapRankingItems(nationalRankingResult.value.items),
          });
          setLocalRankingRegion(localRankingResult.value.regionName);
        }

        if (listsResult.status === 'fulfilled') {
          const listHydrationResults = await Promise.all(
            listsResult.value.map(async (summary, index) => {
              try {
                const detail = await getListDetail(session.accessToken, summary.id);
                return {
                  isLiked: detail.isLiked ?? summary.isLiked ?? false,
                  list: mapListDetailToMyList(detail, index),
                };
              } catch {
                return {
                  isLiked: summary.isLiked ?? false,
                  list: mapListSummaryToMyList(summary, index),
                };
              }
            }),
          );

          if (!cancelled) {
            setMyLists(listHydrationResults.map((item) => item.list));
            setMyListLikeStateById(
              Object.fromEntries(
                listHydrationResults.map((item) => [item.list.id, item.isLiked]),
              ),
            );
          }
        }

        await hydrateHomeRecommendations(session.accessToken, {
          cancelled: () => cancelled,
        });

        if (cancelled) {
          return;
        }

        if (listsResult.status === 'fulfilled' && listsResult.value.length === 0) {
          setTasteFlowSource('onboarding');
          setScreen((current) => (current === 'auth-loading' ? 'signup-nickname' : current));
          return;
        }

        if (derivedNeedsProfile) {
          setScreen((current) => (current === 'auth-loading' ? 'signup-profile' : current));
          return;
        }

        setScreen((current) => (current === 'auth-loading' ? 'tabs' : current));
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (isAuthError(error)) {
          await clearAuthSession();
          return;
        }

        if (!MOCK_DATA_ENABLED) {
          setFollowerCount(0);
          setMyUserId(null);
          setMyFollowingUsers([]);
          setMyFollowerUsers([]);
          setRecommendedRestaurantItems([]);
          setRecommendedMealFriendItems([]);
          setRecommendedUserProfiles([]);
          setHasUnreadNews(false);
          setRankingEntries({
            local: [],
            national: [],
          });
          setLocalRankingRegion(fallbackLocalRankingRegion);
          setMyLists([]);
        }

        setScreen((current) => (current === 'auth-loading' ? 'tabs' : current));
      }
    };

    void hydrateSession();

    return () => {
      cancelled = true;
    };
  }, [session]);

  const appendNewList = (title: string, selected: Restaurant[]) => {
    const accentPalette = ['#F46A67', '#56CDB5', '#8361C8', '#F6B033', '#5D8DF4', '#E96DC0'];
    const nextList: MyList = {
      id: `my-list-${Date.now()}`,
      title,
      isRepresentative: false,
      isPrivate: false,
      restaurantCount: selected.length,
      accentColor: accentPalette[myLists.length % accentPalette.length],
      restaurants: selected.map((restaurant) => ({
        id: restaurant.id,
        name: restaurant.shortName || restaurant.name,
        address: restaurant.address ?? '',
      })),
    };

    setMyLists((current) => [...current, nextList]);
  };

  const refreshMyLists = async (accessToken: string) => {
    const summaries = await getMyLists(accessToken);
    const listHydrationResults = await Promise.all(
      summaries.map(async (summary, index) => {
        try {
          const detail = await getListDetail(accessToken, summary.id);
          return {
            isLiked: detail.isLiked ?? summary.isLiked ?? false,
            list: mapListDetailToMyList(detail, index),
          };
        } catch {
          return {
            isLiked: summary.isLiked ?? false,
            list: mapListSummaryToMyList(summary, index),
          };
        }
      }),
    );

    setMyLists(listHydrationResults.map((item) => item.list));
    setMyListLikeStateById(
      Object.fromEntries(listHydrationResults.map((item) => [item.list.id, item.isLiked])),
    );
    return listHydrationResults.map((item) => item.list);
  };

  const buildNextListsAfterDelete = (lists: MyList[], targetId: string) => {
    const nextLists = lists.filter((list) => list.id !== targetId);

    if (!nextLists.some((list) => list.isRepresentative) && nextLists.length > 0) {
      return nextLists.map((list, index) => ({
        ...list,
        isRepresentative: index === 0,
        isPrivate: index === 0 ? false : list.isPrivate,
      }));
    }

    return nextLists;
  };

  const handleRenameMyList = async (listId: string, title: string) => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    const applyLocalRename = () => {
      setMyLists((current) =>
        current.map((list) =>
          list.id === listId
            ? {
                ...list,
                title: trimmedTitle,
              }
            : list,
        ),
      );
    };

    if (!session?.accessToken) {
      applyLocalRename();
      return;
    }

    const parsedListId = Number(listId);

    if (Number.isNaN(parsedListId)) {
      applyLocalRename();
      return;
    }

    await updateList(session.accessToken, parsedListId, {
      title: trimmedTitle,
    });
    applyLocalRename();
  };

  const handleToggleMyListPrivacy = async (listId: string) => {
    const applyLocalToggle = () => {
      setMyLists((current) =>
        current.map((list) =>
          list.id === listId
            ? {
                ...list,
                isPrivate: !list.isPrivate,
              }
            : list,
        ),
      );
    };

    if (!session?.accessToken) {
      applyLocalToggle();
      return;
    }

    const parsedListId = Number(listId);

    if (Number.isNaN(parsedListId)) {
      applyLocalToggle();
      return;
    }

    await toggleListVisibility(session.accessToken, parsedListId);
    applyLocalToggle();
  };

  const handleSetRepresentativeMyList = async (listId: string) => {
    const applyLocalRepresentative = () => {
      setMyLists((current) =>
        current.map((list) => ({
          ...list,
          isRepresentative: list.id === listId,
          isPrivate: list.id === listId ? false : list.isPrivate,
        })),
      );
    };

    if (!session?.accessToken) {
      applyLocalRepresentative();
      return;
    }

    const parsedListId = Number(listId);

    if (Number.isNaN(parsedListId)) {
      applyLocalRepresentative();
      return;
    }

    await setRepresentativeList(session.accessToken, parsedListId);
    applyLocalRepresentative();
  };

  const handleDeleteMyList = async (listId: string) => {
    const applyLocalDelete = () => {
      setMyLists((current) => buildNextListsAfterDelete(current, listId));
    };

    if (!session?.accessToken) {
      applyLocalDelete();
      return;
    }

    const parsedListId = Number(listId);

    if (Number.isNaN(parsedListId)) {
      applyLocalDelete();
      return;
    }

    await deleteList(session.accessToken, parsedListId);
    applyLocalDelete();
  };

  const handleToggleMyFriendFollow = async ({
    nextIsFollowing,
    sourceTab,
    userId,
  }: FollowTogglePayload) => {
    if (!session?.accessToken) {
      return false;
    }

    const parsedUserId = Number(userId);

    if (Number.isNaN(parsedUserId)) {
      Alert.alert('안내', '팔로우를 변경하지 못했습니다.');
      return false;
    }

    try {
      if (nextIsFollowing) {
        await followUser(session.accessToken, parsedUserId);
      } else {
        await unfollowUser(session.accessToken, parsedUserId);
      }
    } catch (error) {
      try {
        const followStatus = await getFollowStatus(session.accessToken, parsedUserId);
        const currentIsFollowing = Boolean(followStatus);

        if (currentIsFollowing === nextIsFollowing) {
          syncFollowStateAcrossUserConnections(userId, nextIsFollowing);

          if (sourceTab === 'following') {
            const nextFollowUser = buildFriendUserFromSources(
              userId,
              [
                myFollowerUsers,
                myFollowingUsers,
                ...Object.values(remoteUserFriendConnectionsByUserId).map((connection) => [
                  ...connection.followers,
                  ...connection.following,
                ]),
              ],
              mergeUserProfiles(
                mergeUserProfiles(
                  remoteUserProfiles,
                  mergeUserProfiles(searchResultUserProfiles, recommendedUserProfiles),
                ),
                fallbackUserProfiles,
              ),
            );

            setMyFollowingUsers((current) => {
              if (nextIsFollowing) {
                if (!nextFollowUser || current.some((user) => user.id === userId)) {
                  return current;
                }

                return [...current, { ...nextFollowUser, isFollowing: true }];
              }

              return current.filter((user) => user.id !== userId);
            });
            setMyFollowerUsers((current) =>
              sortFollowersForInitialView(
                current.map((user) =>
                  user.id === userId ? { ...user, isFollowing: nextIsFollowing } : user,
                ),
              ),
            );
            return true;
          }

          let targetFollower: FriendUser | null = null;

          setMyFollowerUsers((current) =>
            sortFollowersForInitialView(
              current.map((user) => {
                if (user.id !== userId) {
                  return user;
                }

                targetFollower = { ...user, isFollowing: nextIsFollowing };
                return targetFollower;
              }),
            ),
          );

          setMyFollowingUsers((current) => {
            if (nextIsFollowing) {
              if (!targetFollower || current.some((user) => user.id === userId)) {
                return current;
              }

              return [...current, targetFollower];
            }

            return current.filter((user) => user.id !== userId);
          });

          return true;
        }
      } catch {
        // Ignore follow status reconciliation errors and fall through to message handling.
      }

      if (error instanceof ApiError) {
        const normalizedMessage = error.message.replace(/\s/g, '');
        const isAlreadyFollowingError =
          nextIsFollowing &&
          (normalizedMessage.includes('이미팔로우') || normalizedMessage.includes('이미팔로잉'));
        const isAlreadyUnfollowedError =
          !nextIsFollowing &&
          (error.status === 404 ||
            normalizedMessage.includes('이미언팔로우') ||
            normalizedMessage.includes('팔로우상태가아닙') ||
            normalizedMessage.includes('팔로우하지않'));

        if (!(isAlreadyFollowingError || isAlreadyUnfollowedError)) {
          Alert.alert('안내', error.message || '팔로우를 변경하지 못했습니다.');
          return false;
        }
      } else {
        Alert.alert('안내', '팔로우를 변경하지 못했습니다.');
        return false;
      }
    }

    syncFollowStateAcrossUserConnections(userId, nextIsFollowing);

    if (sourceTab === 'following') {
      const nextFollowUser = buildFriendUserFromSources(
        userId,
        [
          myFollowerUsers,
          myFollowingUsers,
          ...Object.values(remoteUserFriendConnectionsByUserId).map((connection) => [
            ...connection.followers,
            ...connection.following,
          ]),
        ],
        mergeUserProfiles(
          mergeUserProfiles(
            remoteUserProfiles,
            mergeUserProfiles(searchResultUserProfiles, recommendedUserProfiles),
          ),
          fallbackUserProfiles,
        ),
      );

      setMyFollowingUsers((current) => {
        if (nextIsFollowing) {
          if (!nextFollowUser || current.some((user) => user.id === userId)) {
            return current;
          }

          return [...current, { ...nextFollowUser, isFollowing: true }];
        }

        return current.filter((user) => user.id !== userId);
      });
      setMyFollowerUsers((current) =>
        sortFollowersForInitialView(
          current.map((user) =>
            user.id === userId ? { ...user, isFollowing: nextIsFollowing } : user,
          ),
        ),
      );
      return true;
    }

    const nextFollowUser = buildFriendUserFromSources(
      userId,
      [
        myFollowerUsers,
        myFollowingUsers,
        ...Object.values(remoteUserFriendConnectionsByUserId).map((connection) => [
          ...connection.followers,
          ...connection.following,
        ]),
      ],
      mergeUserProfiles(
        mergeUserProfiles(
          remoteUserProfiles,
          mergeUserProfiles(searchResultUserProfiles, recommendedUserProfiles),
        ),
        fallbackUserProfiles,
      ),
    );

    setMyFollowerUsers((current) =>
      sortFollowersForInitialView(
        current.map((user) => {
          if (user.id !== userId) {
            return user;
          }

          return { ...user, isFollowing: nextIsFollowing };
        }),
      ),
    );

    setMyFollowingUsers((current) => {
      if (nextIsFollowing) {
        if (!nextFollowUser || current.some((user) => user.id === userId)) {
          return current;
        }

        return [...current, { ...nextFollowUser, isFollowing: true }];
      }

      return current.filter((user) => user.id !== userId);
    });

    return true;
  };

  const handleRemoveRestaurantsFromMyList = async (
    listId: string,
    restaurantIds: string[],
  ) => {
    if (restaurantIds.length === 0) {
      return;
    }

    const applyLocalRemove = () => {
      setMyLists((current) =>
        current.map((list) =>
          list.id === listId
            ? {
                ...list,
                restaurants: list.restaurants.filter(
                  (restaurant) => !restaurantIds.includes(restaurant.id),
                ),
                restaurantCount: list.restaurants.filter(
                  (restaurant) => !restaurantIds.includes(restaurant.id),
                ).length,
              }
            : list,
        ),
      );
    };

    if (!session?.accessToken) {
      applyLocalRemove();
      return;
    }

    const parsedListId = Number(listId);

    if (Number.isNaN(parsedListId)) {
      applyLocalRemove();
      return;
    }

    const currentList = myLists.find((list) => list.id === listId);

    try {
      const resolvedRestaurantIds = await Promise.all(
        restaurantIds.map(async (restaurantId) => {
          const parsedRestaurantId = Number(restaurantId);

          if (!Number.isNaN(parsedRestaurantId)) {
            return parsedRestaurantId;
          }

          const targetRestaurant = currentList?.restaurants.find(
            (restaurant) => restaurant.id === restaurantId,
          );

          if (!targetRestaurant) {
            throw new Error('restaurant_not_found');
          }

          const candidates = await searchRestaurants(session.accessToken!, targetRestaurant.name);
          const matchedRestaurant =
            candidates.find((item) => item.name === targetRestaurant.name) ?? candidates[0];

          if (!matchedRestaurant) {
            throw new Error('restaurant_not_found');
          }

          return matchedRestaurant.id;
        }),
      );

      await Promise.all(
        resolvedRestaurantIds.map((restaurantId) =>
          removeRestaurantFromList(session.accessToken!, parsedListId, restaurantId),
        ),
      );
      applyLocalRemove();
    } catch {
      Alert.alert('?덈궡', '媛寃뚮? ??젣?섏? 紐삵뻽?듬땲??');
    }
  };

  const handleUpdateRestaurantRatingsInMyList = async (
    listId: string,
    restaurantId: string,
    ratings: {
      taste: number;
      service: number;
      value: number;
    },
  ) => {
    const applyLocalUpdate = () => {
      setMyLists((current) =>
        current.map((list) =>
          list.id === listId
            ? {
                ...list,
                restaurants: list.restaurants.map((restaurant) =>
                  restaurant.id === restaurantId
                    ? {
                        ...restaurant,
                        ratings,
                      }
                    : restaurant,
                ),
              }
            : list,
        ),
      );
    };

    if (!session?.accessToken) {
      applyLocalUpdate();
      return;
    }

    const parsedListId = Number(listId);

    if (Number.isNaN(parsedListId)) {
      applyLocalUpdate();
      return;
    }

    const currentList = myLists.find((list) => list.id === listId);
    const targetRestaurant = currentList?.restaurants.find(
      (restaurant) => restaurant.id === restaurantId,
    );

    if (!targetRestaurant) {
      return;
    }

    try {
      const candidateRestaurantIds: number[] = [];
      const parsedRestaurantId = Number(restaurantId);

      if (!Number.isNaN(parsedRestaurantId)) {
        candidateRestaurantIds.push(parsedRestaurantId);
      }

      const parsedListItemId = Number(targetRestaurant.listItemId);

      if (!Number.isNaN(parsedListItemId) && !candidateRestaurantIds.includes(parsedListItemId)) {
        candidateRestaurantIds.push(parsedListItemId);
      }

      if (candidateRestaurantIds.length === 0) {
        const candidates = await searchRestaurants(session.accessToken, targetRestaurant.name);
        const matchedRestaurant =
          candidates.find((item) => item.name === targetRestaurant.name) ?? candidates[0];

        if (!matchedRestaurant) {
          throw new Error('restaurant_not_found');
        }

        candidateRestaurantIds.push(matchedRestaurant.id);
      }

      let updated = false;
      let lastError: unknown = null;

      for (const candidateRestaurantId of candidateRestaurantIds) {
        try {
          await updateRestaurantInList(session.accessToken, parsedListId, candidateRestaurantId, {
            tasteScore: convertFiveStarToTenPoint(ratings.taste),
            moodScore: convertFiveStarToTenPoint(ratings.service),
            valueScore: convertFiveStarToTenPoint(ratings.value),
          });
          updated = true;
          break;
        } catch (error) {
          lastError = error;
        }
      }

      if (!updated) {
        throw lastError ?? new Error('update_failed');
      }

      applyLocalUpdate();
    } catch {
      Alert.alert('?덈궡', '媛寃??먯닔瑜??섏젙?섏? 紐삵뻽?듬땲??');
    }
  };

  const handleToggleMyListLike = async (listId: string) => {
    if (!session?.accessToken) {
      return;
    }

    const parsedListId = Number(listId);

    if (Number.isNaN(parsedListId)) {
      return;
    }

    const hasStoredLikeState = Object.prototype.hasOwnProperty.call(myListLikeStateById, listId);
    const profileBackedLikeState =
      selectedVisibleUserProfile?.representativeListId === listId
        ? selectedVisibleUserProfile.representativeListIsLiked ?? false
        : false;
    const isCurrentlyLiked = hasStoredLikeState
      ? myListLikeStateById[listId]
      : profileBackedLikeState;

    setMyListLikePendingIds((current) =>
      current.includes(listId) ? current : [...current, listId],
    );

    try {
      if (isCurrentlyLiked) {
        await unlikeList(session.accessToken, parsedListId);
      } else {
        await likeList(session.accessToken, parsedListId);
      }

      setMyListLikeStateById((current) => ({
        ...current,
        [listId]: !isCurrentlyLiked,
      }));
      setMyListLikeCountById((current) => ({
        ...current,
        [listId]: Math.max(0, (current[listId] ?? 0) + (isCurrentlyLiked ? -1 : 1)),
      }));
      if (selectedUserProfileId && selectedVisibleUserProfile?.representativeListId === listId) {
        const applyNextLikeState = (profile: UserProfile) =>
          profile.id === selectedUserProfileId
            ? {
                ...profile,
                representativeListIsLiked: !isCurrentlyLiked,
              }
            : profile;

        setRemoteUserProfiles((current) => current.map(applyNextLikeState));
        setSearchResultUserProfiles((current) => current.map(applyNextLikeState));
        setRecommendedUserProfiles((current) => current.map(applyNextLikeState));
      }
    } catch (error) {
      if (error instanceof ApiError) {
        if (!isCurrentlyLiked && (error.status === 400 || error.status === 409)) {
          setMyListLikeStateById((current) => ({
            ...current,
            [listId]: true,
          }));
          if (selectedUserProfileId && selectedVisibleUserProfile?.representativeListId === listId) {
            const applyNextLikeState = (profile: UserProfile) =>
              profile.id === selectedUserProfileId
                ? {
                    ...profile,
                    representativeListIsLiked: true,
                  }
                : profile;

            setRemoteUserProfiles((current) => current.map(applyNextLikeState));
            setSearchResultUserProfiles((current) => current.map(applyNextLikeState));
            setRecommendedUserProfiles((current) => current.map(applyNextLikeState));
          }

          try {
            const likeCount = await getListLikeCount(session.accessToken, parsedListId);
            setMyListLikeCountById((current) => ({
              ...current,
              [listId]: likeCount,
            }));
          } catch {
            // Keep the previous count if refresh fails.
          }

          return;
        }

        if (isCurrentlyLiked && (error.status === 400 || error.status === 404)) {
          setMyListLikeStateById((current) => ({
            ...current,
            [listId]: false,
          }));
          if (selectedUserProfileId && selectedVisibleUserProfile?.representativeListId === listId) {
            const applyNextLikeState = (profile: UserProfile) =>
              profile.id === selectedUserProfileId
                ? {
                    ...profile,
                    representativeListIsLiked: false,
                  }
                : profile;

            setRemoteUserProfiles((current) => current.map(applyNextLikeState));
            setSearchResultUserProfiles((current) => current.map(applyNextLikeState));
            setRecommendedUserProfiles((current) => current.map(applyNextLikeState));
          }

          try {
            const likeCount = await getListLikeCount(session.accessToken, parsedListId);
            setMyListLikeCountById((current) => ({
              ...current,
              [listId]: likeCount,
            }));
          } catch {
            // Keep the previous count if refresh fails.
          }

          return;
        }
      }

      Alert.alert('?덈궡', '由ъ뒪??醫뗭븘?붿슂瑜??섏젙?섏? 紐삵뻽?듬땲??');
    } finally {
      setMyListLikePendingIds((current) => current.filter((id) => id !== listId));
    }
  };

  const handleBlockedOwnListLike = () => {
    if (Platform.OS === 'android') {
      ToastAndroid.show('내 리스트는 좋아요를 누를 수 없어요.', ToastAndroid.SHORT);
      return;
    }

    Alert.alert('안내', '내 리스트는 좋아요를 누를 수 없어요.');
  };

  const convertFiveStarToTenPoint = (value: number) => value * 2;

  const delay = (ms: number) =>
    new Promise<void>((resolve) => {
      setTimeout(resolve, ms);
    });

  const isUserNotFoundApiError = (error: unknown) =>
    error instanceof ApiError && error.message.includes('유저를 찾을 수 없습니다');

  const getReadableApiErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof ApiError && error.message) {
      return error.message;
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return fallback;
  };

  const waitForServerUserReady = async (token: string, attempts = 3) => {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        await getMyInfo(token);
        return true;
      } catch (error) {
        if (attempt === attempts - 1) {
          return false;
        }

        if (!isUserNotFoundApiError(error) && !isAuthError(error)) {
          return false;
        }

        await delay(450 * (attempt + 1));
      }
    }

    return false;
  };

  const createTasteList = async (
    title: string,
    selected: Restaurant[],
    ratings: Record<string, Record<'맛' | '서비스' | '가성비', number>>,
  ) => {
    if (createTasteListLockRef.current) {
      return;
    }

    createTasteListLockRef.current = true;

    try {
      if (!session?.accessToken) {
        if (tasteFlowSource === 'my-lists' && title.trim()) {
          appendNewList(title.trim(), selected);
        }
        return;
      }

      const internalRestaurants = selected.filter((restaurant) => !restaurant.externalPlaceId);
      const externalRestaurants = selected.filter(
        (restaurant): restaurant is Restaurant & { externalPlaceId: string } =>
          Boolean(restaurant.externalPlaceId),
      );

      if (internalRestaurants.length === 0) {
        throw new Error('리스트를 만들려면 검색된 가게를 한 곳 이상 선택해 주세요.');
      }

      if (internalRestaurants.length < 5) {
        const missingCount = 5 - internalRestaurants.length;
        throw new Error(
          `외부 식당은 첫 리스트 생성의 최소 개수에 포함되지 않아요. 일반 가게를 ${missingCount}곳 더 선택해 주세요.`,
        );
      }

      const resolvedRestaurants = await Promise.all(
        internalRestaurants.map(async (restaurant) => {
          const candidates = await searchRestaurants(session.accessToken, restaurant.name);
          const matched =
            candidates.find((item) => item.name === restaurant.name) ??
            candidates.find((item) => item.name === restaurant.shortName) ??
            candidates[0];

          if (!matched) {
            throw new Error(`${restaurant.name} 식당을 서버에서 찾지 못했어요.`);
          }

          return matched;
        }),
      );

      const regionName =
        resolvedRestaurants[0]?.regionName ??
        selected[0]?.address?.split(' ')[0] ??
        '용인';

      const existingListCount = myLists.length;

      let createdList: Awaited<ReturnType<typeof createList>> | null = null;

      try {
        const createListBody = {
          isPublic: true,
          title: title.trim(),
          regionName,
          restaurants: internalRestaurants.map((restaurant, index) => {
            const rating = ratings[restaurant.id];
            const resolvedRestaurant = resolvedRestaurants[index];

            return {
              restaurantId: resolvedRestaurant.id,
              tasteScore: convertFiveStarToTenPoint(rating['맛']),
              valueScore: convertFiveStarToTenPoint(rating['가성비']),
              moodScore: convertFiveStarToTenPoint(rating['서비스']),
            };
          }),
        };

        let lastCreateListError: unknown = null;

        for (let attempt = 0; attempt < 3; attempt += 1) {
          try {
            createdList = await createList(session.accessToken, createListBody);
            lastCreateListError = null;
            break;
          } catch (error) {
            lastCreateListError = error;

            if (!isUserNotFoundApiError(error) || attempt === 2) {
              throw error;
            }

            console.warn(
              `[TasteList] createList user-not-found retry ${attempt + 1}/3`,
              error,
            );
            await waitForServerUserReady(session.accessToken, 2);
            await delay(500 * (attempt + 1));
          }
        }

        if (lastCreateListError || !createdList) {
          throw lastCreateListError;
        }
      } catch (error) {
        console.error('[TasteList] createList failed', error);
        Alert.alert(
          '안내',
          `리스트 생성 중 문제가 발생했어요.\n${getReadableApiErrorMessage(
            error,
            '다시 시도해 주세요.',
          )}`,
        );
        return;
      }

      if (!createdList.isPublic) {
        await toggleListVisibility(session.accessToken, createdList.id);
      }

      try {
        await Promise.all(
          externalRestaurants.map((restaurant) => {
            const rating = ratings[restaurant.id];

            return addExternalRestaurantToListFallback(session.accessToken!, createdList.id, {
              externalPlaceId: restaurant.externalPlaceId,
              searchQuery: restaurant.externalSearchQuery ?? restaurant.name,
              tasteScore: convertFiveStarToTenPoint(rating['맛']),
              valueScore: convertFiveStarToTenPoint(rating['가성비']),
              moodScore: convertFiveStarToTenPoint(rating['서비스']),
            });
          }),
        );
      } catch (error) {
        console.error('[TasteList] addExternalRestaurantToListFallback failed', error);
        Alert.alert(
          '안내',
          `외부 가게 평점 저장 중 문제가 발생했어요.\n${getReadableApiErrorMessage(
            error,
            '다시 시도해 주세요.',
          )}`,
        );
        return;
      }

      if (existingListCount === 0) {
        await setRepresentativeList(session.accessToken, createdList.id);
      }

      await refreshMyLists(session.accessToken);
    } finally {
      createTasteListLockRef.current = false;
    }
  };

  const getFavoriteColor = (restaurantName: string) => {
    const normalizedName = restaurantName.trim();
    const resolvedRestaurant = initialRestaurantPool.find(
      (restaurant) =>
        restaurant.id === normalizedName ||
        restaurant.name === normalizedName ||
        restaurant.shortName === normalizedName,
    );
    const orderedLists = [
      ...myLists.filter((list) => list.isRepresentative),
      ...myLists.filter((list) => !list.isRepresentative),
    ];

    const matchedList = orderedLists.find((list) =>
      list.restaurants.some(
        (restaurant) =>
          restaurant.id === resolvedRestaurant?.id ||
          restaurant.name === resolvedRestaurant?.name ||
          restaurant.name === resolvedRestaurant?.shortName ||
          restaurant.name === normalizedName ||
          restaurant.id === normalizedName,
      ),
    );

    return matchedList?.accentColor ?? '#D9D9D9';
  };

  const resolveRestaurant = (restaurantName: string) =>
    initialRestaurantPool.find(
      (restaurant) =>
        restaurant.id === restaurantName ||
        restaurant.name === restaurantName ||
        restaurant.shortName === restaurantName,
    ) ?? null;

  const getAddToListRestaurant = (): Restaurant | null => {
    if (addToListRestaurantSnapshot) {
      return addToListRestaurantSnapshot;
    }

    const fallbackName = addToListRestaurantName ?? addToListRestaurantId;

    const matchedRestaurant =
      initialRestaurantPool.find(
        (restaurant) =>
          restaurant.id === addToListRestaurantId ||
          restaurant.name === addToListRestaurantId ||
          restaurant.shortName === addToListRestaurantId,
      ) ??
      initialRestaurantPool.find(
        (restaurant) =>
          restaurant.name === addToListRestaurantName ||
          restaurant.shortName === addToListRestaurantName,
      );

    if (matchedRestaurant) {
      return matchedRestaurant;
    }

    if (!fallbackName) {
      return null;
    }

    return {
      id: addToListRestaurantId ?? fallbackName,
      imageUri: undefined,
      name: fallbackName,
      photoUris: undefined,
      shortName: fallbackName,
      category: '留쏆쭛',
    };
  };

  const openAddRestaurantToListFlow = (
    restaurantInput: Restaurant | string,
    source: 'restaurant-detail' | 'map',
  ) => {
    const fallbackName =
      typeof restaurantInput === 'string'
        ? restaurantInput
        : restaurantInput.shortName || restaurantInput.name;
    const restaurant =
      typeof restaurantInput === 'string'
        ? resolveRestaurant(restaurantInput)
        : restaurantInput;

    setAddToListSource(source);
    setAddToListRestaurantSnapshot(restaurant ?? null);
    setAddToListRestaurantId(restaurant?.id ?? fallbackName);
    setAddToListRestaurantName(restaurant?.name ?? fallbackName);
    setAddToListTargetListIds([]);
    setScreen('add-to-list-select');
  };

  const handleAddRestaurantToListComplete = async (ratings: {
    taste: number;
    service: number;
    value: number;
  }) => {
    const restaurant = getAddToListRestaurant();

    if (!restaurant || addToListTargetListIds.length === 0) {
      return;
    }

    let nextRestaurantId = restaurant.id;
    let nextRestaurantName = restaurant.shortName || restaurant.name;
    let nextRestaurantAddress = restaurant.address ?? '';

    const applyLocalAdd = () => {
      setMyLists((current) =>
        current.map((list) => {
          if (!addToListTargetListIds.includes(list.id)) {
            return list;
          }

          if (list.restaurants.some((item) => item.id === restaurant.id)) {
            return list;
          }

          return {
            ...list,
            restaurantCount: list.restaurantCount + 1,
            restaurants: [
              ...list.restaurants,
              {
                id: nextRestaurantId,
                name: nextRestaurantName,
                address: nextRestaurantAddress,
                ratings,
              },
            ],
          };
        }),
      );
    };

    if (session?.accessToken) {
      try {
        const parsedListIds = addToListTargetListIds.map((listId) => Number(listId));

        if (parsedListIds.some((listId) => Number.isNaN(listId))) {
          throw new Error('invalid_list_id');
        }

        const candidates = await searchRestaurants(session.accessToken, restaurant.name);
        const matchedRestaurant =
          candidates.find((item) => item.name === restaurant.name) ??
          candidates.find((item) => item.name === restaurant.shortName) ??
          candidates[0];

        if (!matchedRestaurant) {
          throw new Error('restaurant_not_found');
        }

        nextRestaurantId = String(matchedRestaurant.id);
        nextRestaurantName = matchedRestaurant.name;
        nextRestaurantAddress = matchedRestaurant.address ?? restaurant.address ?? '';

        await Promise.all(
          parsedListIds.map((listId) =>
            addRestaurantToList(session.accessToken!, listId, {
              restaurantId: matchedRestaurant.id,
              tasteScore: convertFiveStarToTenPoint(ratings.taste),
              valueScore: convertFiveStarToTenPoint(ratings.value),
              moodScore: convertFiveStarToTenPoint(ratings.service),
            }),
          ),
        );
      } catch (error) {
        console.error('[AddToList] addRestaurantToList failed', error);
        Alert.alert(
          '안내',
          `리스트에 가게 점수를 저장하지 못했어요.\n${getReadableApiErrorMessage(
            error,
            '다시 시도해 주세요.',
          )}`,
        );
        return;
      }
    }

    applyLocalAdd();

    setCompletionSource('add-to-list');
    setScreen('complete');
  };

  const openRankingDetail = (variant: 'local' | 'national') => {
    setRankingDetail({
      items:
        variant === 'local' ? rankingEntries.local.slice(0, 40) : rankingEntries.national.slice(0, 40),
      source: 'tabs',
      sourceTab: activeTab,
      title: variant === 'local' ? `${localRankingRegion} 맛집 추천` : '전국 맛집 추천',
      variant,
    });
    setScreen('ranking-detail');
  };

  const openRegionRankingDetail = (regionName?: string, regionDisplayName?: string) => {
    const trimmedRegionName = regionName?.trim() ?? '';

    if (!trimmedRegionName) {
      return;
    }

    const trimmedDisplayName = regionDisplayName?.trim();

    setRankingDetail({
      isLoading: true,
      items: [],
      regionName: trimmedRegionName,
      source: 'search-result',
      title: `${trimmedDisplayName || trimmedRegionName} 맛집 추천`,
      variant: 'region',
    });
    setScreen('ranking-detail');
  };

  const handleBackFromRankingDetail = () => {
    if (!rankingDetail) {
      return;
    }

    if (rankingDetail.source === 'search-result') {
      setScreen('search-result');
      setRankingDetail(null);
      return;
    }

    setActiveTab(rankingDetail.sourceTab);
    setScreen('tabs');
    setRankingDetail(null);
  };

  const handleSelectTab = (tab: AppTab) => {
    if (tab === 'home' && activeTab === 'home') {
      setHomeRestoreAnimated(true);
      setRankingRestoreAnimated(false);
      setMyPageRestoreAnimated(false);
      setHomeScrollState(initialHomeScrollState);
      setHomeRestoreKey((current) => current + 1);
      return;
    }

    if (tab === 'ranking' && activeTab === 'ranking') {
      setHomeRestoreAnimated(false);
      setRankingRestoreAnimated(true);
      setMyPageRestoreAnimated(false);
      setRankingScrollState(initialRankingScrollState);
      setRankingRestoreKey((current) => current + 1);
      return;
    }

    if (tab === 'my' && activeTab === 'my') {
      setHomeRestoreAnimated(false);
      setRankingRestoreAnimated(false);
      setMyPageRestoreAnimated(true);
      setMyPageScrollState(initialMyPageScrollState);
      setMyPageRestoreKey((current) => current + 1);
      return;
    }

    setHomeRestoreAnimated(false);
    setRankingRestoreAnimated(false);
    setMyPageRestoreAnimated(false);
    setActiveTab(tab);
  };

  const openRestaurantDetail = (
    restaurantName: string,
    source: Exclude<RestaurantDetailSource, null>,
    restaurantId?: number,
  ) => {
    setSelectedRestaurantName(restaurantName);
    setSelectedRestaurantId(restaurantId);
    setRestaurantDetailInitialTab('home');
    setRestaurantDetailSource(source);
    setScreen('restaurant-detail');
  };

  const openAiReservation = (restaurant: Restaurant) => {
    if (!session?.accessToken) {
      Alert.alert('안내', '로그인 후 이용해 주세요.');
      setScreen('login');
      return;
    }

    setAiReservationRestaurant({
      address: restaurant.address,
      category: restaurant.category,
      id: Number(restaurant.id),
      name: restaurant.name,
      phone: restaurant.phone,
    });
    setAiReservationDraft((current) =>
      current?.restaurant.name === restaurant.name ? current : null,
    );
    setAiReservationResult(null);
    setScreen('ai-reservation-form');
  };

  const openReliabilityGuide = (
    source: Exclude<ReliabilityGuideSource, null>,
    grade?: string | null,
  ) => {
    setReliabilityGuideSource(source);
    setReliabilityGuideGrade(grade ?? null);
    setScreen('reliability-guide');
  };

  const openLadderGame = () => {
    setScreen('ladder-start');
  };

  const openSnailRace = () => {
    setScreen('snail-race-start');
  };

  const openWorldCup = () => {
    setWorldCupWinner(null);
    setScreen('worldcup-start');
  };

  const handleConfirmLadderCount = (count: number) => {
    setLadderPlayerCount(count);
    setLadderSetup(buildLadderSetup(count));
    setScreen('ladder-play');
  };

  const handleConfirmSnailRaceCount = (count: number) => {
    setSnailRaceCount(count);
    setScreen('snail-race-play');
  };

  const handleStartWorldCup = (category: WorldCupCategory) => {
    setWorldCupCategory(category);
    setWorldCupWinner(null);
    setScreen('worldcup-battle');
  };

  const openWriteReview = (restaurantName: string, restaurantId?: number) => {
    if (!restaurantId) {
      Alert.alert('??덇땀', '??몃뼣 ?類ｋ궖???븍뜄???삳뮉 餓λ쵐??癒?뼄. ?醫롫뻻 ????쇰뻻 ??뺣즲??곻폒?紐꾩뒄.');
      return;
    }

    setWriteReviewRestaurantId(restaurantId);
    setWriteReviewRestaurantName(restaurantName);
    setWriteReviewInitialContent('');
    setWriteReviewMode('create');
    setEditingReviewId(null);
    setRestaurantDetailInitialTab('review');
    setScreen('write-review');
  };

  const openEditReview = (
    reviewId: number,
    restaurantName: string,
    restaurantId: number | undefined,
    content?: string,
  ) => {
    if (!restaurantId) {
      Alert.alert('?덈궡', '?앸떦 ?뺣낫瑜??뺤씤?섏? 紐삵빐 由щ럭瑜??섏젙?????놁뒿?덈떎.');
      return;
    }

    setWriteReviewRestaurantId(restaurantId);
    setWriteReviewRestaurantName(restaurantName);
    setWriteReviewInitialContent(content ?? '');
    setWriteReviewMode('edit');
    setEditingReviewId(reviewId);
    setRestaurantDetailInitialTab('review');
    setScreen('write-review');
  };

  const handleSubmitRestaurantReview = async (draft: WriteReviewDraft) => {
    if (!session?.accessToken || !writeReviewRestaurantId) {
      Alert.alert('??덇땀', '?귐됰윮?????館釉???몃뼣 ?類ｋ궖??筌≪뼚? 筌륁궢六??щ빍??');
      return;
    }
    const uploadedImageUrls =
      draft.media.length > 0
        ? await Promise.all(
            draft.media.map((item) =>
              uploadImageWithPresignedUrl({
                fileName: item.fileName,
                mimeType: item.mimeType,
                token: session.accessToken!,
                type: 'REVIEW',
                uri: item.uri,
              }),
            ),
          )
        : undefined;

    if (writeReviewMode === 'edit') {
      if (!editingReviewId) {
        Alert.alert('?덈궡', '?섏젙??由щ럭 ?뺣낫瑜?李얠? 紐삵뻽?듬땲??');
        return;
      }

      await updateReview(session.accessToken, editingReviewId, {
        content: draft.content,
        imageUrls: uploadedImageUrls,
      });
    } else {
      await createRestaurantReview(session.accessToken, writeReviewRestaurantId, {
        content: draft.content,
        imageUrls: uploadedImageUrls,
      });
    }

    if (myUserId !== null) {
      await refreshMyReviews(session.accessToken, myUserId);
    }

    setRestaurantDetailInitialTab('review');
    setScreen('restaurant-detail');
  };

  const handleUpdateProfileImage = async (selection: {
    fileName?: string | null;
    mimeType?: string | null;
    uri: string;
  }) => {
    if (!session?.accessToken) {
      throw new Error('로그인이 필요합니다.');
    }

    const uploadedImageUrl = await uploadImageWithPresignedUrl({
      fileName: selection.fileName,
      mimeType: selection.mimeType,
      token: session.accessToken,
      type: 'PROFILE',
      uri: selection.uri,
    });

    await updateMyUser(session.accessToken, { profileImageUrl: uploadedImageUrl });
    setProfileImageUrl(uploadedImageUrl);
    return uploadedImageUrl;
  };

  const openUserProfileFromRestaurantDetail = (authorName: string) => {
    const matchedProfile = visibleUserProfiles.find((item) => item.nickname === authorName);

    if (!matchedProfile) {
      return;
    }

    setUserProfileSource({ type: 'restaurant-detail' });
    setSelectedUserProfileId(matchedProfile.id);
    setScreen('user-profile');
  };

  const openNestedUserProfile = (userId: string, source: UserProfileSource) => {
    if (selectedUserProfileId) {
      setUserProfileHistory((current) => [
        ...current,
        {
          userId: selectedUserProfileId,
          source: userProfileSource,
        },
      ]);
    }

    setUserProfileSource(source);
    setSelectedUserProfileId(userId);
    setScreen('user-profile');
  };

  const handleBackFromRestaurantDetail = () => {
    if (!restaurantDetailSource) {
      setScreen('tabs');
      return;
    }

    if (restaurantDetailSource.type === 'search-result') {
      setScreen('search-result');
      return;
    }

    if (restaurantDetailSource.type === 'my-reviews') {
      setScreen('my-reviews');
      return;
    }

    if (restaurantDetailSource.type === 'user-reviews') {
      setSelectedUserProfileId(restaurantDetailSource.userId);
      setScreen('user-reviews');
      return;
    }

    if (restaurantDetailSource.type === 'my-list-detail') {
      setSelectedMyListId(restaurantDetailSource.listId);
      setScreen('my-list-detail');
      return;
    }

    if (restaurantDetailSource.type === 'user-profile') {
      setSelectedUserProfileId(restaurantDetailSource.userId);
      setScreen('user-profile');
      return;
    }

    if (restaurantDetailSource.type === 'tabs') {
      setActiveTab(restaurantDetailSource.tab);
      if (restaurantDetailSource.tab === 'home') {
        setHomeRestoreAnimated(false);
        setHomeRestoreKey((current) => current + 1);
      } else if (restaurantDetailSource.tab === 'ranking') {
        setRankingRestoreAnimated(false);
        setRankingRestoreKey((current) => current + 1);
      } else if (restaurantDetailSource.tab === 'my') {
        setMyPageRestoreAnimated(false);
        setMyPageRestoreKey((current) => current + 1);
      }
      setScreen('tabs');
      return;
    }

    if (restaurantDetailSource.detail.source === 'tabs') {
      setActiveTab(restaurantDetailSource.detail.sourceTab);
    }
    setRankingDetail(restaurantDetailSource.detail);
    setScreen('ranking-detail');
  };

  const handleLoginSuccess = async (
    provider: LoginProvider,
    nextSession: AuthSession,
  ) => {
    await applyStoredSession(provider, nextSession);
    setActiveTab('home');

    try {
      const me = await getMyInfo(nextSession.accessToken);
      const lists = await getMyLists(nextSession.accessToken);

      setNickname(me.nickname);
      setProfileImageUrl(me.profileImageUrl ?? null);
      setBirthDateLabel(formatBirthDate(me));
      setGenderLabel(formatGenderLabel(me.gender));

      const derivedNeedsProfile =
        !me.birthYear || !me.birthMonth || !me.birthDay || !me.gender;
      const needsSignupProfile = nextSession.needsProfile ?? derivedNeedsProfile;

      setRequiresProfileSetup(needsSignupProfile);

      if (lists.length === 0) {
        setTasteFlowSource('onboarding');
        setScreen('signup-nickname');
        return;
      }

      if (needsSignupProfile) {
        setScreen('signup-profile');
        return;
      }

      setScreen('tabs');
    } catch {
      setRequiresProfileSetup(nextSession.needsProfile ?? true);
      setTasteFlowSource('onboarding');
      setScreen('signup-nickname');
    }
  };

  const handleSignupNicknameSubmit = async (nextNickname: string) => {
    setNickname(nextNickname);
    setPendingNickname(nextNickname);

    if (!requiresProfileSetup && session?.accessToken) {
      try {
        await updateMyUser(session.accessToken, { nickname: nextNickname });
        setPendingNickname(null);
      } catch {
        // Keep the local nickname and try again during later onboarding steps.
      }
    }

    if (requiresProfileSetup) {
      setScreen('signup-profile');
      return;
    }

    setTasteFlowSource('onboarding');
    setTasteListName('');
    setSelectedRestaurants([]);
    setScreen('taste-list-name');
  };

  const handleSignupProfileSubmit = async (profile: {
    birthDay: number;
    birthMonth: number;
    birthYear: number;
    gender: 'FEMALE' | 'MALE';
  }) => {
    if (!session?.accessToken) {
      throw new Error('濡쒓렇???뺣낫媛 ?놁뼱???꾨줈?꾩쓣 ??ν븷 ???놁뼱??');
    }

    if (pendingNickname) {
      try {
        console.log('[signup profile] syncing pending nickname');
        await updateMyUser(session.accessToken, { nickname: pendingNickname });
        setPendingNickname(null);
        console.log('[signup profile] pending nickname synced');
      } catch {
        console.log('[signup profile] pending nickname sync failed');
        // Proceed with profile save even if nickname sync needs to be retried later.
      }
    }

    console.log('[signup profile] submitting profile');
    await signupProfile(session.accessToken, profile);
    console.log('[signup profile] profile submitted');
    setBirthDateLabel(`${profile.birthYear}년 ${profile.birthMonth}월 ${profile.birthDay}일`);
    setGenderLabel(profile.gender === 'MALE' ? '남성' : '여성');
    setRequiresProfileSetup(false);
    console.log('[signup profile] waiting for server user ready');
    await waitForServerUserReady(session.accessToken, 4);
    console.log('[signup profile] server user ready');
    console.log('[signup profile] hydrating home recommendations');
    await hydrateHomeRecommendations(session.accessToken, { retryOnEmpty: true });
    console.log('[signup profile] home recommendations hydrated');
    console.log('[signup profile] loading lists');
    const lists = await getMyLists(session.accessToken);
    console.log('[signup profile] lists loaded', { count: lists.length });
    setTasteFlowSource('onboarding');
    if (lists.length === 0) {
      setTasteListName('');
      setSelectedRestaurants([]);
      console.log('[signup profile] routing to taste-list-name');
      setScreen('taste-list-name');
      return;
    }

    console.log('[signup profile] routing to tabs');
    setScreen('tabs');
  };

  const handleLogout = async () => {
    await clearAuthSession();
  };

  const handleDeleteAccount = async () => {
    if (!session?.accessToken) {
      Alert.alert('안내', '로그인 상태를 확인해 주세요.');
      return;
    }

    try {
      await deleteMyUser(session.accessToken);
      await clearAuthSession();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message || '회원탈퇴를 진행하지 못했습니다.'
          : '회원탈퇴를 진행하지 못했습니다.';
      Alert.alert('안내', message);
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      {screen === 'auth-loading' ? (
        <AuthLoadingScreen />
      ) : screen === 'login' ? (
        <OnboardingLoginScreen
          onLoginSuccess={(provider, nextSession) =>
            void handleLoginSuccess(provider as LoginProvider, nextSession)
          }
        />
      ) : screen === 'signup-nickname' ? (
        <SignupNicknameScreen
          initialNickname=""
          onBack={() => setScreen('login')}
          onSubmit={handleSignupNicknameSubmit}
        />
      ) : screen === 'signup-profile' ? (
        <SignupProfileScreen
          nickname={nickname}
          onBack={() => setScreen('signup-nickname')}
          onSubmit={handleSignupProfileSubmit}
        />
      ) : screen === 'taste-list-name' ? (
        <TasteListNameScreen
          nickname={nickname}
          mode={tasteFlowSource === 'my-lists' ? 'new-list' : 'first-list'}
          onBack={() =>
            setScreen(tasteFlowSource === 'my-lists' ? 'my-lists' : 'signup-profile')
          }
          onSubmit={(name) => {
            setTasteListName(name);
            setScreen('taste');
          }}
        />
      ) : screen === 'taste' ? (
        <TasteSelectionScreen
          accessToken={session?.accessToken}
          onBack={() => setScreen('taste-list-name')}
          onConfirm={(restaurants) => {
            setSelectedRestaurants(restaurants);
            setScreen('rating');
          }}
        />
      ) : screen === 'rating' ? (
        <TasteRatingScreen
          listName={tasteListName}
          restaurants={selectedRestaurants}
          onBack={() => setScreen('taste')}
          onSubmit={async (ratings) => {
            if (tasteListName.trim()) {
              await createTasteList(tasteListName.trim(), selectedRestaurants, ratings);
            }
            setCompletionSource('taste-flow');
            setScreen('complete');
          }}
        />
      ) : screen === 'add-to-list-select' ? (
        <AddRestaurantToListSelectScreen
          restaurant={getAddToListRestaurant() ?? initialRestaurantPool[0]}
          lists={myLists}
          onBack={() => {
            if (addToListSource === 'restaurant-detail') {
              setScreen('restaurant-detail');
              return;
            }

            setActiveTab('map');
            setScreen('tabs');
          }}
          onSelectLists={(listIds) => {
            setAddToListTargetListIds(listIds);
            setScreen('add-to-list-rating');
          }}
        />
      ) : screen === 'add-to-list-rating' ? (
        <AddRestaurantToListRatingScreen
          restaurant={getAddToListRestaurant() ?? initialRestaurantPool[0]}
          lists={myLists.filter((item) => addToListTargetListIds.includes(item.id))}
          onBack={() => setScreen('add-to-list-select')}
          onSubmit={handleAddRestaurantToListComplete}
        />
      ) : screen === 'complete' ? (
        <RegistrationCompleteScreen
          onComplete={() => {
            if (completionSource === 'add-to-list') {
              const nextSource = addToListSource;
              setAddToListSource(null);
              setAddToListRestaurantSnapshot(null);
              setAddToListRestaurantId(null);
              setAddToListRestaurantName(null);
              setAddToListTargetListIds([]);
              setCompletionSource('taste-flow');

              if (nextSource === 'restaurant-detail') {
                setScreen('restaurant-detail');
                return;
              }

              setActiveTab('map');
              setScreen('tabs');
              return;
            }

            if (tasteFlowSource === 'my-lists') {
              setTasteFlowSource('onboarding');
              setSelectedRestaurants([]);
              setTasteListName('');
              setScreen('my-lists');
              return;
            }

            setScreen('tabs');
            setActiveTab('home');
          }}
        />
      ) : screen === 'ai-chat' ? (
        <AiChatScreen onBack={() => setScreen('tabs')} />
      ) : screen === 'news' ? (
        <NewsScreen
          accessToken={session?.accessToken}
          onBack={async () => {
            if (session?.accessToken) {
              try {
                const unreadCount = await getUnreadNotificationCount(session.accessToken);
                setHasUnreadNews(unreadCount > 0);
              } catch {
                setHasUnreadNews(false);
              }
            } else {
              setHasUnreadNews(false);
            }

            setScreen('tabs');
          }}
        />
        ) : screen === 'search' ? (
          <SearchScreen
            initialQuery={searchScreenInitialQuery}
            onClose={() => {
              setSearchScreenInitialQuery('');
              setScreen('tabs');
            }}
            onSearch={(query) => {
              setSearchScreenInitialQuery(query);
              setSearchQuery(query);
              setSearchResultTab('restaurant');
              setScreen('search-result');
            }}
          />
        ) : screen === 'search-result' ? (
          <SearchResultScreen
            accessToken={session?.accessToken}
            onClearSearchBar={() => {
              setSearchScreenInitialQuery('');
              setSearchQuery('');
              setScreen('search');
            }}
            myUserId={myUserId}
            query={searchQuery}
            initialTab={searchResultTab}
            onBack={() => {
              setActiveTab('home');
              setHomeRestoreAnimated(false);
              setHomeRestoreKey((current) => current + 1);
              setScreen('tabs');
            }}
            onPressSearchBar={() => {
              setSearchScreenInitialQuery(searchQuery);
              setScreen('search');
            }}
            onChangeTab={setSearchResultTab}
            onOpenRegionRanking={openRegionRankingDetail}
            onOpenRestaurantDetail={(restaurantName, restaurantId) =>
              openRestaurantDetail(restaurantName, { type: 'search-result' }, restaurantId)
            }
          onOpenUserProfile={(user) => {
            setSearchResultUserProfiles((current) => {
              if (current.some((item) => item.id === user.id)) {
                return current;
              }

              return [...current, createSearchResultUserProfile(user)];
            });
            setUserProfileSource({ type: 'search-result' });
            setSelectedUserProfileId(user.id);
            setScreen('user-profile');
          }}
          onSearch={(query) => setSearchQuery(query)}
        />
      ) : screen === 'map-search' ? (
        <MapSearchScreen
          initialQuery={mapSearchQuery}
          onClose={() => {
            setActiveTab('map');
            setScreen('tabs');
          }}
          onSearch={(query) => {
            setMapSearchQuery(query);
            setActiveTab('map');
            setScreen('tabs');
          }}
        />
      ) : screen === 'restaurant-detail' ? (
        <RestaurantDetailScreen
          accessToken={session?.accessToken}
          currentUserId={myUserId}
          followingUserIds={myFollowingUsers
            .map((user) => Number(user.id))
            .filter((userId) => Number.isFinite(userId))}
          initialTab={restaurantDetailInitialTab}
          restaurantId={selectedRestaurantId}
          restaurantName={selectedRestaurantName}
          onBack={handleBackFromRestaurantDetail}
          favoriteColor={getFavoriteColor(selectedRestaurantName)}
          onOpenAiReservation={openAiReservation}
          onAddToList={(restaurant) =>
            openAddRestaurantToListFlow(restaurant, 'restaurant-detail')
          }
          onEditReview={openEditReview}
          onOpenUserProfile={openUserProfileFromRestaurantDetail}
          onReportReview={handleReportReview}
          onReviewAuthorFollowChange={syncFollowStateAcrossScreens}
          onOpenWriteReview={openWriteReview}
        />
      ) : screen === 'ai-reservation-form' && aiReservationRestaurant ? (
        <AiReservationFormScreen
          restaurant={aiReservationRestaurant}
          initialDraft={aiReservationDraft}
          onBack={() => setScreen('restaurant-detail')}
          onSubmit={(draft) => {
            setAiReservationDraft(draft);
            setAiReservationResult(null);
            setScreen('ai-reservation-pending');
          }}
        />
      ) : screen === 'ai-reservation-pending' &&
        aiReservationDraft &&
        aiReservationRestaurant &&
        session?.accessToken ? (
        <AiReservationPendingScreen
          accessToken={session.accessToken}
          draft={aiReservationDraft}
          restaurantId={aiReservationRestaurant.id}
          onComplete={(reservation) => {
            const nextResult = buildAiReservationResult(aiReservationDraft, reservation);
            setAiReservationResult(nextResult);
            setScreen('ai-reservation-result');
          }}
          onError={(message) => {
            Alert.alert('안내', message);
            setScreen('ai-reservation-form');
          }}
        />
      ) : screen === 'ai-reservation-result' && aiReservationDraft && aiReservationResult ? (
        <AiReservationResultScreen
          draft={aiReservationDraft}
          result={aiReservationResult}
          onBack={() => setScreen('restaurant-detail')}
          onGoHome={() => {
            setActiveTab('home');
            setHomeRestoreAnimated(false);
            setHomeRestoreKey((current) => current + 1);
            setScreen('tabs');
          }}
          onRetry={() => {
            setAiReservationResult(null);
            setScreen('ai-reservation-form');
          }}
        />
      ) : screen === 'ladder-start' ? (
        <LadderGameStartScreen
          initialCount={ladderPlayerCount}
          onBack={() => {
            setActiveTab('home');
            setHomeRestoreAnimated(false);
            setHomeRestoreKey((current) => current + 1);
            setScreen('tabs');
          }}
          onChangeCount={setLadderPlayerCount}
          onConfirm={handleConfirmLadderCount}
        />
      ) : screen === 'ladder-play' ? (
        <LadderGamePlayScreen
          setup={ladderSetup}
          onBack={() => setScreen('ladder-start')}
        />
      ) : screen === 'snail-race-start' ? (
        <SnailRaceStartScreen
          initialCount={snailRaceCount}
          onBack={() => {
            setActiveTab('home');
            setHomeRestoreAnimated(false);
            setHomeRestoreKey((current) => current + 1);
            setScreen('tabs');
          }}
          onChangeCount={setSnailRaceCount}
          onConfirm={handleConfirmSnailRaceCount}
        />
      ) : screen === 'snail-race-play' ? (
        <SnailRacePlayScreen
          racerCount={snailRaceCount}
          onBack={() => setScreen('snail-race-start')}
        />
      ) : screen === 'worldcup-start' ? (
        <WorldCupStartScreen
          onBack={() => {
            setActiveTab('home');
            setHomeRestoreAnimated(false);
            setHomeRestoreKey((current) => current + 1);
            setScreen('tabs');
          }}
          onSelectCategory={handleStartWorldCup}
        />
      ) : screen === 'worldcup-battle' ? (
        <WorldCupBattleScreen
          accessToken={session?.accessToken}
          category={worldCupCategory}
          onBack={() => setScreen('worldcup-start')}
          onComplete={(winner) => {
            setWorldCupWinner(winner);
            setScreen('worldcup-result');
          }}
        />
      ) : screen === 'worldcup-result' && worldCupWinner ? (
        <WorldCupResultScreen
          winner={worldCupWinner}
          onBackToHome={() => {
            setActiveTab('home');
            setHomeRestoreAnimated(false);
            setHomeRestoreKey((current) => current + 1);
            setScreen('tabs');
          }}
          onRestart={() => {
            setWorldCupWinner(null);
            setScreen('worldcup-battle');
          }}
        />
      ) : screen === 'reliability-guide' ? (
        <ReliabilityGuideScreen
          currentGrade={reliabilityGuideGrade}
          onBack={() => {
            if (reliabilityGuideSource === 'user-profile') {
              setScreen('user-profile');
              return;
            }

            setActiveTab('my');
            setScreen('tabs');
          }}
        />
      ) : screen === 'write-review' ? (
        <WriteReviewScreen
          initialContent={writeReviewInitialContent}
          restaurantName={writeReviewRestaurantName || selectedRestaurantName}
          onBack={() => {
            setRestaurantDetailInitialTab('review');
            setScreen('restaurant-detail');
          }}
          onSubmit={handleSubmitRestaurantReview}
          submitLabel={writeReviewMode === 'edit' ? '리뷰 수정' : '리뷰 등록'}
          title={writeReviewMode === 'edit' ? '리뷰 수정' : '리뷰 쓰기'}
        />
      ) : screen === 'settings' ? (
        <SettingsScreen
          onBack={() => setScreen('tabs')}
          onLogout={() => void handleLogout()}
          onOpenMyInfo={() => setScreen('my-info')}
          onOpenDeleteAccount={() => setScreen('delete-account')}
        />
      ) : screen === 'my-info' ? (
        <MyInfoScreen
          onBack={() => setScreen('settings')}
          onOpenEditNickname={() => setScreen('edit-nickname')}
          onUpdateProfileImage={handleUpdateProfileImage}
          loginProvider={loginProvider}
          profileImageUrl={profileImageUrl}
          genderLabel={genderLabel}
          birthDateLabel={birthDateLabel}
          nickname={nickname}
        />
      ) : screen === 'my-friends' ? (
          <MyFriendsScreen
            currentUserId={myUserId !== null ? String(myUserId) : null}
            followerUsersData={myFollowerUsers}
            followingUsersData={myFollowingUsers}
            initialTab={myFriendsInitialTab}
          onBack={() => setScreen('tabs')}
          onChangeTab={setMyFriendsInitialTab}
          onToggleFollow={handleToggleMyFriendFollow}
          onOpenUserProfile={(userId) => {
            setUserProfileSource({ type: 'my-friends', tab: myFriendsInitialTab });
            setSelectedUserProfileId(userId);
            setScreen('user-profile');
          }}
        />
      ) : screen === 'user-friends' && selectedUserProfileId ? (
        <MyFriendsScreen
          currentUserId={myUserId !== null ? String(myUserId) : null}
          initialTab={myFriendsInitialTab}
          preserveListOnToggle
          title={
            (visibleUserProfiles.find((item) => item.id === selectedUserProfileId)?.nickname ??
              '') + '님의 밥친구'
          }
          followingUsersData={
            userFriendConnectionsById[selectedUserProfileId]?.following ?? []
          }
          followerUsersData={
            userFriendConnectionsById[selectedUserProfileId]?.followers ?? []
          }
            onBack={() => setScreen('user-profile')}
            onChangeTab={setMyFriendsInitialTab}
            onToggleFollow={handleToggleMyFriendFollow}
            onOpenUserProfile={(userId) => {
              openNestedUserProfile(userId, {
                type: 'user-friends',
                userId: selectedUserProfileId,
                tab: myFriendsInitialTab,
              });
            }}
          />
      ) : screen === 'my-lists' ? (
        <MyListsScreen
          lists={myLists}
          onBack={() => setScreen('tabs')}
          onChangeLists={setMyLists}
          onCreateList={() => {
            setTasteFlowSource('my-lists');
            setSelectedRestaurants([]);
            setTasteListName('');
            setScreen('taste-list-name');
          }}
          onOpenList={(listId) => {
            setSelectedMyListId(listId);
            setScreen('my-list-detail');
          }}
          onDeleteList={handleDeleteMyList}
          onSetRepresentativeList={handleSetRepresentativeMyList}
          onRenameList={handleRenameMyList}
          onToggleListPrivacy={handleToggleMyListPrivacy}
        />
      ) : screen === 'my-list-detail' && selectedMyListId ? (
        <MyListDetailScreen
          list={myLists.find((item) => item.id === selectedMyListId) ?? myLists[0]}
          isLiked={myListLikeStateById[selectedMyListId] ?? false}
          isLikePending={myListLikePendingIds.includes(selectedMyListId)}
          likeCount={myListLikeCountById[selectedMyListId] ?? 0}
          lists={myLists}
          onBack={() => setScreen('my-lists')}
          onChangeLists={setMyLists}
          onOpenPlaceEdit={() => setScreen('my-list-place-edit')}
          onOpenRestaurantDetail={(restaurantName) =>
            openRestaurantDetail(restaurantName, {
              type: 'my-list-detail',
              listId: selectedMyListId,
            })
          }
          onToggleLike={handleBlockedOwnListLike}
          onRenameList={handleRenameMyList}
          onRemoveRestaurants={handleRemoveRestaurantsFromMyList}
          onUpdateRestaurantRatings={handleUpdateRestaurantRatingsInMyList}
        />
      ) : screen === 'my-list-place-edit' && selectedMyListId ? (
        <MyListPlaceEditScreen
          list={myLists.find((item) => item.id === selectedMyListId) ?? myLists[0]}
          lists={myLists}
          onBack={() => setScreen('my-list-detail')}
          onChangeLists={setMyLists}
          onDeleteRestaurants={handleRemoveRestaurantsFromMyList}
        />
      ) : screen === 'my-reviews' ? (
        <MyReviewsScreen
          onBack={() => setScreen('tabs')}
          onDeleteReview={handleDeleteMyReview}
          onOpenRestaurantDetail={(restaurantName) =>
            openRestaurantDetail(restaurantName, { type: 'my-reviews' })
          }
          reviewsData={myReviewItems}
          title="내 리뷰"
        />
      ) : screen === 'user-reviews' && selectedUserProfileId ? (
        <UserReviewsScreen
          title={
              (selectedVisibleUserProfile?.nickname ?? '') + '님의 리뷰'
          }
          reviews={userReviewsById[selectedUserProfileId] ?? []}
          pendingReactionIds={reviewReactionPendingIds}
          onBack={() => setScreen('user-profile')}
          onOpenRestaurantDetail={(restaurantName) =>
            openRestaurantDetail(restaurantName, {
              type: 'user-reviews',
              userId: selectedUserProfileId,
            })
          }
          onToggleReaction={handleToggleUserReviewReaction}
        />
      ) : screen === 'edit-nickname' ? (
        <EditNicknameScreen
          initialNickname={nickname}
          onBack={() => setScreen('my-info')}
          onSubmit={(nextNickname) => {
            setNickname(nextNickname);
            setScreen('my-info');
          }}
        />
      ) : screen === 'delete-account' ? (
        <DeleteAccountScreen
          onBack={() => setScreen('settings')}
          onSubmit={() => void handleDeleteAccount()}
        />
      ) : screen === 'user-profile' && selectedUserProfileId ? (
        <UserProfileScreen
          isFollowLoading={userProfileFollowPendingIds.includes(selectedUserProfileId)}
          isFollowing={selectedUserProfileIsFollowing}
          isOwnProfile={myUserId !== null && Number(selectedUserProfileId) === myUserId}
          onOpenReliabilityGuide={() =>
            openReliabilityGuide(
              'user-profile',
              selectedVisibleUserProfile?.reliabilityGrade,
            )
          }
          onFollowToggle={(nextIsFollowing) =>
            void handleToggleUserProfileFollow(selectedUserProfileId, nextIsFollowing)
          }
          profile={selectedVisibleUserProfile ?? fallbackSelectedUserProfile!}
          onToggleRepresentativeLike={(listId) => void handleToggleMyListLike(listId)}
          representativeLikeCount={
            (() => {
              const selectedProfile = selectedVisibleUserProfile;
              const representativeListId = selectedProfile?.representativeListId;
              return representativeListId
                ? myListLikeCountById[representativeListId] ?? 0
                : undefined;
            })()
          }
          representativeIsLikePending={
            (() => {
              const selectedProfile = selectedVisibleUserProfile;
              const representativeListId = selectedProfile?.representativeListId;
              return representativeListId
                ? myListLikePendingIds.includes(representativeListId)
                : false;
            })()
          }
            representativeIsLiked={
              (() => {
                const selectedProfile = selectedVisibleUserProfile;
                const representativeListId = selectedProfile?.representativeListId;
                const hasStoredLikeState = representativeListId
                  ? Object.prototype.hasOwnProperty.call(
                      myListLikeStateById,
                      representativeListId,
                    )
                  : false;
                return representativeListId
                  ? hasStoredLikeState
                    ? myListLikeStateById[representativeListId]
                    : selectedProfile?.representativeListIsLiked ?? false
                  : selectedProfile?.representativeListIsLiked ?? false;
              })()
            }
          onBack={() => {
            if (userProfileSource?.type === 'search-result') {
              setScreen('search-result');
              return;
            }

              if (userProfileSource?.type === 'home') {
                setActiveTab('home');
                setHomeRestoreAnimated(false);
                setHomeRestoreKey((current) => current + 1);
                setScreen('tabs');
                return;
              }

              if (userProfileSource?.type === 'restaurant-detail') {
                setScreen('restaurant-detail');
                return;
              }

              if (userProfileSource?.type === 'user-friends') {
                const previousProfile = userProfileHistory[userProfileHistory.length - 1];
                setSelectedUserProfileId(userProfileSource.userId);
                setUserProfileSource(previousProfile?.source ?? null);
                setUserProfileHistory((current) => current.slice(0, -1));
                setMyFriendsInitialTab(userProfileSource.tab);
                setScreen('user-friends');
                return;
              }

            if (userProfileSource?.type === 'my-friends') {
              setMyFriendsInitialTab(userProfileSource.tab);
              setScreen('my-friends');
              return;
            }

            setScreen('my-friends');
          }}
          onOpenFollowers={() => {
            setMyFriendsInitialTab('followers');
            setScreen('user-friends');
          }}
          onOpenFollowing={() => {
            setMyFriendsInitialTab('following');
            setScreen('user-friends');
          }}
          onOpenReviews={() => setScreen('user-reviews')}
          onOpenRestaurantDetail={(restaurantName) =>
            openRestaurantDetail(restaurantName, {
              type: 'user-profile',
              userId: selectedUserProfileId,
            })
          }
          onReportUser={
            selectedUserProfileId
              ? (reason) => void handleReportUser(selectedUserProfileId, reason)
              : undefined
          }
        />
      ) : screen === 'ranking-detail' && rankingDetail ? (
        <RankingDetailScreen
          onBack={handleBackFromRankingDetail}
          isLoading={rankingDetail.variant === 'region' ? rankingDetail.isLoading : false}
          items={rankingDetail.items}
          onOpenRestaurantDetail={(restaurantName) =>
            openRestaurantDetail(restaurantName, {
              type: 'ranking-detail',
              detail: rankingDetail,
            })
          }
          title={rankingDetail.title}
          variant={rankingDetail.variant}
        />
      ) : activeTab === 'home' ? (
        <MainHomeScreen
          featuredRestaurantItems={recommendedRestaurantItems}
          hasUnreadNews={hasUnreadNews}
          initialScrollState={homeScrollState}
          localRankingItems={rankingEntries.local}
          localRankingRegion={localRankingRegion}
          mealFriendItems={recommendedMealFriendItems}
          nationalRankingItems={rankingEntries.national}
          onOpenRestaurantDetail={(restaurantName, restaurantId) =>
            openRestaurantDetail(restaurantName, { type: 'tabs', tab: 'home' }, restaurantId)
          }
          onOpenUserProfile={(userId) => {
            setUserProfileSource({ type: 'home' });
            setSelectedUserProfileId(userId);
            setScreen('user-profile');
          }}
          onPressAi={() => setScreen('ai-chat')}
          onPressLadderGame={openLadderGame}
          onPressSnailRace={openSnailRace}
          onPressWorldCup={openWorldCup}
          onPressNews={() => setScreen('news')}
          onPressLocalRanking={() => openRankingDetail('local')}
          onPressNationalRanking={() => openRankingDetail('national')}
          onPressSearch={() => {
              setSearchScreenInitialQuery('');
              setScreen('search');
            }}
          onScrollStateChange={(nextState) =>
            setHomeScrollState((current) => ({ ...current, ...nextState }))
          }
          onSelectTab={handleSelectTab}
          restoreAnimated={homeRestoreAnimated}
          restoreScrollKey={homeRestoreKey}
        />
      ) : activeTab === 'ranking' ? (
        <RankingTabScreen
          initialScrollState={rankingScrollState}
          localRankingItems={rankingEntries.local}
          nationalRankingItems={rankingEntries.national}
          onOpenRestaurantDetail={(restaurantName) =>
            openRestaurantDetail(restaurantName, { type: 'tabs', tab: 'ranking' })
          }
          onPressLocalRanking={() => openRankingDetail('local')}
          onPressNationalRanking={() => openRankingDetail('national')}
          onScrollStateChange={(nextState) =>
            setRankingScrollState((current) => ({ ...current, ...nextState }))
          }
          onSelectTab={handleSelectTab}
          restoreAnimated={rankingRestoreAnimated}
          restoreScrollKey={rankingRestoreKey}
        />
      ) : activeTab === 'map' ? (
        <MapScreen
          accessToken={session?.accessToken}
          mapRestaurantsData={mapListRestaurants}
          onOpenRestaurantDetail={(restaurantName) =>
            openRestaurantDetail(restaurantName, { type: 'tabs', tab: 'map' })
          }
          onAddToList={(restaurantName) =>
            openAddRestaurantToListFlow(restaurantName, 'map')
          }
          getFavoriteColor={getFavoriteColor}
          onPressSearchBar={() => setScreen('map-search')}
          searchQuery={mapSearchQuery}
          onClearSearch={() => setMapSearchQuery('')}
          onSelectTab={handleSelectTab}
        />
      ) : (
        <MyPageScreen
          followerCount={followerCount}
          honorPeriod={myHonorPeriod ?? undefined}
          honorTitle={myHonorTitle ?? undefined}
          initialScrollState={myPageScrollState}
          nickname={nickname}
          myLists={myLists}
          onOpenReliabilityGuide={() =>
            openReliabilityGuide(
              'my-page',
              myReliabilityGrade ?? undefined,
            )
          }
          onOpenMyFollowers={() => {
            setMyFriendsInitialTab('followers');
            setScreen('my-friends');
          }}
          onOpenMyFriends={() => {
            setMyFriendsInitialTab('following');
            setScreen('my-friends');
          }}
          onOpenMyLists={() => setScreen('my-lists')}
          onOpenRepresentativeList={(listId) => {
            setSelectedMyListId(listId);
            setScreen('my-list-detail');
          }}
          onOpenRestaurantDetail={(restaurantName) =>
            openRestaurantDetail(restaurantName, { type: 'tabs', tab: 'my' })
          }
          onOpenMyReviews={() => setScreen('my-reviews')}
          onToggleRepresentativeLike={handleBlockedOwnListLike}
          representativeLikeCount={
            (() => {
              const representativeList =
                myLists.find((item) => item.isRepresentative) ?? myLists[0];
              return representativeList
                ? myListLikeCountById[representativeList.id] ?? 0
                : undefined;
            })()
          }
          representativeIsLikePending={
            (() => {
              const representativeList =
                myLists.find((item) => item.isRepresentative) ?? myLists[0];
              return representativeList
                ? myListLikePendingIds.includes(representativeList.id)
                : false;
            })()
          }
          representativeIsLiked={
            (() => {
              const representativeList =
                myLists.find((item) => item.isRepresentative) ?? myLists[0];
              return representativeList
                ? myListLikeStateById[representativeList.id] ?? false
                : false;
            })()
          }
          onScrollStateChange={(nextState) =>
            setMyPageScrollState((current) => ({ ...current, ...nextState }))
          }
          onOpenSettings={() => setScreen('settings')}
          onSelectTab={handleSelectTab}
          reliabilityGrade={myReliabilityGrade ?? undefined}
          reviewCount={myReviewItems.length}
          restoreAnimated={myPageRestoreAnimated}
          restoreScrollKey={myPageRestoreKey}
        />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  authLoadingScreen: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
});
