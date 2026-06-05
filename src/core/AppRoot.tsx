import { useEffect, useState } from 'react';
import { useMemo } from 'react';
import { useRef } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  addExternalRestaurantToListFallback,
  addRestaurantToList,
  createRestaurantReview,
  createList,
  deleteList,
  formatBirthDate,
  formatGenderLabel,
  getFollowers,
  getFollowCount,
  getFollowStatus,
  getFollowings,
  getUnreadNotificationCount,
  getListDetail,
  getListLikeCount,
  getUserRepresentativeList,
  getMyInfo,
  getMyLists,
  getReliabilityScore,
  getRestaurantRankings,
  getUserInfo,
  getUserReviews,
  mapListDetailToMyList,
  mapListSummaryToMyList,
  mapRankingItems,
  searchRestaurants,
  setRepresentativeList,
  toggleListVisibility,
  refreshAuthToken,
  updateReview,
  updateList,
  updateMyUser,
} from '../api/wagu';
import { ApiError, isAuthError, setAuthRefreshHandler } from '../api/client';
import { uploadImageWithPresignedUrl } from '../api/upload';
import { AppTab } from '../components/BottomTabBar';
import { AppRootTabScreens } from './appRoot/screenRenderers/AppRootTabScreens';
import { AppRootExperienceScreens } from './appRoot/screenRenderers/AppRootExperienceScreens';
import { AppRootAccountScreens } from './appRoot/screenRenderers/AppRootAccountScreens';
import { AppRootFlowScreens } from './appRoot/screenRenderers/AppRootFlowScreens';
import { createAuthFlowHandlers } from './appRoot/handlers/createAuthFlowHandlers';
import { createAddToListHandlers } from './appRoot/handlers/createAddToListHandlers';
import { createFollowHandlers } from './appRoot/handlers/createFollowHandlers';
import { createHomeRecommendationHandlers } from './appRoot/handlers/createHomeRecommendationHandlers';
import { createMyFriendFollowHandlers } from './appRoot/handlers/createMyFriendFollowHandlers';
import { createNavigationHandlers } from './appRoot/handlers/createNavigationHandlers';
import { createMyListLikeHandlers } from './appRoot/handlers/createMyListLikeHandlers';
import { createSessionHandlers } from './appRoot/handlers/createSessionHandlers';
import { createMyListHandlers } from './appRoot/handlers/createMyListHandlers';
import { createMyListRestaurantHandlers } from './appRoot/handlers/createMyListRestaurantHandlers';
import { createReportHandlers } from './appRoot/handlers/createReportHandlers';
import { createReviewHandlers } from './appRoot/handlers/createReviewHandlers';
import { createTasteListHandler } from './appRoot/handlers/createTasteListHandler';
import {
  HOME_PROFILE_ACCENT_COLORS,
  buildAiReservationResult,
  buildFriendUserFromSources,
  createSearchResultUserProfile,
  formatApiReviewDate,
  hydrateFriendUsersWithReliability,
  mapApiReviewToMyReview,
  mapFollowUsersToFriendUsers,
  mergeUserProfiles,
  retryAsync,
  sortFollowersForInitialView,
} from './appRoot/utils/helpers';
import {
  delay,
  getReadableApiErrorMessage,
  isUserNotFoundApiError,
  waitForServerUserReady,
} from './appRoot/utils/serverSync';
import { convertFiveStarToTenPoint } from './appRoot/utils/ratings';
import type {
  AuthSession,
  FlowScreen,
  RankingDetailState,
  ReliabilityGuideSource,
  RestaurantDetailSource,
  SearchResultTabKey,
  UserProfileHistoryEntry,
  UserProfileSource,
} from './appRoot/types';
import type { FriendTabKey, FriendUser, FollowTogglePayload } from '../types/myFriends';
import type { MyList } from '../types/myLists';
import type { MyReview } from '../types/myReviews';
import type { RankingEntry } from '../types/rankings';
import { restaurants as initialRestaurantPool } from '../fixtures/restaurants';
import type { Restaurant } from '../types/restaurants';
import { AddRestaurantToListRatingScreen } from '../screens/lists/AddRestaurantToListRatingScreen';
import { AddRestaurantToListSelectScreen } from '../screens/lists/AddRestaurantToListSelectScreen';
import { AiReservationFormScreen } from '../screens/ai/AiReservationFormScreen';
import { AiReservationPendingScreen } from '../screens/ai/AiReservationPendingScreen';
import { AiReservationResultScreen } from '../screens/ai/AiReservationResultScreen';
import { AiChatScreen } from '../screens/ai/AiChatScreen';
import { DeleteAccountScreen } from '../screens/profile/DeleteAccountScreen';
import { EditNicknameScreen } from '../screens/profile/EditNicknameScreen';
import { LadderGamePlayScreen } from '../screens/games/LadderGamePlayScreen';
import { LadderGameStartScreen } from '../screens/games/LadderGameStartScreen';
import type { HomeProfileCardItem, HomeRestaurantCardItem, HomeScrollState } from '../screens/home/MainHomeScreen';
import { MapSearchScreen } from '../screens/map/MapSearchScreen';
import { LoginProvider, MyInfoScreen } from '../screens/profile/MyInfoScreen';
import { MyFriendsScreen } from '../screens/profile/MyFriendsScreen';
import { MyListDetailScreen } from '../screens/lists/MyListDetailScreen';
import { MyListPlaceEditScreen } from '../screens/lists/MyListPlaceEditScreen';
import { MyListsScreen } from '../screens/lists/MyListsScreen';
import type { MyPageScrollState } from '../screens/profile/MyPageScreen';
import { MyReviewsScreen } from '../screens/reviews/MyReviewsScreen';
import { NewsScreen } from '../screens/home/NewsScreen';
import { OnboardingLoginScreen } from '../screens/auth/OnboardingLoginScreen';
import { RankingDetailScreen } from '../screens/ranking/RankingDetailScreen';
import type { RankingTabScrollState } from '../screens/ranking/RankingTabScreen';
import { RegistrationCompleteScreen } from '../screens/auth/RegistrationCompleteScreen';
import { ReliabilityGuideScreen } from '../screens/profile/ReliabilityGuideScreen';
import { RestaurantDetailScreen } from '../screens/restaurant/RestaurantDetailScreen';
import { SearchResultScreen } from '../screens/search/SearchResultScreen';
import { SearchScreen } from '../screens/search/SearchScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { SnailRacePlayScreen } from '../screens/games/SnailRacePlayScreen';
import { SnailRaceStartScreen } from '../screens/games/SnailRaceStartScreen';
import { SignupNicknameScreen } from '../screens/auth/SignupNicknameScreen';
import { SignupProfileScreen } from '../screens/auth/SignupProfileScreen';
import { TasteRatingScreen } from '../screens/lists/TasteRatingScreen';
import { TasteListNameScreen } from '../screens/lists/TasteListNameScreen';
import { TasteSelectionScreen } from '../screens/lists/TasteSelectionScreen';
import { UserReviewsScreen } from '../screens/reviews/UserReviewsScreen';
import { UserProfileScreen } from '../screens/profile/UserProfileScreen';
import { WorldCupBattleScreen } from '../screens/games/WorldCupBattleScreen';
import { WorldCupResultScreen } from '../screens/games/WorldCupResultScreen';
import { WorldCupStartScreen } from '../screens/games/WorldCupStartScreen';
import { WriteReviewDraft, WriteReviewScreen } from '../screens/reviews/WriteReviewScreen';
import type { UserProfile } from '../types/userProfiles';
import type { AiReservationDraft, AiReservationResult } from '../types/aiReservation';
import { LadderGameSetup } from '../types/ladderGame';
import { WorldCupCategory, WorldCupEntry } from '../types/worldCup';
import { normalizeReliabilityGrade } from '../utils/reliability';
import { buildLadderSetup } from '../utils/ladderGame';
import { readStoredSession } from './sessionStorage';

function AuthLoadingScreen() {
  return (
    <View style={styles.authLoadingScreen}>
      <ActivityIndicator size="large" color="#FF3B30" />
    </View>
  );
}

export function AppRoot() {
  const fallbackMyLists: MyList[] = [];
  const fallbackFollowerCount = 0;
  const fallbackFollowingUsers: FriendUser[] = [];
  const fallbackFollowerUsers: FriendUser[] = [];
  const fallbackUserProfiles: UserProfile[] = [];
  const visibleUserReviewsByUserId: Record<string, MyReview[]> = {};
  const visibleUserFriendConnectionsByUserId: Record<
    string,
    {
      followers: FriendUser[];
      following: FriendUser[];
    }
  > = {};
  const fallbackRankingEntries = {
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
  const [myReviewItems, setMyReviewItems] = useState<MyReview[]>([]);
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

  const { applyStoredSession, clearAuthSession } = createSessionHandlers({
    fallbackLocalRankingRegion,
    setBirthDateLabel,
    setFollowerCount,
    setGenderLabel,
    setLocalRankingRegion,
    setLoginProvider,
    setMyFollowerUsers,
    setMyFollowingUsers,
    setMyHonorPeriod,
    setMyHonorTitle,
    setMyLists,
    setMyReliabilityGrade,
    setMyReliabilityScore,
    setMyReviewItems,
    setMyUserId,
    setNickname,
    setPendingNickname,
    setProfileImageUrl,
    setRankingEntries,
    setRecommendedMealFriendItems,
    setRecommendedRestaurantItems,
    setRecommendedUserProfiles,
    setRequiresProfileSetup,
    setScreen,
    setSession,
  });

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

  const { handleReportReview, handleReportUser } = createReportHandlers({
    session,
  });
  const {
    handleToggleUserProfileFollow,
    syncFollowStateAcrossScreens,
    syncFollowStateAcrossUserConnections,
  } = createFollowHandlers({
    fallbackUserProfiles,
    myFollowerUsers,
    recommendedUserProfiles,
    remoteUserProfiles,
    searchResultUserProfiles,
    session,
    setMyFollowerUsers,
    setMyFollowingUsers,
    setRemoteUserFriendConnectionsByUserId,
    setRemoteUserProfiles,
    setUserProfileFollowPendingIds,
    setUserProfileFollowStateById,
    sortFollowersForInitialView,
  });

  const { hydrateHomeRecommendations } = createHomeRecommendationHandlers({
    hasRejectedAuthError,
    homeProfileAccentColors: HOME_PROFILE_ACCENT_COLORS,
    setRecommendedMealFriendItems,
    setRecommendedRestaurantItems,
    setRecommendedUserProfiles,
  });

  const { handleDeleteMyReview, handleToggleUserReviewReaction, refreshMyReviews } =
    createReviewHandlers({
      mapApiReviewToMyReview,
      myUserId,
      session,
      setMyReviewItems,
      setRemoteUserReviewsByUserId,
      setReviewReactionPendingIds,
    });

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

        setScreen((current) => (current === 'auth-loading' ? 'tabs' : current));
      }
    };

    void hydrateSession();

    return () => {
      cancelled = true;
    };
  }, [session]);

  const {
    appendNewList,
    getAddToListRestaurant,
    getFavoriteColor,
    handleBackFromRankingDetail,
    handleBackFromRestaurantDetail,
    handleConfirmLadderCount,
    handleConfirmSnailRaceCount,
    handleStartWorldCup,
    openAddRestaurantToListFlow,
    openAiReservation,
    openEditReview,
    openLadderGame,
    openNestedUserProfile,
    openRankingDetail,
    openRegionRankingDetail,
    openReliabilityGuide,
    openRestaurantDetail,
    openSnailRace,
    openUserProfileFromRestaurantDetail,
    openWorldCup,
    openWriteReview,
  } = createNavigationHandlers({
    activeTab,
    addToListRestaurantId,
    addToListRestaurantName,
    addToListRestaurantSnapshot,
    localRankingRegion,
    myLists,
    rankingDetail,
    rankingEntries,
    recommendedUserProfiles,
    remoteUserProfiles,
    restaurantDetailSource,
    searchResultUserProfiles,
    selectedUserProfileId,
    sessionAccessToken: session?.accessToken,
    userProfileSource,
    visibleUserProfiles,
    setActiveTab,
    setAddToListRestaurantId,
    setAddToListRestaurantName,
    setAddToListRestaurantSnapshot,
    setAddToListSource,
    setAddToListTargetListIds,
    setAiReservationDraft,
    setAiReservationRestaurant,
    setAiReservationResult,
    setEditingReviewId,
    setHomeRestoreAnimated,
    setHomeRestoreKey,
    setLadderPlayerCount,
    setLadderSetup,
    setMyPageRestoreAnimated,
    setMyPageRestoreKey,
    setRankingDetail,
    setRankingRestoreAnimated,
    setRankingRestoreKey,
    setReliabilityGuideGrade,
    setReliabilityGuideSource,
    setRestaurantDetailInitialTab,
    setRestaurantDetailSource,
    setScreen,
    setSelectedMyListId,
    setSelectedRestaurantId,
    setSelectedRestaurantName,
    setSelectedUserProfileId,
    setSnailRaceCount,
    setUserProfileHistory,
    setUserProfileSource,
    setWorldCupCategory,
    setWorldCupWinner,
    setWriteReviewInitialContent,
    setWriteReviewMode,
    setWriteReviewRestaurantId,
    setWriteReviewRestaurantName,
  });

  const {
    handleDeleteMyList,
    handleRenameMyList,
    handleSetRepresentativeMyList,
    handleToggleMyListPrivacy,
    refreshMyLists,
  } = createMyListHandlers({
    session,
    setMyLists,
    setMyListLikeStateById,
  });

  const { handleRemoveRestaurantsFromMyList, handleUpdateRestaurantRatingsInMyList } =
    createMyListRestaurantHandlers({
      myLists,
      session,
      setMyLists,
    });

  const { handleToggleMyListLike } = createMyListLikeHandlers({
    myListLikeStateById,
    selectedUserProfileId,
    selectedVisibleUserProfile,
    session,
    setMyListLikeCountById,
    setMyListLikePendingIds,
    setMyListLikeStateById,
    setRecommendedUserProfiles,
    setRemoteUserProfiles,
    setSearchResultUserProfiles,
  });

  const { handleAddRestaurantToListComplete } = createAddToListHandlers({
    addToListTargetListIds,
    convertFiveStarToTenPoint,
    getAddToListRestaurant,
    getReadableApiErrorMessage,
    session,
    setCompletionSource,
    setMyLists,
    setScreen,
  });

  const { handleToggleMyFriendFollow } = createMyFriendFollowHandlers({
    buildFriendUserFromSources,
    fallbackUserProfiles,
    mergeUserProfiles,
    myFollowerUsers,
    myFollowingUsers,
    recommendedUserProfiles,
    remoteUserFriendConnectionsByUserId,
    remoteUserProfiles,
    searchResultUserProfiles,
    session,
    setMyFollowerUsers,
    setMyFollowingUsers,
    sortFollowersForInitialView,
    syncFollowStateAcrossUserConnections,
  });

  const handleBlockedOwnListLike = () => {
    if (Platform.OS === 'android') {
      ToastAndroid.show('내 리스트는 좋아요를 누를 수 없어요.', ToastAndroid.SHORT);
      return;
    }

    Alert.alert('안내', '내 리스트는 좋아요를 누를 수 없어요.');
  };

  const { createTasteList } = createTasteListHandler({
    appendNewList,
    convertFiveStarToTenPoint,
    createTasteListLockRef,
    delay,
    getReadableApiErrorMessage,
    hydrateHomeRecommendations,
    isUserNotFoundApiError,
    myLists,
    refreshMyLists,
    searchRestaurantsLocal: searchRestaurants,
    session,
    setMyLists,
    setRepresentativeListRemote: setRepresentativeList,
    tasteFlowSource,
    toggleListVisibilityRemote: toggleListVisibility,
    waitForServerUserReady,
  });

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

  const {
    handleDeleteAccount,
    handleLoginSuccess,
    handleLogout,
    handleSignupNicknameSubmit,
    handleSignupProfileSubmit,
    handleUpdateProfileImage,
  } = createAuthFlowHandlers({
    applyStoredSession,
    clearAuthSession,
    hydrateHomeRecommendations,
    pendingNickname,
    requiresProfileSetup,
    session,
    setActiveTab,
    setBirthDateLabel,
    setGenderLabel,
    setNickname,
    setPendingNickname,
    setProfileImageUrl,
    setRequiresProfileSetup,
    setScreen,
    setSelectedRestaurants,
    setTasteFlowSource,
    setTasteListName,
    waitForServerUserReady,
  });

  const experienceScreen = AppRootExperienceScreens({
    accessToken: session?.accessToken,
    aiReservationDraft,
    aiReservationRestaurant,
    aiReservationResult,
    getFavoriteColor,
    handleBackFromRestaurantDetail,
    handleConfirmLadderCount,
    handleConfirmSnailRaceCount,
    handleStartWorldCup,
    handleSubmitRestaurantReview,
    homeRestoreAfterReturn: () => {
      setActiveTab('home');
      setHomeRestoreAnimated(false);
      setHomeRestoreKey((current) => current + 1);
      setScreen('tabs');
    },
    ladderPlayerCount,
    ladderSetup,
    mapSearchQuery,
    myUserFollowingIds: myFollowingUsers
      .map((user) => Number(user.id))
      .filter((userId) => Number.isFinite(userId)),
    myUserId,
    onAiReservationError: (message) => {
      Alert.alert('안내', message);
      setScreen('ai-reservation-form');
    },
    onBackFromAiChat: () => setScreen('tabs'),
    onBackFromReliabilityGuide: () => {
      if (reliabilityGuideSource === 'user-profile') {
        setScreen('user-profile');
        return;
      }

      setActiveTab('my');
      setScreen('tabs');
    },
    onBackFromWriteReview: () => {
      setRestaurantDetailInitialTab('review');
      setScreen('restaurant-detail');
    },
    onBackToRestaurantDetail: () => setScreen('restaurant-detail'),
    onChangeLadderPlayerCount: setLadderPlayerCount,
    onChangeSnailRaceCount: setSnailRaceCount,
    onClearSearchBar: () => {
      setSearchScreenInitialQuery('');
      setSearchQuery('');
      setScreen('search');
    },
    onCompleteReservation: (reservation) => {
      const nextResult = buildAiReservationResult(aiReservationDraft!, reservation);
      setAiReservationResult(nextResult);
      setScreen('ai-reservation-result');
    },
    onGoToMapSearchResult: (query) => {
      setMapSearchQuery(query);
      setActiveTab('map');
      setScreen('tabs');
    },
    onMapSearchClose: () => {
      setActiveTab('map');
      setScreen('tabs');
    },
    onNewsBack: async () => {
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
    },
    onOpenAiReservation: openAiReservation,
    onOpenAddToListFromRestaurantDetail: (restaurant) =>
      openAddRestaurantToListFlow(restaurant, 'restaurant-detail'),
    onOpenEditReview: openEditReview,
    onOpenRegionRanking: openRegionRankingDetail,
    onOpenRestaurantDetailFromSearch: (restaurantName, restaurantId) =>
      openRestaurantDetail(restaurantName, { type: 'search-result' }, restaurantId),
    onOpenSearch: (query) => {
      setSearchScreenInitialQuery(query);
      setSearchQuery(query);
      setSearchResultTab('restaurant');
      setScreen('search-result');
    },
    onOpenSearchResultUserProfile: (user) => {
      setSearchResultUserProfiles((current) => {
        if (current.some((item) => item.id === user.id)) {
          return current;
        }

        return [...current, createSearchResultUserProfile(user)];
      });
      setUserProfileSource({ type: 'search-result' });
      setSelectedUserProfileId(user.id);
      setScreen('user-profile');
    },
    onOpenUserProfileFromRestaurantDetail: openUserProfileFromRestaurantDetail,
    onOpenWriteReview: openWriteReview,
    onReportReview: handleReportReview,
    onReservationDraftChange: setAiReservationDraft,
    onRetryReservation: () => {
      setAiReservationResult(null);
      setScreen('ai-reservation-form');
    },
    onSearchResultBack: () => {
      setActiveTab('home');
      setHomeRestoreAnimated(false);
      setHomeRestoreKey((current) => current + 1);
      setScreen('tabs');
    },
    onSearchResultQueryChange: setSearchQuery,
    onSearchResultTabChange: setSearchResultTab,
    onSearchScreenClose: () => {
      setSearchScreenInitialQuery('');
      setScreen('tabs');
    },
    onSearchScreenOpenFromResult: () => {
      setSearchScreenInitialQuery(searchQuery);
      setScreen('search');
    },
    onSetAiReservationResult: setAiReservationResult,
    onSetScreen: setScreen,
    onSetWorldCupWinner: setWorldCupWinner,
    onSyncReviewAuthorFollowChange: syncFollowStateAcrossScreens,
    query: searchQuery,
    reliabilityGuideGrade,
    restaurantDetailInitialTab,
    screen,
    searchResultTab,
    searchScreenInitialQuery,
    selectedRestaurantId,
    selectedRestaurantName,
    sessionAccessToken: session?.accessToken,
    setWorldCupWinnerAndOpenResult: (winner) => {
      setWorldCupWinner(winner);
      setScreen('worldcup-result');
    },
    snailRaceCount,
    worldCupCategory,
    worldCupWinner,
    writeReviewInitialContent,
    writeReviewMode,
    writeReviewRestaurantName,
  });

  const accountScreen = AppRootAccountScreens({
    birthDateLabel,
    fallbackSelectedUserProfile,
    followerUsers: myFollowerUsers,
    followingUsers: myFollowingUsers,
    genderLabel,
    handleBackFromRankingDetail,
    handleBlockedOwnListLike,
    handleDeleteAccount,
    handleDeleteMyList,
    handleDeleteMyReview,
    handleDeleteRestaurantsFromMyList: handleRemoveRestaurantsFromMyList,
    handleLogout,
    handleMyFriendFollowToggle: handleToggleMyFriendFollow,
    handleMyListRename: handleRenameMyList,
    handleMyListSetRepresentative: handleSetRepresentativeMyList,
    handleMyListTogglePrivacy: handleToggleMyListPrivacy,
    handleOpenRestaurantDetail: openRestaurantDetail,
    handleReportUser: handleReportUser,
    handleToggleMyListLike: handleToggleMyListLike,
    handleToggleReviewReaction: handleToggleUserReviewReaction,
    handleToggleUserProfileFollow: handleToggleUserProfileFollow,
    handleUpdateProfileImage,
    handleUpdateRestaurantRatingsInMyList,
    loginProvider,
    myFriendsInitialTab,
    myListLikeCountById,
    myListLikePendingIds,
    myListLikeStateById,
    myLists,
    myReviewItems,
    myUserId,
    nickname,
    onBackFromHomeUserProfile: () => {
      setActiveTab('home');
      setHomeRestoreAnimated(false);
      setHomeRestoreKey((current) => current + 1);
      setScreen('tabs');
    },
    onBackToMyInfo: () => setScreen('my-info'),
    onBackToSettings: () => setScreen('settings'),
    onChangeMyFriendsTab: setMyFriendsInitialTab,
    onCreateMyList: () => {
      setTasteFlowSource('my-lists');
      setSelectedRestaurants([]);
      setTasteListName('');
      setScreen('taste-list-name');
    },
    onOpenNestedUserProfile: openNestedUserProfile,
    onOpenReliabilityGuideFromUserProfile: () =>
      openReliabilityGuide('user-profile', selectedVisibleUserProfile?.reliabilityGrade),
    onOpenUserProfileFromMyFriends: (userId) => {
      setUserProfileSource({ type: 'my-friends', tab: myFriendsInitialTab });
      setSelectedUserProfileId(userId);
      setScreen('user-profile');
    },
    onSetMyFriendsInitialTab: setMyFriendsInitialTab,
    onSetMyLists: setMyLists,
    onSetNicknameAndReturn: (nextNickname) => {
      setNickname(nextNickname);
      setScreen('my-info');
    },
    onSetScreen: setScreen,
    onSetSelectedMyListId: setSelectedMyListId,
    onSetSelectedUserProfileId: setSelectedUserProfileId,
    onSetUserProfileHistory: setUserProfileHistory,
    onSetUserProfileSource: setUserProfileSource,
    profileImageUrl,
    rankingDetail,
    reviewReactionPendingIds,
    reviewsByUserId: userReviewsById,
    screen,
    selectedMyListId,
    selectedUserProfileId,
    selectedUserProfileIsFollowing,
    selectedVisibleUserProfile,
    userFriendConnectionsById,
    userProfileFollowPendingIds,
    userProfileHistory,
    userProfileSource,
    visibleUserProfiles,
  });

  const flowScreen = AppRootFlowScreens({
    accessToken: session?.accessToken,
    addToListRestaurant: getAddToListRestaurant() ?? initialRestaurantPool[0],
    addToListSource,
    addToListTargetListIds,
    completionSource,
    myLists,
    nickname,
    onAddToListSelectionComplete: (listIds) => {
      setAddToListTargetListIds(listIds);
      setScreen('add-to-list-rating');
    },
    onBackFromAddToListSelect: () => {
      if (addToListSource === 'restaurant-detail') {
        setScreen('restaurant-detail');
        return;
      }

      setActiveTab('map');
      setScreen('tabs');
    },
    onBackFromComplete: () => {
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
    },
    onBackFromTasteListName: () =>
      setScreen(tasteFlowSource === 'my-lists' ? 'my-lists' : 'signup-profile'),
    onCompleteTasteRating: async (ratings) => {
      if (tasteListName.trim()) {
        await createTasteList(tasteListName.trim(), selectedRestaurants, ratings);
      }
      setCompletionSource('taste-flow');
      setScreen('complete');
    },
    onFlowLoginSuccess: handleLoginSuccess,
    onOpenAddToListRatingBack: () => setScreen('add-to-list-select'),
    onOpenRatingBack: () => setScreen('taste'),
    onOpenSignupNicknameBack: () => setScreen('login'),
    onOpenSignupProfileBack: () => setScreen('signup-nickname'),
    onOpenTasteBack: () => setScreen('taste-list-name'),
    onSelectTasteRestaurants: setSelectedRestaurants,
    onSetScreen: setScreen,
    onSetTasteListName: setTasteListName,
    onSubmitAddToListRating: handleAddRestaurantToListComplete,
    onSubmitSignupNickname: handleSignupNicknameSubmit,
    onSubmitSignupProfile: handleSignupProfileSubmit,
    screen,
    selectedRestaurants,
    tasteFlowSource,
    tasteListName,
  });

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      {screen === 'auth-loading' ? (
        <AuthLoadingScreen />
      ) : flowScreen ? (
        flowScreen
      ) : experienceScreen ? (
        experienceScreen
      ) : accountScreen ? (
        accountScreen
      ) : (
        <AppRootTabScreens
          accessToken={session?.accessToken}
          activeTab={activeTab}
          followerCount={followerCount}
          getFavoriteColor={getFavoriteColor}
          hasUnreadNews={hasUnreadNews}
          homeRestoreAnimated={homeRestoreAnimated}
          homeRestoreKey={homeRestoreKey}
          homeScrollState={homeScrollState}
          localRankingRegion={localRankingRegion}
          mapListRestaurants={mapListRestaurants}
          mapSearchQuery={mapSearchQuery}
          myHonorPeriod={myHonorPeriod ?? undefined}
          myHonorTitle={myHonorTitle ?? undefined}
          myListLikeCountById={myListLikeCountById}
          myListLikePendingIds={myListLikePendingIds}
          myListLikeStateById={myListLikeStateById}
          myLists={myLists}
          myPageRestoreAnimated={myPageRestoreAnimated}
          myPageRestoreKey={myPageRestoreKey}
          myPageScrollState={myPageScrollState}
          myReliabilityGrade={myReliabilityGrade ?? undefined}
          myReviewItemsLength={myReviewItems.length}
          nickname={nickname}
          rankingEntries={rankingEntries}
          rankingRestoreAnimated={rankingRestoreAnimated}
          rankingRestoreKey={rankingRestoreKey}
          rankingScrollState={rankingScrollState}
          recommendedMealFriendItems={recommendedMealFriendItems}
          recommendedRestaurantItems={recommendedRestaurantItems}
          onChangeHomeScrollState={(nextState) =>
            setHomeScrollState((current) => ({ ...current, ...nextState }))
          }
          onChangeMyPageScrollState={(nextState) =>
            setMyPageScrollState((current) => ({ ...current, ...nextState }))
          }
          onChangeRankingScrollState={(nextState) =>
            setRankingScrollState((current) => ({ ...current, ...nextState }))
          }
          onClearMapSearch={() => setMapSearchQuery('')}
          onOpenAddRestaurantFromMap={(restaurant) =>
            openAddRestaurantToListFlow(restaurant, 'map')
          }
          onOpenAiChat={() => setScreen('ai-chat')}
          onOpenHomeUserProfile={(userId) => {
            setUserProfileSource({ type: 'home' });
            setSelectedUserProfileId(userId);
            setScreen('user-profile');
          }}
          onOpenLadderGame={openLadderGame}
          onOpenLocalRanking={() => openRankingDetail('local')}
          onOpenMapSearch={() => setScreen('map-search')}
          onOpenMyFollowers={() => {
            setMyFriendsInitialTab('followers');
            setScreen('my-friends');
          }}
          onOpenMyFriends={() => {
            setMyFriendsInitialTab('following');
            setScreen('my-friends');
          }}
          onOpenMyLists={() => setScreen('my-lists')}
          onOpenMyReviews={() => setScreen('my-reviews')}
          onOpenNationalRanking={() => openRankingDetail('national')}
          onOpenNews={() => setScreen('news')}
          onOpenRepresentativeList={(listId) => {
            setSelectedMyListId(listId);
            setScreen('my-list-detail');
          }}
          onOpenRestaurantDetail={(restaurantName, sourceTab, restaurantId) =>
            openRestaurantDetail(restaurantName, { type: 'tabs', tab: sourceTab }, restaurantId)
          }
          onOpenReliabilityGuide={(grade) => openReliabilityGuide('my-page', grade)}
          onOpenSearch={() => {
            setSearchScreenInitialQuery('');
            setScreen('search');
          }}
          onOpenSettings={() => setScreen('settings')}
          onOpenSnailRace={openSnailRace}
          onOpenWorldCup={openWorldCup}
          onSelectTab={handleSelectTab}
          onToggleRepresentativeLike={handleBlockedOwnListLike}
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
