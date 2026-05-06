export type FriendTabKey = 'following' | 'followers';

export type FriendUser = {
  id: string;
  isFollowing: boolean;
  name: string;
  reviewCount: number;
  showFollowAction: boolean;
};

export type FollowTogglePayload = {
  nextIsFollowing: boolean;
  sourceTab: FriendTabKey;
  userId: string;
};

export const MY_FOLLOWING_USERS: FriendUser[] = [
  {
    id: 'following-1',
    name: '\uB77C\uBA74\uB7EC\uBC84',
    reviewCount: 42,
    isFollowing: true,
    showFollowAction: true,
  },
  {
    id: 'following-2',
    name: '\uB9DB\uC9D1\uD0D0\uD5D8\uAC00',
    reviewCount: 128,
    isFollowing: true,
    showFollowAction: true,
  },
  {
    id: 'following-3',
    name: '\uBD84\uC2DD\uC655',
    reviewCount: 91,
    isFollowing: true,
    showFollowAction: true,
  },
  {
    id: 'following-4',
    name: '\uB300\uCE58\uB3D9\uB9DB\uB3C4\uB9AC',
    reviewCount: 1542,
    isFollowing: true,
    showFollowAction: true,
  },
  {
    id: 'following-5',
    name: '\uB9C8\uB77C\uD0D5\uC911\uB3C5',
    reviewCount: 881,
    isFollowing: true,
    showFollowAction: true,
  },
];

export const MY_FOLLOWER_USERS: FriendUser[] = [
  {
    id: 'follower-1',
    name: '\uAC00\uB798\uB5A1\uC0B4\uC778\uB9C8',
    reviewCount: 911,
    isFollowing: false,
    showFollowAction: true,
  },
  {
    id: 'follower-2',
    name: '\uBC30\uAC00\uACE0\uD30C\uC694',
    reviewCount: 221,
    isFollowing: true,
    showFollowAction: true,
  },
  {
    id: 'follower-3',
    name: '\uB77C\uBA74\uB545',
    reviewCount: 3,
    isFollowing: false,
    showFollowAction: true,
  },
  {
    id: 'follower-4',
    name: 'Junn',
    reviewCount: 2911,
    isFollowing: false,
    showFollowAction: true,
  },
  {
    id: 'follower-5',
    name: '\uC9C0\uC724',
    reviewCount: 992,
    isFollowing: true,
    showFollowAction: true,
  },
  {
    id: 'follower-6',
    name: '\uC740\uC18C\uAE08',
    reviewCount: 115,
    isFollowing: false,
    showFollowAction: true,
  },
  {
    id: 'follower-7',
    name: '\uC5ED\uBD81\uB3D9\uB77C\uBA58\uC0B4\uC778\uB9C8',
    reviewCount: 632,
    isFollowing: true,
    showFollowAction: true,
  },
];
