import type { ApiReservation } from '../../../api/wagu';
import { AiReservationFormScreen } from '../../../screens/ai/AiReservationFormScreen';
import { AiReservationPendingScreen } from '../../../screens/ai/AiReservationPendingScreen';
import { AiReservationResultScreen } from '../../../screens/ai/AiReservationResultScreen';
import { AiChatScreen } from '../../../screens/ai/AiChatScreen';
import { LadderGamePlayScreen } from '../../../screens/games/LadderGamePlayScreen';
import { LadderGameStartScreen } from '../../../screens/games/LadderGameStartScreen';
import { SnailRacePlayScreen } from '../../../screens/games/SnailRacePlayScreen';
import { SnailRaceStartScreen } from '../../../screens/games/SnailRaceStartScreen';
import { WorldCupBattleScreen } from '../../../screens/games/WorldCupBattleScreen';
import { WorldCupResultScreen } from '../../../screens/games/WorldCupResultScreen';
import { WorldCupStartScreen } from '../../../screens/games/WorldCupStartScreen';
import { NewsScreen } from '../../../screens/home/NewsScreen';
import { MapSearchScreen } from '../../../screens/map/MapSearchScreen';
import { ReliabilityGuideScreen } from '../../../screens/profile/ReliabilityGuideScreen';
import { RestaurantDetailScreen } from '../../../screens/restaurant/RestaurantDetailScreen';
import { SearchResultScreen } from '../../../screens/search/SearchResultScreen';
import { SearchScreen } from '../../../screens/search/SearchScreen';
import type { WriteReviewDraft } from '../../../screens/reviews/WriteReviewScreen';
import { WriteReviewScreen } from '../../../screens/reviews/WriteReviewScreen';
import type { FlowScreen } from '../types';
import type { AiReservationDraft, AiReservationResult } from '../../../types/aiReservation';
import type { LadderGameSetup } from '../../../types/ladderGame';
import type { Restaurant } from '../../../types/restaurants';
import type { WorldCupCategory, WorldCupEntry } from '../../../types/worldCup';

type AppRootExperienceScreensProps = {
  accessToken?: string;
  aiReservationDraft: AiReservationDraft | null;
  aiReservationRestaurant: {
    id: number;
    imageUri?: string;
    name: string;
  } | null;
  aiReservationResult: AiReservationResult | null;
  getFavoriteColor: (restaurantName: string) => string;
  handleBackFromRestaurantDetail: () => void;
  handleConfirmLadderCount: (count: number) => void;
  handleConfirmSnailRaceCount: (count: number) => void;
  handleStartWorldCup: (category: WorldCupCategory) => void;
  handleSubmitRestaurantReview: (draft: WriteReviewDraft) => Promise<void> | void;
  homeRestoreAfterReturn: () => void;
  ladderPlayerCount: number;
  ladderSetup: LadderGameSetup;
  mapSearchQuery: string;
  myUserId: number | null;
  myUserFollowingIds: number[];
  onAiReservationError: (message: string) => void;
  onBackFromAiChat: () => void;
  onBackFromReliabilityGuide: () => void;
  onBackFromWriteReview: () => void;
  onBackToRestaurantDetail: () => void;
  onChangeLadderPlayerCount: (count: number) => void;
  onChangeSnailRaceCount: (count: number) => void;
  onClearSearchBar: () => void;
  onCompleteReservation: (reservation: ApiReservation) => void;
  onGoToMapSearchResult: (query: string) => void;
  onMapSearchClose: () => void;
  onNewsBack: () => Promise<void>;
  onOpenAiReservation: (restaurant: Restaurant) => void;
  onOpenAddToListFromRestaurantDetail: (restaurant: Restaurant) => void;
  onOpenEditReview: (
    reviewId: number,
    restaurantName: string,
    restaurantId?: number,
    content?: string,
  ) => void;
  onOpenRegionRanking: (regionName?: string, regionDisplayName?: string) => void;
  onOpenRestaurantDetailFromSearch: (restaurantName: string, restaurantId?: number) => void;
  onOpenSearch: (query: string) => void;
  onOpenSearchResultUserProfile: (user: {
    id: string;
    nickname: string;
    profileImageUrl?: string;
    reliabilityGrade?: string;
  }) => void;
  onOpenUserProfileFromRestaurantDetail: (authorName: string) => void;
  onOpenWriteReview: (restaurantName: string, restaurantId?: number) => void;
  onReportReview: (reviewId: string, reason: string) => void;
  onReservationDraftChange: (draft: AiReservationDraft | null) => void;
  onRetryReservation: () => void;
  onSearchResultBack: () => void;
  onSearchResultQueryChange: (query: string) => void;
  onSearchResultTabChange: (tab: 'restaurant' | 'user' | 'region') => void;
  onSearchScreenClose: () => void;
  onSearchScreenOpenFromResult: () => void;
  onSetAiReservationResult: (result: AiReservationResult | null) => void;
  onSetScreen: (screen: FlowScreen) => void;
  onSetWorldCupWinner: (winner: WorldCupEntry | null) => void;
  onSyncReviewAuthorFollowChange: (userId: string, nextIsFollowing: boolean) => void;
  query: string;
  reliabilityGuideGrade: string | null;
  restaurantDetailInitialTab: 'home' | 'review';
  screen: FlowScreen;
  searchResultTab: 'restaurant' | 'user' | 'region';
  searchScreenInitialQuery: string;
  selectedRestaurantId?: number;
  selectedRestaurantName: string;
  sessionAccessToken?: string;
  setWorldCupWinnerAndOpenResult: (winner: WorldCupEntry) => void;
  snailRaceCount: number;
  worldCupCategory: WorldCupCategory;
  worldCupWinner: WorldCupEntry | null;
  writeReviewInitialContent: string;
  writeReviewMode: 'create' | 'edit';
  writeReviewRestaurantName: string;
};

export function AppRootExperienceScreens({
  accessToken,
  aiReservationDraft,
  aiReservationRestaurant,
  aiReservationResult,
  getFavoriteColor,
  handleBackFromRestaurantDetail,
  handleConfirmLadderCount,
  handleConfirmSnailRaceCount,
  handleStartWorldCup,
  handleSubmitRestaurantReview,
  homeRestoreAfterReturn,
  ladderPlayerCount,
  ladderSetup,
  mapSearchQuery,
  myUserId,
  myUserFollowingIds,
  onAiReservationError,
  onBackFromAiChat,
  onBackFromReliabilityGuide,
  onBackFromWriteReview,
  onBackToRestaurantDetail,
  onChangeLadderPlayerCount,
  onChangeSnailRaceCount,
  onClearSearchBar,
  onCompleteReservation,
  onGoToMapSearchResult,
  onMapSearchClose,
  onNewsBack,
  onOpenAiReservation,
  onOpenAddToListFromRestaurantDetail,
  onOpenEditReview,
  onOpenRegionRanking,
  onOpenRestaurantDetailFromSearch,
  onOpenSearch,
  onOpenSearchResultUserProfile,
  onOpenUserProfileFromRestaurantDetail,
  onOpenWriteReview,
  onReportReview,
  onReservationDraftChange,
  onRetryReservation,
  onSearchResultBack,
  onSearchResultQueryChange,
  onSearchResultTabChange,
  onSearchScreenClose,
  onSearchScreenOpenFromResult,
  onSetAiReservationResult,
  onSetScreen,
  onSetWorldCupWinner,
  onSyncReviewAuthorFollowChange,
  query,
  reliabilityGuideGrade,
  restaurantDetailInitialTab,
  screen,
  searchResultTab,
  searchScreenInitialQuery,
  selectedRestaurantId,
  selectedRestaurantName,
  sessionAccessToken,
  setWorldCupWinnerAndOpenResult,
  snailRaceCount,
  worldCupCategory,
  worldCupWinner,
  writeReviewInitialContent,
  writeReviewMode,
  writeReviewRestaurantName,
}: AppRootExperienceScreensProps) {
  if (screen === 'ai-chat') {
    return <AiChatScreen onBack={onBackFromAiChat} />;
  }

  if (screen === 'news') {
    return <NewsScreen accessToken={sessionAccessToken} onBack={() => void onNewsBack()} />;
  }

  if (screen === 'search') {
    return (
      <SearchScreen
        initialQuery={searchScreenInitialQuery}
        onClose={onSearchScreenClose}
        onSearch={onOpenSearch}
      />
    );
  }

  if (screen === 'search-result') {
    return (
      <SearchResultScreen
        accessToken={sessionAccessToken}
        initialTab={searchResultTab}
        myUserId={myUserId}
        onBack={onSearchResultBack}
        onChangeTab={onSearchResultTabChange}
        onClearSearchBar={onClearSearchBar}
        onOpenRegionRanking={onOpenRegionRanking}
        onOpenRestaurantDetail={onOpenRestaurantDetailFromSearch}
        onOpenUserProfile={onOpenSearchResultUserProfile}
        onPressSearchBar={onSearchScreenOpenFromResult}
        onSearch={onSearchResultQueryChange}
        query={query}
      />
    );
  }

  if (screen === 'map-search') {
    return (
      <MapSearchScreen
        initialQuery={mapSearchQuery}
        onClose={onMapSearchClose}
        onSearch={onGoToMapSearchResult}
      />
    );
  }

  if (screen === 'restaurant-detail') {
    return (
      <RestaurantDetailScreen
        accessToken={sessionAccessToken}
        currentUserId={myUserId}
        favoriteColor={getFavoriteColor(selectedRestaurantName)}
        followingUserIds={myUserFollowingIds}
        initialTab={restaurantDetailInitialTab}
        onAddToList={onOpenAddToListFromRestaurantDetail}
        onBack={handleBackFromRestaurantDetail}
        onEditReview={onOpenEditReview}
        onOpenAiReservation={onOpenAiReservation}
        onOpenUserProfile={onOpenUserProfileFromRestaurantDetail}
        onOpenWriteReview={onOpenWriteReview}
        onReportReview={onReportReview}
        onReviewAuthorFollowChange={onSyncReviewAuthorFollowChange}
        restaurantId={selectedRestaurantId}
        restaurantName={selectedRestaurantName}
      />
    );
  }

  if (screen === 'ai-reservation-form' && aiReservationRestaurant) {
    return (
      <AiReservationFormScreen
        initialDraft={aiReservationDraft}
        onBack={onBackToRestaurantDetail}
        onSubmit={(draft) => {
          onReservationDraftChange(draft);
          onSetAiReservationResult(null);
          onSetScreen('ai-reservation-pending');
        }}
        restaurant={aiReservationRestaurant}
      />
    );
  }

  if (
    screen === 'ai-reservation-pending' &&
    aiReservationDraft &&
    aiReservationRestaurant &&
    accessToken
  ) {
    return (
      <AiReservationPendingScreen
        accessToken={accessToken}
        draft={aiReservationDraft}
        onComplete={onCompleteReservation}
        onError={onAiReservationError}
        restaurantId={aiReservationRestaurant.id}
      />
    );
  }

  if (screen === 'ai-reservation-result' && aiReservationDraft && aiReservationResult) {
    return (
      <AiReservationResultScreen
        draft={aiReservationDraft}
        onBack={onBackToRestaurantDetail}
        onGoHome={homeRestoreAfterReturn}
        onRetry={onRetryReservation}
        result={aiReservationResult}
      />
    );
  }

  if (screen === 'ladder-start') {
    return (
      <LadderGameStartScreen
        initialCount={ladderPlayerCount}
        onBack={homeRestoreAfterReturn}
        onChangeCount={onChangeLadderPlayerCount}
        onConfirm={handleConfirmLadderCount}
      />
    );
  }

  if (screen === 'ladder-play') {
    return <LadderGamePlayScreen onBack={() => onSetScreen('ladder-start')} setup={ladderSetup} />;
  }

  if (screen === 'snail-race-start') {
    return (
      <SnailRaceStartScreen
        initialCount={snailRaceCount}
        onBack={homeRestoreAfterReturn}
        onChangeCount={onChangeSnailRaceCount}
        onConfirm={handleConfirmSnailRaceCount}
      />
    );
  }

  if (screen === 'snail-race-play') {
    return (
      <SnailRacePlayScreen
        onBack={() => onSetScreen('snail-race-start')}
        racerCount={snailRaceCount}
      />
    );
  }

  if (screen === 'worldcup-start') {
    return <WorldCupStartScreen onBack={homeRestoreAfterReturn} onSelectCategory={handleStartWorldCup} />;
  }

  if (screen === 'worldcup-battle') {
    return (
      <WorldCupBattleScreen
        accessToken={sessionAccessToken}
        category={worldCupCategory}
        onBack={() => onSetScreen('worldcup-start')}
        onComplete={setWorldCupWinnerAndOpenResult}
      />
    );
  }

  if (screen === 'worldcup-result' && worldCupWinner) {
    return (
      <WorldCupResultScreen
        onBackToHome={homeRestoreAfterReturn}
        onRestart={() => {
          onSetWorldCupWinner(null);
          onSetScreen('worldcup-battle');
        }}
        winner={worldCupWinner}
      />
    );
  }

  if (screen === 'reliability-guide') {
    return <ReliabilityGuideScreen currentGrade={reliabilityGuideGrade} onBack={onBackFromReliabilityGuide} />;
  }

  if (screen === 'write-review') {
    return (
      <WriteReviewScreen
        initialContent={writeReviewInitialContent}
        onBack={onBackFromWriteReview}
        onSubmit={handleSubmitRestaurantReview}
        restaurantName={writeReviewRestaurantName || selectedRestaurantName}
        submitLabel={writeReviewMode === 'edit' ? '리뷰 수정' : '리뷰 등록'}
        title={writeReviewMode === 'edit' ? '리뷰 수정' : '리뷰 쓰기'}
      />
    );
  }

  return null;
}
