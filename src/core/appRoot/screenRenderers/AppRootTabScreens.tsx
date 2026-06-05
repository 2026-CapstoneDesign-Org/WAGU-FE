import { MainHomeScreen } from '../../../screens/home/MainHomeScreen';
import type { HomeProfileCardItem, HomeRestaurantCardItem, HomeScrollState } from '../../../screens/home/MainHomeScreen';
import { MapScreen } from '../../../screens/map/MapScreen';
import { MyPageScreen } from '../../../screens/profile/MyPageScreen';
import type { MyPageScrollState } from '../../../screens/profile/MyPageScreen';
import { RankingTabScreen } from '../../../screens/ranking/RankingTabScreen';
import type { RankingTabScrollState } from '../../../screens/ranking/RankingTabScreen';
import type { MyList } from '../../../types/myLists';
import type { RankingEntry } from '../../../types/rankings';
import type { Restaurant } from '../../../types/restaurants';
import type { AppTab } from '../../../components/BottomTabBar';

type AppRootTabScreensProps = {
  accessToken?: string;
  activeTab: AppTab;
  followerCount: number;
  getFavoriteColor: (restaurantName: string) => string;
  hasUnreadNews: boolean;
  homeRestoreAnimated: boolean;
  homeRestoreKey: number;
  homeScrollState: HomeScrollState;
  localRankingRegion: string;
  mapListRestaurants: Restaurant[];
  mapSearchQuery: string;
  myHonorPeriod?: string;
  myHonorTitle?: string;
  myListLikeCountById: Record<string, number>;
  myListLikePendingIds: string[];
  myListLikeStateById: Record<string, boolean>;
  myLists: MyList[];
  myPageRestoreAnimated: boolean;
  myPageRestoreKey: number;
  myPageScrollState: MyPageScrollState;
  myReliabilityGrade?: string;
  myReviewItemsLength: number;
  nickname: string;
  rankingEntries: {
    local: RankingEntry[];
    national: RankingEntry[];
  };
  rankingRestoreAnimated: boolean;
  rankingRestoreKey: number;
  rankingScrollState: RankingTabScrollState;
  recommendedMealFriendItems: HomeProfileCardItem[];
  recommendedRestaurantItems: HomeRestaurantCardItem[];
  onChangeHomeScrollState: (nextState: Partial<HomeScrollState>) => void;
  onChangeMyPageScrollState: (nextState: Partial<MyPageScrollState>) => void;
  onChangeRankingScrollState: (nextState: Partial<RankingTabScrollState>) => void;
  onClearMapSearch: () => void;
  onOpenAddRestaurantFromMap: (restaurant: Restaurant) => void;
  onOpenAiChat: () => void;
  onOpenHomeUserProfile: (userId: string) => void;
  onOpenLocalRanking: () => void;
  onOpenMapSearch: () => void;
  onOpenMyFollowers: () => void;
  onOpenMyFriends: () => void;
  onOpenMyLists: () => void;
  onOpenMyReviews: () => void;
  onOpenNationalRanking: () => void;
  onOpenNews: () => void;
  onOpenRepresentativeList: (listId: string) => void;
  onOpenRestaurantDetail: (restaurantName: string, sourceTab: AppTab, restaurantId?: number) => void;
  onOpenSearch: () => void;
  onOpenWorldCup: () => void;
  onOpenSnailRace: () => void;
  onOpenLadderGame: () => void;
  onOpenReliabilityGuide: (grade?: string) => void;
  onOpenSettings: () => void;
  onSelectTab: (tab: AppTab) => void;
  onToggleRepresentativeLike: () => void;
};

export function AppRootTabScreens({
  accessToken,
  activeTab,
  followerCount,
  getFavoriteColor,
  hasUnreadNews,
  homeRestoreAnimated,
  homeRestoreKey,
  homeScrollState,
  localRankingRegion,
  mapListRestaurants,
  mapSearchQuery,
  myHonorPeriod,
  myHonorTitle,
  myListLikeCountById,
  myListLikePendingIds,
  myListLikeStateById,
  myLists,
  myPageRestoreAnimated,
  myPageRestoreKey,
  myPageScrollState,
  myReliabilityGrade,
  myReviewItemsLength,
  nickname,
  rankingEntries,
  rankingRestoreAnimated,
  rankingRestoreKey,
  rankingScrollState,
  recommendedMealFriendItems,
  recommendedRestaurantItems,
  onChangeHomeScrollState,
  onChangeMyPageScrollState,
  onChangeRankingScrollState,
  onClearMapSearch,
  onOpenAddRestaurantFromMap,
  onOpenAiChat,
  onOpenHomeUserProfile,
  onOpenLadderGame,
  onOpenLocalRanking,
  onOpenMapSearch,
  onOpenMyFollowers,
  onOpenMyFriends,
  onOpenMyLists,
  onOpenMyReviews,
  onOpenNationalRanking,
  onOpenNews,
  onOpenRepresentativeList,
  onOpenRestaurantDetail,
  onOpenReliabilityGuide,
  onOpenSearch,
  onOpenSettings,
  onOpenSnailRace,
  onOpenWorldCup,
  onSelectTab,
  onToggleRepresentativeLike,
}: AppRootTabScreensProps) {
  if (activeTab === 'home') {
    return (
      <MainHomeScreen
        featuredRestaurantItems={recommendedRestaurantItems}
        hasUnreadNews={hasUnreadNews}
        initialScrollState={homeScrollState}
        localRankingItems={rankingEntries.local}
        localRankingRegion={localRankingRegion}
        mealFriendItems={recommendedMealFriendItems}
        nationalRankingItems={rankingEntries.national}
        onOpenRestaurantDetail={(restaurantName, restaurantId) =>
          onOpenRestaurantDetail(restaurantName, 'home', restaurantId)
        }
        onOpenUserProfile={onOpenHomeUserProfile}
        onPressAi={onOpenAiChat}
        onPressLadderGame={onOpenLadderGame}
        onPressSnailRace={onOpenSnailRace}
        onPressWorldCup={onOpenWorldCup}
        onPressNews={onOpenNews}
        onPressLocalRanking={onOpenLocalRanking}
        onPressNationalRanking={onOpenNationalRanking}
        onPressSearch={onOpenSearch}
        onScrollStateChange={onChangeHomeScrollState}
        onSelectTab={onSelectTab}
        restoreAnimated={homeRestoreAnimated}
        restoreScrollKey={homeRestoreKey}
      />
    );
  }

  if (activeTab === 'ranking') {
    return (
      <RankingTabScreen
        initialScrollState={rankingScrollState}
        localRankingItems={rankingEntries.local}
        nationalRankingItems={rankingEntries.national}
        onOpenRestaurantDetail={(restaurantName) =>
          onOpenRestaurantDetail(restaurantName, 'ranking')
        }
        onPressLocalRanking={onOpenLocalRanking}
        onPressNationalRanking={onOpenNationalRanking}
        onScrollStateChange={onChangeRankingScrollState}
        onSelectTab={onSelectTab}
        restoreAnimated={rankingRestoreAnimated}
        restoreScrollKey={rankingRestoreKey}
      />
    );
  }

  if (activeTab === 'map') {
    return (
      <MapScreen
        accessToken={accessToken}
        getFavoriteColor={getFavoriteColor}
        mapRestaurantsData={mapListRestaurants}
        onAddToList={onOpenAddRestaurantFromMap}
        onClearSearch={onClearMapSearch}
        onOpenRestaurantDetail={(restaurantName) =>
          onOpenRestaurantDetail(restaurantName, 'map')
        }
        onPressSearchBar={onOpenMapSearch}
        onSelectTab={onSelectTab}
        searchQuery={mapSearchQuery}
      />
    );
  }

  const representativeList = myLists.find((item) => item.isRepresentative) ?? myLists[0];

  return (
    <MyPageScreen
      followerCount={followerCount}
      honorPeriod={myHonorPeriod}
      honorTitle={myHonorTitle}
      initialScrollState={myPageScrollState}
      myLists={myLists}
      nickname={nickname}
      onOpenMyFollowers={onOpenMyFollowers}
      onOpenMyFriends={onOpenMyFriends}
      onOpenMyLists={onOpenMyLists}
      onOpenMyReviews={onOpenMyReviews}
      onOpenRepresentativeList={onOpenRepresentativeList}
      onOpenReliabilityGuide={() => onOpenReliabilityGuide(myReliabilityGrade)}
      onOpenRestaurantDetail={(restaurantName) =>
        onOpenRestaurantDetail(restaurantName, 'my')
      }
      onOpenSettings={onOpenSettings}
      onScrollStateChange={onChangeMyPageScrollState}
      onSelectTab={onSelectTab}
      onToggleRepresentativeLike={onToggleRepresentativeLike}
      reliabilityGrade={myReliabilityGrade}
      representativeIsLikePending={
        representativeList ? myListLikePendingIds.includes(representativeList.id) : false
      }
      representativeIsLiked={
        representativeList ? myListLikeStateById[representativeList.id] ?? false : false
      }
      representativeLikeCount={
        representativeList ? myListLikeCountById[representativeList.id] ?? 0 : undefined
      }
      restoreAnimated={myPageRestoreAnimated}
      restoreScrollKey={myPageRestoreKey}
      reviewCount={myReviewItemsLength}
    />
  );
}
