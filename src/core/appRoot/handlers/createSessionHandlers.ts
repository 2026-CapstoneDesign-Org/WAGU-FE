import type { LoginProvider } from '../../../screens/profile/MyInfoScreen';
import type { HomeProfileCardItem, HomeRestaurantCardItem } from '../../../screens/home/MainHomeScreen';
import type { FriendUser } from '../../../types/myFriends';
import type { MyList } from '../../../types/myLists';
import type { MyReview } from '../../../types/myReviews';
import type { RankingEntry } from '../../../types/rankings';
import type { UserProfile } from '../../../types/userProfiles';
import type { AuthSession, FlowScreen } from '../types';
import { clearStoredSession, writeStoredSession } from '../../sessionStorage';

type CreateSessionHandlersDeps = {
  fallbackLocalRankingRegion: string;
  setBirthDateLabel: (label: string | null) => void;
  setFollowerCount: (count: number) => void;
  setGenderLabel: (label: string | null) => void;
  setLocalRankingRegion: (region: string) => void;
  setLoginProvider: (provider: LoginProvider) => void;
  setMyFollowerUsers: (users: FriendUser[]) => void;
  setMyFollowingUsers: (users: FriendUser[]) => void;
  setMyHonorPeriod: (period: string | null) => void;
  setMyHonorTitle: (title: string | null) => void;
  setMyLists: (lists: MyList[]) => void;
  setMyReliabilityGrade: (grade: string | null) => void;
  setMyReliabilityScore: (score: number | null) => void;
  setMyReviewItems: (reviews: MyReview[]) => void;
  setMyUserId: (userId: number | null) => void;
  setNickname: (nickname: string) => void;
  setPendingNickname: (nickname: string | null) => void;
  setProfileImageUrl: (url: string | null) => void;
  setRankingEntries: (entries: { local: RankingEntry[]; national: RankingEntry[] }) => void;
  setRecommendedMealFriendItems: (items: HomeProfileCardItem[]) => void;
  setRecommendedRestaurantItems: (items: HomeRestaurantCardItem[]) => void;
  setRecommendedUserProfiles: (profiles: UserProfile[]) => void;
  setRequiresProfileSetup: (required: boolean) => void;
  setScreen: (screen: FlowScreen) => void;
  setSession: (session: AuthSession | null) => void;
};

export function createSessionHandlers({
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
}: CreateSessionHandlersDeps) {
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

  return {
    applyStoredSession,
    clearAuthSession,
  };
}
