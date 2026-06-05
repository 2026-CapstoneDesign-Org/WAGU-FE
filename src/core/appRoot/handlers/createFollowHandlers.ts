import { Alert } from 'react-native';
import type { Dispatch, SetStateAction } from 'react';

import { followUser, unfollowUser } from '../../../api/wagu';
import type { FriendUser } from '../../../types/myFriends';
import type { UserProfile } from '../../../types/userProfiles';
import type { AuthSession } from '../types';

type CreateFollowHandlersDeps = {
  fallbackUserProfiles: UserProfile[];
  myFollowerUsers: FriendUser[];
  recommendedUserProfiles: UserProfile[];
  remoteUserProfiles: UserProfile[];
  searchResultUserProfiles: UserProfile[];
  session: AuthSession | null;
  setMyFollowerUsers: Dispatch<SetStateAction<FriendUser[]>>;
  setMyFollowingUsers: Dispatch<SetStateAction<FriendUser[]>>;
  setRemoteUserFriendConnectionsByUserId: Dispatch<
    SetStateAction<Record<string, { followers: FriendUser[]; following: FriendUser[] }>>
  >;
  setRemoteUserProfiles: Dispatch<SetStateAction<UserProfile[]>>;
  setUserProfileFollowPendingIds: Dispatch<SetStateAction<string[]>>;
  setUserProfileFollowStateById: Dispatch<SetStateAction<Record<string, boolean>>>;
  sortFollowersForInitialView: (users: FriendUser[]) => FriendUser[];
};

function findTargetProfile(
  userId: string,
  remoteUserProfiles: UserProfile[],
  searchResultUserProfiles: UserProfile[],
  recommendedUserProfiles: UserProfile[],
  fallbackUserProfiles: UserProfile[],
) {
  return (
    remoteUserProfiles.find((profile) => profile.id === userId) ??
    searchResultUserProfiles.find((profile) => profile.id === userId) ??
    recommendedUserProfiles.find((profile) => profile.id === userId) ??
    fallbackUserProfiles.find((profile) => profile.id === userId)
  );
}

export function createFollowHandlers({
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
}: CreateFollowHandlersDeps) {
  const syncFollowStateAcrossScreens = (userId: string, nextIsFollowing: boolean) => {
    setUserProfileFollowStateById((current) => ({
      ...current,
      [userId]: nextIsFollowing,
    }));
    setMyFollowingUsers((current) => {
      if (nextIsFollowing) {
        if (current.some((user) => user.id === userId)) {
          return current;
        }

        const targetProfile = findTargetProfile(
          userId,
          remoteUserProfiles,
          searchResultUserProfiles,
          recommendedUserProfiles,
          fallbackUserProfiles,
        );

        if (!targetProfile) {
          return current;
        }

        return [
          ...current,
          {
            id: userId,
            isFollowing: true,
            name: targetProfile.nickname,
            reviewCount: Number(targetProfile.reviewCount ?? 0) || 0,
            showFollowAction: true,
          },
        ];
      }

      return current.filter((user) => user.id !== userId);
    });
    setMyFollowerUsers((current) =>
      sortFollowersForInitialView(
        current.map((user) =>
          user.id === userId ? { ...user, isFollowing: nextIsFollowing } : user,
        ),
      ),
    );
  };

  const syncFollowStateAcrossUserConnections = (userId: string, nextIsFollowing: boolean) => {
    setUserProfileFollowStateById((current) => ({
      ...current,
      [userId]: nextIsFollowing,
    }));
    setRemoteUserFriendConnectionsByUserId((current) => {
      const nextEntries = Object.entries(current).map(([profileId, connections]) => [
        profileId,
        {
          followers: connections.followers.map((user) =>
            user.id === userId ? { ...user, isFollowing: nextIsFollowing } : user,
          ),
          following: connections.following.map((user) =>
            user.id === userId ? { ...user, isFollowing: nextIsFollowing } : user,
          ),
        },
      ]);

      return Object.fromEntries(nextEntries);
    });
  };

  const handleToggleUserProfileFollow = async (userId: string, nextIsFollowing: boolean) => {
    if (!session?.accessToken) {
      return;
    }

    const parsedUserId = Number(userId);

    if (Number.isNaN(parsedUserId)) {
      Alert.alert('팔로우를 변경하지 못했습니다.');
      return;
    }

    setUserProfileFollowPendingIds((current) =>
      current.includes(userId) ? current : [...current, userId],
    );

    try {
      if (nextIsFollowing) {
        await followUser(session.accessToken, parsedUserId);
      } else {
        await unfollowUser(session.accessToken, parsedUserId);
      }

      setUserProfileFollowStateById((current) => ({
        ...current,
        [userId]: nextIsFollowing,
      }));
      setRemoteUserProfiles((current) =>
        current.map((profile) =>
          profile.id === userId
            ? {
                ...profile,
                followerCount: profile.followerCount
                  ? String(Math.max(0, Number(profile.followerCount) + (nextIsFollowing ? 1 : -1)))
                  : profile.followerCount,
              }
            : profile,
        ),
      );
      setMyFollowingUsers((current) => {
        if (nextIsFollowing) {
          if (current.some((user) => user.id === userId)) {
            return current;
          }

          const targetProfile = findTargetProfile(
            userId,
            remoteUserProfiles,
            searchResultUserProfiles,
            recommendedUserProfiles,
            fallbackUserProfiles,
          );

          if (!targetProfile) {
            return current;
          }

          return [
            ...current,
            {
              id: userId,
              isFollowing: true,
              name: targetProfile.nickname,
              reviewCount: Number(targetProfile.reviewCount ?? 0) || 0,
              showFollowAction: true,
            },
          ];
        }

        return current.filter((user) => user.id !== userId);
      });
      setMyFollowerUsers((current) =>
        sortFollowersForInitialView(
          current.map((user) =>
            user.id === userId ? { ...user, isFollowing: nextIsFollowing } : user,
          ),
        ),
      );
    } catch {
      Alert.alert('팔로우를 변경하지 못했습니다.');
    } finally {
      setUserProfileFollowPendingIds((current) => current.filter((id) => id !== userId));
    }
  };

  return {
    handleToggleUserProfileFollow,
    syncFollowStateAcrossScreens,
    syncFollowStateAcrossUserConnections,
  };
}
