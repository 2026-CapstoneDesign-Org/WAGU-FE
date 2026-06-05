import type { AppTab } from '../../../components/BottomTabBar';
import type { RankingEntry } from '../../../types/rankings';

export type SearchResultTabKey = 'restaurant' | 'user' | 'region';

export type FlowScreen =
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

export type RankingDetailState =
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

export type RestaurantDetailSource =
  | { type: 'search-result' }
  | { type: 'my-reviews' }
  | { type: 'user-reviews'; userId: string }
  | { type: 'my-list-detail'; listId: string }
  | { type: 'user-profile'; userId: string }
  | { type: 'tabs'; tab: AppTab }
  | { type: 'ranking-detail'; detail: NonNullable<RankingDetailState> }
  | null;

export type UserProfileSource =
  | { type: 'my-friends'; tab: 'following' | 'followers' }
  | { type: 'user-friends'; userId: string; tab: 'following' | 'followers' }
  | { type: 'search-result' }
  | { type: 'home' }
  | { type: 'restaurant-detail' }
  | null;

export type UserProfileHistoryEntry = {
  userId: string;
  source: UserProfileSource;
};

export type ReliabilityGuideSource = 'my-page' | 'user-profile' | null;

export type AuthSession = {
  accessToken: string;
  needsProfile?: boolean | null;
  refreshToken: string | null;
};
