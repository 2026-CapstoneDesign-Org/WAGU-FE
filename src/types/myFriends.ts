export type FriendTabKey = 'following' | 'followers';

export type FriendUser = {
  id: string;
  isFollowing: boolean;
  name: string;
  reliabilityGrade?: string;
  reviewCount: number;
  showFollowAction: boolean;
};

export type FollowTogglePayload = {
  nextIsFollowing: boolean;
  sourceTab: FriendTabKey;
  userId: string;
};
