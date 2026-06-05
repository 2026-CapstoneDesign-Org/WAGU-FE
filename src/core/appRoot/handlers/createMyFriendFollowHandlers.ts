import { Alert } from 'react-native';
import type { Dispatch, SetStateAction } from 'react';

import { ApiError } from '../../../api/client';
import { followUser, getFollowStatus, unfollowUser } from '../../../api/wagu';
import type { FollowTogglePayload, FriendUser } from '../../../types/myFriends';
import type { UserProfile } from '../../../types/userProfiles';
import type { AuthSession } from '../types';

type CreateMyFriendFollowHandlersDeps = {
  buildFriendUserFromSources: (
    userId: string,
    sources: Array<FriendUser[]>,
    fallbackProfiles: UserProfile[],
  ) => FriendUser | null;
  fallbackUserProfiles: UserProfile[];
  mergeUserProfiles: (
    primaryProfiles: UserProfile[],
    fallbackProfiles: UserProfile[],
  ) => UserProfile[];
  myFollowerUsers: FriendUser[];
  myFollowingUsers: FriendUser[];
  recommendedUserProfiles: UserProfile[];
  remoteUserFriendConnectionsByUserId: Record<
    string,
    {
      followers: FriendUser[];
      following: FriendUser[];
    }
  >;
  remoteUserProfiles: UserProfile[];
  searchResultUserProfiles: UserProfile[];
  session: AuthSession | null;
  setMyFollowerUsers: Dispatch<SetStateAction<FriendUser[]>>;
  setMyFollowingUsers: Dispatch<SetStateAction<FriendUser[]>>;
  sortFollowersForInitialView: (users: FriendUser[]) => FriendUser[];
  syncFollowStateAcrossUserConnections: (userId: string, nextIsFollowing: boolean) => void;
};

export function createMyFriendFollowHandlers({
  buildFriendUserFromSources,
  fallbackUserProfiles,
  mergeUserProfiles,
  myFollowerUsers,
  myFollowingUsers,
  recommendedUserProfiles,
  remoteUserFriendConnectionsByUserId,
  remoteUserProfiles,
  searchResultUserProfiles,
  session,
  setMyFollowerUsers,
  setMyFollowingUsers,
  sortFollowersForInitialView,
  syncFollowStateAcrossUserConnections,
}: CreateMyFriendFollowHandlersDeps) {
  const buildMergedProfiles = () =>
    mergeUserProfiles(
      mergeUserProfiles(
        remoteUserProfiles,
        mergeUserProfiles(searchResultUserProfiles, recommendedUserProfiles),
      ),
      fallbackUserProfiles,
    );

  const buildConnectedSources = () => [
    myFollowerUsers,
    myFollowingUsers,
    ...Object.values(remoteUserFriendConnectionsByUserId).map((connection) => [
      ...connection.followers,
      ...connection.following,
    ]),
  ];

  const handleToggleMyFriendFollow = async ({
    nextIsFollowing,
    sourceTab,
    userId,
  }: FollowTogglePayload) => {
    if (!session?.accessToken) {
      return false;
    }

    const parsedUserId = Number(userId);

    if (Number.isNaN(parsedUserId)) {
      Alert.alert('안내', '팔로우를 변경하지 못했습니다.');
      return false;
    }

    try {
      if (nextIsFollowing) {
        await followUser(session.accessToken, parsedUserId);
      } else {
        await unfollowUser(session.accessToken, parsedUserId);
      }
    } catch (error) {
      try {
        const followStatus = await getFollowStatus(session.accessToken, parsedUserId);
        const currentIsFollowing = Boolean(followStatus);

        if (currentIsFollowing === nextIsFollowing) {
          syncFollowStateAcrossUserConnections(userId, nextIsFollowing);

          if (sourceTab === 'following') {
            const nextFollowUser = buildFriendUserFromSources(
              userId,
              buildConnectedSources(),
              buildMergedProfiles(),
            );

            setMyFollowingUsers((current) => {
              if (nextIsFollowing) {
                if (!nextFollowUser || current.some((user) => user.id === userId)) {
                  return current;
                }

                return [...current, { ...nextFollowUser, isFollowing: true }];
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
            return true;
          }

          let targetFollower: FriendUser | null = null;

          setMyFollowerUsers((current) =>
            sortFollowersForInitialView(
              current.map((user) => {
                if (user.id !== userId) {
                  return user;
                }

                targetFollower = { ...user, isFollowing: nextIsFollowing };
                return targetFollower;
              }),
            ),
          );

          setMyFollowingUsers((current) => {
            if (nextIsFollowing) {
              if (!targetFollower || current.some((user) => user.id === userId)) {
                return current;
              }

              return [...current, targetFollower];
            }

            return current.filter((user) => user.id !== userId);
          });

          return true;
        }
      } catch {
        // Ignore follow status reconciliation errors and fall through to message handling.
      }

      if (error instanceof ApiError) {
        const normalizedMessage = error.message.replace(/\s/g, '');
        const isAlreadyFollowingError =
          nextIsFollowing &&
          (normalizedMessage.includes('이미팔로우') || normalizedMessage.includes('이미팔로잉'));
        const isAlreadyUnfollowedError =
          !nextIsFollowing &&
          (error.status === 404 ||
            normalizedMessage.includes('이미언팔로우') ||
            normalizedMessage.includes('팔로우상태가아닙') ||
            normalizedMessage.includes('팔로우하지않'));

        if (!(isAlreadyFollowingError || isAlreadyUnfollowedError)) {
          Alert.alert('안내', error.message || '팔로우를 변경하지 못했습니다.');
          return false;
        }
      } else {
        Alert.alert('안내', '팔로우를 변경하지 못했습니다.');
        return false;
      }
    }

    syncFollowStateAcrossUserConnections(userId, nextIsFollowing);

    if (sourceTab === 'following') {
      const nextFollowUser = buildFriendUserFromSources(
        userId,
        buildConnectedSources(),
        buildMergedProfiles(),
      );

      setMyFollowingUsers((current) => {
        if (nextIsFollowing) {
          if (!nextFollowUser || current.some((user) => user.id === userId)) {
            return current;
          }

          return [...current, { ...nextFollowUser, isFollowing: true }];
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
      return true;
    }

    const nextFollowUser = buildFriendUserFromSources(
      userId,
      buildConnectedSources(),
      buildMergedProfiles(),
    );

    setMyFollowerUsers((current) =>
      sortFollowersForInitialView(
        current.map((user) => {
          if (user.id !== userId) {
            return user;
          }

          return { ...user, isFollowing: nextIsFollowing };
        }),
      ),
    );

    setMyFollowingUsers((current) => {
      if (nextIsFollowing) {
        if (!nextFollowUser || current.some((user) => user.id === userId)) {
          return current;
        }

        return [...current, { ...nextFollowUser, isFollowing: true }];
      }

      return current.filter((user) => user.id !== userId);
    });

    return true;
  };

  return {
    handleToggleMyFriendFollow,
  };
}
