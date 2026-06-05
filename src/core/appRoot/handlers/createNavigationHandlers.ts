import { Alert } from 'react-native';
import type { Dispatch, SetStateAction } from 'react';

import type { AppTab } from '../../../components/BottomTabBar';
import { restaurants as initialRestaurantPool } from '../../../fixtures/restaurants';
import type { MyList } from '../../../types/myLists';
import type { RankingEntry } from '../../../types/rankings';
import type { Restaurant } from '../../../types/restaurants';
import type { WorldCupCategory, WorldCupEntry } from '../../../types/worldCup';
import { buildLadderSetup } from '../../../utils/ladderGame';
import type { AiReservationDraft, AiReservationResult } from '../../../types/aiReservation';
import type {
  FlowScreen,
  RankingDetailState,
  ReliabilityGuideSource,
  RestaurantDetailSource,
  UserProfileHistoryEntry,
  UserProfileSource,
} from '../types';

type CreateNavigationHandlersDeps = {
  activeTab: AppTab;
  addToListRestaurantId: string | null;
  addToListRestaurantName: string | null;
  addToListRestaurantSnapshot: Restaurant | null;
  localRankingRegion: string;
  myLists: MyList[];
  rankingDetail: RankingDetailState;
  rankingEntries: {
    local: RankingEntry[];
    national: RankingEntry[];
  };
  recommendedUserProfiles: Array<{ id: string; nickname: string }>;
  remoteUserProfiles: Array<{ id: string; nickname: string }>;
  restaurantDetailSource: RestaurantDetailSource;
  searchResultUserProfiles: Array<{ id: string; nickname: string }>;
  selectedUserProfileId: string | null;
  sessionAccessToken?: string;
  userProfileSource: UserProfileSource;
  visibleUserProfiles: Array<{ id: string; nickname: string }>;
  setActiveTab: (tab: AppTab) => void;
  setAddToListRestaurantId: (value: string | null) => void;
  setAddToListRestaurantName: (value: string | null) => void;
  setAddToListRestaurantSnapshot: (restaurant: Restaurant | null) => void;
  setAddToListSource: (source: 'restaurant-detail' | 'map' | null) => void;
  setAddToListTargetListIds: (ids: string[]) => void;
  setAiReservationDraft: Dispatch<SetStateAction<AiReservationDraft | null>>;
  setAiReservationRestaurant: (restaurant: {
    address?: string;
    category?: string;
    id: number;
    name: string;
    phone?: string;
  } | null) => void;
  setAiReservationResult: Dispatch<SetStateAction<AiReservationResult | null>>;
  setHomeRestoreAnimated: (value: boolean) => void;
  setHomeRestoreKey: (updater: (current: number) => number) => void;
  setLadderPlayerCount: (count: number) => void;
  setLadderSetup: (setup: ReturnType<typeof buildLadderSetup>) => void;
  setMyPageRestoreAnimated: (value: boolean) => void;
  setMyPageRestoreKey: (updater: (current: number) => number) => void;
  setRankingDetail: (detail: RankingDetailState) => void;
  setRankingRestoreAnimated: (value: boolean) => void;
  setRankingRestoreKey: (updater: (current: number) => number) => void;
  setReliabilityGuideGrade: (grade: string | null) => void;
  setReliabilityGuideSource: (source: ReliabilityGuideSource) => void;
  setRestaurantDetailInitialTab: (tab: 'home' | 'review') => void;
  setRestaurantDetailSource: (source: RestaurantDetailSource) => void;
  setScreen: (screen: FlowScreen | ((current: FlowScreen) => FlowScreen)) => void;
  setSelectedMyListId: (id: string | null) => void;
  setSelectedRestaurantId: Dispatch<SetStateAction<number | undefined>>;
  setSelectedRestaurantName: (name: string) => void;
  setSelectedUserProfileId: (id: string) => void;
  setSnailRaceCount: (count: number) => void;
  setUserProfileHistory: (
    updater: (current: UserProfileHistoryEntry[]) => UserProfileHistoryEntry[],
  ) => void;
  setUserProfileSource: (source: UserProfileSource) => void;
  setWorldCupCategory: (category: WorldCupCategory) => void;
  setWorldCupWinner: (winner: WorldCupEntry | null) => void;
  setWriteReviewInitialContent: (content: string) => void;
  setWriteReviewMode: (mode: 'create' | 'edit') => void;
  setWriteReviewRestaurantId: Dispatch<SetStateAction<number | null>>;
  setWriteReviewRestaurantName: (name: string) => void;
  setEditingReviewId: (id: number | null) => void;
};

export function createNavigationHandlers({
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
  sessionAccessToken,
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
  setEditingReviewId,
}: CreateNavigationHandlersDeps) {
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

    return nextList;
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
    if (!sessionAccessToken) {
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

  return {
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
  };
}
