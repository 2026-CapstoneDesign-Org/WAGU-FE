import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  createList,
  formatBirthDate,
  formatGenderLabel,
  getFollowCount,
  getListDetail,
  getMyInfo,
  getMyLists,
  getRestaurantRankings,
  mapListDetailToMyList,
  mapListSummaryToMyList,
  mapRankingItems,
  searchRestaurants,
  setRepresentativeList,
  signupProfile,
  updateMyUser,
} from '../api/wagu';
import { AppTab } from '../components/BottomTabBar';
import { MOCK_DATA_ENABLED } from '../config/mockData';
import { FriendTabKey } from '../data/myFriends';
import { MY_FOLLOWER_USERS } from '../data/myFriends';
import { userFriendConnectionsByUserId } from '../data/userFriendConnections';
import { initialMyLists, MyList } from '../data/myLists';
import { myReviews } from '../data/myReviews';
import { localRankingEntries, nationalRankingEntries, RankingEntry } from '../data/rankings';
import { Restaurant, restaurants as initialRestaurantPool } from '../data/restaurants';
import { userReviewsByUserId } from '../data/userReviews';
import { AddRestaurantToListRatingScreen } from '../screens/AddRestaurantToListRatingScreen';
import { AddRestaurantToListSelectScreen } from '../screens/AddRestaurantToListSelectScreen';
import { AiChatScreen } from '../screens/AiChatScreen';
import { DeleteAccountScreen } from '../screens/DeleteAccountScreen';
import { EditNicknameScreen } from '../screens/EditNicknameScreen';
import { HomeScrollState, MainHomeScreen } from '../screens/MainHomeScreen';
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
import { OnboardingIntroScreen } from '../screens/OnboardingIntroScreen';
import { OnboardingLoginScreen } from '../screens/OnboardingLoginScreen';
import { RankingDetailScreen } from '../screens/RankingDetailScreen';
import { RankingTabScreen, RankingTabScrollState } from '../screens/RankingTabScreen';
import { RegistrationCompleteScreen } from '../screens/RegistrationCompleteScreen';
import { RestaurantDetailScreen } from '../screens/RestaurantDetailScreen';
import { SearchResultScreen } from '../screens/SearchResultScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SignupNicknameScreen } from '../screens/SignupNicknameScreen';
import { SignupProfileScreen } from '../screens/SignupProfileScreen';
import { TasteRatingScreen } from '../screens/TasteRatingScreen';
import { TasteListNameScreen } from '../screens/TasteListNameScreen';
import { TasteSelectionScreen } from '../screens/TasteSelectionScreen';
import { UserReviewsScreen } from '../screens/UserReviewsScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import { userProfiles } from '../data/userProfiles';

type SearchResultTabKey = 'restaurant' | 'user' | 'region' | 'photo';

type FlowScreen =
  | 'login'
  | 'signup-nickname'
  | 'signup-profile'
  | 'intro'
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
  | 'edit-nickname'
  | 'delete-account'
  | 'restaurant-detail'
  | 'user-profile';

type RankingDetailState = {
  sourceTab: AppTab;
  variant: 'local' | 'national';
} | null;

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

export function AppRoot() {
  const fallbackMyLists = MOCK_DATA_ENABLED ? initialMyLists : [];
  const fallbackFollowerCount = MOCK_DATA_ENABLED ? MY_FOLLOWER_USERS.length : 0;
  const visibleUserProfiles = MOCK_DATA_ENABLED ? userProfiles : [];
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
  const [tasteFlowSource, setTasteFlowSource] = useState<'onboarding' | 'my-lists'>(
    'onboarding',
  );
  const [screen, setScreen] = useState<FlowScreen>('login');
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [rankingDetail, setRankingDetail] = useState<RankingDetailState>(null);
  const [selectedRestaurants, setSelectedRestaurants] = useState<Restaurant[]>([]);
  const [tasteListName, setTasteListName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
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
  const [rankingEntries, setRankingEntries] = useState<{
    local: RankingEntry[];
    national: RankingEntry[];
  }>(fallbackRankingEntries);
  const [selectedMyListId, setSelectedMyListId] = useState<string | null>(null);
  const [selectedUserProfileId, setSelectedUserProfileId] = useState<string | null>(null);
  const [userProfileSource, setUserProfileSource] = useState<UserProfileSource>(null);
  const [userProfileHistory, setUserProfileHistory] = useState<UserProfileHistoryEntry[]>([]);
  const [loginProvider, setLoginProvider] = useState<LoginProvider>('kakao');
  const [session, setSession] = useState<{
    accessToken: string;
    refreshToken: string | null;
  } | null>(null);
  const [requiresProfileSetup, setRequiresProfileSetup] = useState(false);
  const [pendingNickname, setPendingNickname] = useState<string | null>(null);
  const [nickname, setNickname] = useState('먹부림');
  const [selectedRestaurantName, setSelectedRestaurantName] = useState('와이앤웍');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [birthDateLabel, setBirthDateLabel] = useState<string | null>(null);
  const [genderLabel, setGenderLabel] = useState<string | null>(null);
  const [restaurantDetailSource, setRestaurantDetailSource] =
    useState<RestaurantDetailSource>(null);
  const [addToListSource, setAddToListSource] = useState<'restaurant-detail' | 'map' | null>(
    null,
  );
  const [addToListRestaurantId, setAddToListRestaurantId] = useState<string | null>(null);
  const [addToListTargetListIds, setAddToListTargetListIds] = useState<string[]>([]);

  useEffect(() => {
    if (!session?.accessToken) {
      return;
    }

    let cancelled = false;

    const hydrateSession = async () => {
      try {
        const me = await getMyInfo(session.accessToken);

        if (cancelled) {
          return;
        }

        setNickname(me.nickname);
        setProfileImageUrl(me.profileImageUrl ?? null);
        setBirthDateLabel(formatBirthDate(me));
        setGenderLabel(formatGenderLabel(me.gender));

        const [followCountResult, listsResult, localRankingResult, nationalRankingResult] =
          await Promise.allSettled([
            getFollowCount(session.accessToken, me.id),
            getMyLists(session.accessToken),
            getRestaurantRankings(session.accessToken, { regionName: '용인', limit: 40 }),
            getRestaurantRankings(session.accessToken, { limit: 40 }),
          ]);

        if (cancelled) {
          return;
        }

        if (followCountResult.status === 'fulfilled') {
          setFollowerCount(followCountResult.value.followerCount);
        }

        if (localRankingResult.status === 'fulfilled' && nationalRankingResult.status === 'fulfilled') {
          setRankingEntries({
            local: mapRankingItems(localRankingResult.value.items),
            national: mapRankingItems(nationalRankingResult.value.items),
          });
        }

        if (listsResult.status === 'fulfilled') {
          const listDetails = await Promise.all(
            listsResult.value.map(async (summary, index) => {
              try {
                const detail = await getListDetail(session.accessToken, summary.id);
                return mapListDetailToMyList(detail, index);
              } catch {
                return mapListSummaryToMyList(summary, index);
              }
            }),
          );

          if (!cancelled) {
            setMyLists(listDetails);
          }
        }
      } catch {
        if (!cancelled && !MOCK_DATA_ENABLED) {
          setFollowerCount(0);
          setRankingEntries({
            local: [],
            national: [],
          });
          setMyLists([]);
        }
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
    const listDetails = await Promise.all(
      summaries.map(async (summary, index) => {
        try {
          const detail = await getListDetail(accessToken, summary.id);
          return mapListDetailToMyList(detail, index);
        } catch {
          return mapListSummaryToMyList(summary, index);
        }
      }),
    );

    setMyLists(listDetails);
    return listDetails;
  };

  const convertFiveStarToTenPoint = (value: number) => value * 2;

  const createTasteList = async (
    title: string,
    selected: Restaurant[],
    ratings: Record<string, Record<'맛' | '서비스' | '가성비', number>>,
  ) => {
    if (!session?.accessToken) {
      if (tasteFlowSource === 'my-lists' && title.trim()) {
        appendNewList(title.trim(), selected);
      }
      return;
    }

    const resolvedRestaurants = await Promise.all(
      selected.map(async (restaurant) => {
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
    const createdList = await createList(session.accessToken, {
      title: title.trim(),
      regionName,
      restaurants: selected.map((restaurant, index) => {
        const rating = ratings[restaurant.id];
        const resolvedRestaurant = resolvedRestaurants[index];

        return {
          restaurantId: resolvedRestaurant.id,
          tasteScore: convertFiveStarToTenPoint(rating['맛']),
          valueScore: convertFiveStarToTenPoint(rating['가성비']),
          moodScore: convertFiveStarToTenPoint(rating['서비스']),
        };
      }),
    });

    if (existingListCount === 0) {
      await setRepresentativeList(session.accessToken, createdList.id);
    }

    await refreshMyLists(session.accessToken);
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

  const openAddRestaurantToListFlow = (
    restaurantName: string,
    source: 'restaurant-detail' | 'map',
  ) => {
    const restaurant = resolveRestaurant(restaurantName);

    if (!restaurant) {
      return;
    }

    setAddToListSource(source);
    setAddToListRestaurantId(restaurant.id);
    setAddToListTargetListIds([]);
    setScreen('add-to-list-select');
  };

  const handleAddRestaurantToListComplete = (ratings: {
    taste: number;
    service: number;
    value: number;
  }) => {
    const restaurant = initialRestaurantPool.find((item) => item.id === addToListRestaurantId);

    if (!restaurant || addToListTargetListIds.length === 0) {
      return;
    }

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
              id: restaurant.id,
              name: restaurant.shortName || restaurant.name,
              address: restaurant.address ?? '',
              ratings,
            },
          ],
        };
      }),
    );

    setCompletionSource('add-to-list');
    setScreen('complete');
  };

  const openRankingDetail = (variant: 'local' | 'national') => {
    setRankingDetail({
      sourceTab: activeTab,
      variant,
    });
  };

  const handleBackFromRankingDetail = () => {
    if (!rankingDetail) {
      return;
    }

    setActiveTab(rankingDetail.sourceTab);
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
  ) => {
    setSelectedRestaurantName(restaurantName);
    setRestaurantDetailSource(source);
    setScreen('restaurant-detail');
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

    setActiveTab(restaurantDetailSource.detail.sourceTab);
    setRankingDetail(restaurantDetailSource.detail);
    setScreen('tabs');
  };

  const handleLoginSuccess = async (
    provider: LoginProvider,
    nextSession: {
      accessToken: string;
      refreshToken: string | null;
    },
  ) => {
    setLoginProvider(provider);
    setSession(nextSession);
    setActiveTab('home');

    try {
      const me = await getMyInfo(nextSession.accessToken);
      const lists = await getMyLists(nextSession.accessToken);

      setNickname(me.nickname);
      setProfileImageUrl(me.profileImageUrl ?? null);
      setBirthDateLabel(formatBirthDate(me));
      setGenderLabel(formatGenderLabel(me.gender));

      const needsSignupProfile =
        !me.birthYear || !me.birthMonth || !me.birthDay || !me.gender;

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
      setRequiresProfileSetup(true);
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

    setScreen(requiresProfileSetup ? 'signup-profile' : 'intro');
  };

  const handleSignupProfileSubmit = async (profile: {
    birthDay: number;
    birthMonth: number;
    birthYear: number;
    gender: 'FEMALE' | 'MALE';
  }) => {
    if (!session?.accessToken) {
      throw new Error('로그인 정보가 없어서 프로필을 저장할 수 없어요.');
    }

    if (pendingNickname) {
      try {
        await updateMyUser(session.accessToken, { nickname: pendingNickname });
        setPendingNickname(null);
      } catch {
        // Proceed with profile save even if nickname sync needs to be retried later.
      }
    }

    await signupProfile(session.accessToken, profile);
    setBirthDateLabel(`${profile.birthYear}년 ${profile.birthMonth}월 ${profile.birthDay}일`);
    setGenderLabel(profile.gender === 'MALE' ? '남성' : '여성');
    setRequiresProfileSetup(false);
    const lists = await getMyLists(session.accessToken);
    setTasteFlowSource('onboarding');
    setScreen(lists.length === 0 ? 'intro' : 'tabs');
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      {screen === 'login' ? (
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
      ) : screen === 'intro' ? (
        <OnboardingIntroScreen
          onPressNext={() => {
            setTasteFlowSource('onboarding');
            setScreen('taste');
          }}
          userName={nickname}
        />
      ) : screen === 'taste' ? (
        <TasteSelectionScreen
          accessToken={session?.accessToken}
          onBack={() => setScreen(tasteFlowSource === 'my-lists' ? 'my-lists' : 'intro')}
          onConfirm={(restaurants) => {
            setSelectedRestaurants(restaurants);
            setScreen('taste-list-name');
          }}
        />
      ) : screen === 'taste-list-name' ? (
        <TasteListNameScreen
          nickname={nickname}
          mode={tasteFlowSource === 'my-lists' ? 'new-list' : 'first-list'}
          onBack={() => setScreen('taste')}
          onSubmit={(name) => {
            setTasteListName(name);
            setScreen('rating');
          }}
        />
      ) : screen === 'rating' ? (
        <TasteRatingScreen
          listName={tasteListName}
          restaurants={selectedRestaurants}
          onBack={() => setScreen('taste-list-name')}
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
          restaurant={
            initialRestaurantPool.find((item) => item.id === addToListRestaurantId) ??
            initialRestaurantPool[0]
          }
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
            restaurant={
              initialRestaurantPool.find((item) => item.id === addToListRestaurantId) ??
              initialRestaurantPool[0]
            }
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
              setAddToListRestaurantId(null);
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
        <NewsScreen onBack={() => setScreen('tabs')} />
      ) : screen === 'search' ? (
        <SearchScreen
          initialQuery={searchQuery}
          onClose={() => setScreen('tabs')}
          onSearch={(query) => {
            setSearchQuery(query);
            setSearchResultTab('restaurant');
            setScreen('search-result');
          }}
        />
      ) : screen === 'search-result' ? (
        <SearchResultScreen
          accessToken={session?.accessToken}
          query={searchQuery}
          initialTab={searchResultTab}
          onBack={() => setScreen('search')}
          onChangeTab={setSearchResultTab}
          onOpenRestaurantDetail={(restaurantName) =>
            openRestaurantDetail(restaurantName, { type: 'search-result' })
          }
          onOpenUserProfile={(userId) => {
            setUserProfileSource({ type: 'search-result' });
            setSelectedUserProfileId(userId);
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
          restaurantName={selectedRestaurantName}
          onBack={handleBackFromRestaurantDetail}
          favoriteColor={getFavoriteColor(selectedRestaurantName)}
          onAddToList={(restaurantName) =>
            openAddRestaurantToListFlow(restaurantName, 'restaurant-detail')
          }
          onOpenUserProfile={openUserProfileFromRestaurantDetail}
        />
      ) : screen === 'settings' ? (
        <SettingsScreen
          onBack={() => setScreen('tabs')}
          onOpenMyInfo={() => setScreen('my-info')}
          onOpenDeleteAccount={() => setScreen('delete-account')}
        />
      ) : screen === 'my-info' ? (
        <MyInfoScreen
          onBack={() => setScreen('settings')}
          onOpenEditNickname={() => setScreen('edit-nickname')}
          loginProvider={loginProvider}
          profileImageUrl={profileImageUrl}
          genderLabel={genderLabel}
          birthDateLabel={birthDateLabel}
          nickname={nickname}
        />
      ) : screen === 'my-friends' ? (
          <MyFriendsScreen
            initialTab={myFriendsInitialTab}
          onBack={() => setScreen('tabs')}
          onChangeTab={setMyFriendsInitialTab}
          onOpenUserProfile={(userId) => {
            setUserProfileSource({ type: 'my-friends', tab: myFriendsInitialTab });
            setSelectedUserProfileId(userId);
            setScreen('user-profile');
          }}
        />
      ) : screen === 'user-friends' && selectedUserProfileId ? (
        <MyFriendsScreen
          initialTab={myFriendsInitialTab}
          title={`${
            visibleUserProfiles.find((item) => item.id === selectedUserProfileId)?.nickname ?? ''
          }님의 밥친구`}
          followingUsersData={
            visibleUserFriendConnectionsByUserId[selectedUserProfileId]?.following ?? []
          }
          followerUsersData={
            visibleUserFriendConnectionsByUserId[selectedUserProfileId]?.followers ?? []
          }
            onBack={() => setScreen('user-profile')}
            onChangeTab={setMyFriendsInitialTab}
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
            setScreen('taste');
          }}
          onOpenList={(listId) => {
            setSelectedMyListId(listId);
            setScreen('my-list-detail');
          }}
        />
      ) : screen === 'my-list-detail' && selectedMyListId ? (
        <MyListDetailScreen
          list={myLists.find((item) => item.id === selectedMyListId) ?? myLists[0]}
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
        />
      ) : screen === 'my-list-place-edit' && selectedMyListId ? (
        <MyListPlaceEditScreen
          list={myLists.find((item) => item.id === selectedMyListId) ?? myLists[0]}
          lists={myLists}
          onBack={() => setScreen('my-list-detail')}
          onChangeLists={setMyLists}
        />
      ) : screen === 'my-reviews' ? (
        <MyReviewsScreen
          onBack={() => setScreen('tabs')}
          onOpenRestaurantDetail={(restaurantName) =>
            openRestaurantDetail(restaurantName, { type: 'my-reviews' })
          }
        />
      ) : screen === 'user-reviews' && selectedUserProfileId ? (
        <UserReviewsScreen
          title={`${
            visibleUserProfiles.find((item) => item.id === selectedUserProfileId)?.nickname ?? ''
          }님의 리뷰`}
          reviews={visibleUserReviewsByUserId[selectedUserProfileId] ?? []}
          onBack={() => setScreen('user-profile')}
          onOpenRestaurantDetail={(restaurantName) =>
            openRestaurantDetail(restaurantName, {
              type: 'user-reviews',
              userId: selectedUserProfileId,
            })
          }
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
        <DeleteAccountScreen onBack={() => setScreen('settings')} />
      ) : screen === 'user-profile' && selectedUserProfileId ? (
        <UserProfileScreen
          profile={
            visibleUserProfiles.find((item) => item.id === selectedUserProfileId) ??
            visibleUserProfiles[0]
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
          onOpenReviews={() => setScreen('user-reviews')}
          onOpenRestaurantDetail={(restaurantName) =>
            openRestaurantDetail(restaurantName, {
              type: 'user-profile',
              userId: selectedUserProfileId,
            })
          }
        />
      ) : rankingDetail ? (
        <RankingDetailScreen
          onBack={handleBackFromRankingDetail}
          items={
            rankingDetail.variant === 'local'
              ? rankingEntries.local.slice(0, 40)
              : rankingEntries.national.slice(0, 40)
          }
          onOpenRestaurantDetail={(restaurantName) =>
            openRestaurantDetail(restaurantName, {
              type: 'ranking-detail',
              detail: rankingDetail,
            })
          }
          variant={rankingDetail.variant}
        />
      ) : activeTab === 'home' ? (
        <MainHomeScreen
          initialScrollState={homeScrollState}
          localRankingItems={rankingEntries.local}
          nationalRankingItems={rankingEntries.national}
          onOpenRestaurantDetail={(restaurantName) =>
            openRestaurantDetail(restaurantName, { type: 'tabs', tab: 'home' })
          }
          onOpenUserProfile={(userId) => {
            setUserProfileSource({ type: 'home' });
            setSelectedUserProfileId(userId);
            setScreen('user-profile');
          }}
          onPressAi={() => setScreen('ai-chat')}
          onPressNews={() => setScreen('news')}
          onPressLocalRanking={() => openRankingDetail('local')}
          onPressNationalRanking={() => openRankingDetail('national')}
          onPressSearch={() => setScreen('search')}
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
          initialScrollState={myPageScrollState}
          nickname={nickname}
          myLists={myLists}
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
          onScrollStateChange={(nextState) =>
            setMyPageScrollState((current) => ({ ...current, ...nextState }))
          }
          onOpenSettings={() => setScreen('settings')}
          onSelectTab={handleSelectTab}
          reviewCount={MOCK_DATA_ENABLED ? myReviews.length : 0}
          restoreAnimated={myPageRestoreAnimated}
          restoreScrollKey={myPageRestoreKey}
        />
      )}
    </SafeAreaProvider>
  );
}
