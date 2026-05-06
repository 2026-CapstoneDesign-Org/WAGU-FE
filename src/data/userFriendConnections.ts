import { FriendUser } from './myFriends';

type UserFriendConnections = {
  followers: FriendUser[];
  following: FriendUser[];
};

const createFriend = (
  id: string,
  name: string,
  reviewCount: number,
  isFollowing: boolean,
): FriendUser => ({
  id,
  name,
  reviewCount,
  isFollowing,
  showFollowAction: true,
});

export const userFriendConnectionsByUserId: Record<string, UserFriendConnections> = {
  'following-1': {
    following: [
      createFriend('following-2', '맛집탐험가', 128, true),
      createFriend('follower-4', 'Junn', 2911, true),
      createFriend('follower-5', '지윤', 992, false),
    ],
    followers: [
      createFriend('follower-1', '가래떡살인마', 911, false),
      createFriend('follower-2', '배가고파요', 221, true),
      createFriend('follower-6', '은소금', 115, false),
    ],
  },
  'following-2': {
    following: [
      createFriend('following-1', '라면러버', 42, true),
      createFriend('follower-4', 'Junn', 2911, true),
    ],
    followers: [
      createFriend('follower-3', '라면땅', 3, false),
      createFriend('follower-5', '지윤', 992, true),
    ],
  },
  'follower-4': {
    following: [
      createFriend('following-1', '라면러버', 42, true),
      createFriend('following-2', '맛집탐험가', 128, true),
      createFriend('follower-5', '지윤', 992, true),
    ],
    followers: [
      createFriend('follower-1', '가래떡살인마', 911, false),
      createFriend('follower-2', '배가고파요', 221, true),
      createFriend('follower-7', '역북동라멘살인마', 632, true),
    ],
  },
};
