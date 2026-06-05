import { Alert } from 'react-native';
import type { Dispatch, SetStateAction } from 'react';

import { ApiError } from '../../../api/client';
import { getListLikeCount, likeList, unlikeList } from '../../../api/wagu';
import type { UserProfile } from '../../../types/userProfiles';
import type { AuthSession } from '../types';

type CreateMyListLikeHandlersDeps = {
  myListLikeStateById: Record<string, boolean>;
  selectedUserProfileId: string | null;
  selectedVisibleUserProfile: UserProfile | null;
  session: AuthSession | null;
  setMyListLikeCountById: Dispatch<SetStateAction<Record<string, number>>>;
  setMyListLikePendingIds: Dispatch<SetStateAction<string[]>>;
  setMyListLikeStateById: Dispatch<SetStateAction<Record<string, boolean>>>;
  setRecommendedUserProfiles: Dispatch<SetStateAction<UserProfile[]>>;
  setRemoteUserProfiles: Dispatch<SetStateAction<UserProfile[]>>;
  setSearchResultUserProfiles: Dispatch<SetStateAction<UserProfile[]>>;
};

export function createMyListLikeHandlers({
  myListLikeStateById,
  selectedUserProfileId,
  selectedVisibleUserProfile,
  session,
  setMyListLikeCountById,
  setMyListLikePendingIds,
  setMyListLikeStateById,
  setRecommendedUserProfiles,
  setRemoteUserProfiles,
  setSearchResultUserProfiles,
}: CreateMyListLikeHandlersDeps) {
  const handleToggleMyListLike = async (listId: string) => {
    if (!session?.accessToken) {
      return;
    }

    const parsedListId = Number(listId);

    if (Number.isNaN(parsedListId)) {
      return;
    }

    const hasStoredLikeState = Object.prototype.hasOwnProperty.call(myListLikeStateById, listId);
    const profileBackedLikeState =
      selectedVisibleUserProfile?.representativeListId === listId
        ? selectedVisibleUserProfile.representativeListIsLiked ?? false
        : false;
    const isCurrentlyLiked = hasStoredLikeState
      ? myListLikeStateById[listId]
      : profileBackedLikeState;

    setMyListLikePendingIds((current) =>
      current.includes(listId) ? current : [...current, listId],
    );

    try {
      if (isCurrentlyLiked) {
        await unlikeList(session.accessToken, parsedListId);
      } else {
        await likeList(session.accessToken, parsedListId);
      }

      setMyListLikeStateById((current) => ({
        ...current,
        [listId]: !isCurrentlyLiked,
      }));
      setMyListLikeCountById((current) => ({
        ...current,
        [listId]: Math.max(0, (current[listId] ?? 0) + (isCurrentlyLiked ? -1 : 1)),
      }));
      if (selectedUserProfileId && selectedVisibleUserProfile?.representativeListId === listId) {
        const applyNextLikeState = (profile: UserProfile) =>
          profile.id === selectedUserProfileId
            ? {
                ...profile,
                representativeListIsLiked: !isCurrentlyLiked,
              }
            : profile;

        setRemoteUserProfiles((current) => current.map(applyNextLikeState));
        setSearchResultUserProfiles((current) => current.map(applyNextLikeState));
        setRecommendedUserProfiles((current) => current.map(applyNextLikeState));
      }
    } catch (error) {
      if (error instanceof ApiError) {
        if (!isCurrentlyLiked && (error.status === 400 || error.status === 409)) {
          setMyListLikeStateById((current) => ({
            ...current,
            [listId]: true,
          }));
          if (selectedUserProfileId && selectedVisibleUserProfile?.representativeListId === listId) {
            const applyNextLikeState = (profile: UserProfile) =>
              profile.id === selectedUserProfileId
                ? {
                    ...profile,
                    representativeListIsLiked: true,
                  }
                : profile;

            setRemoteUserProfiles((current) => current.map(applyNextLikeState));
            setSearchResultUserProfiles((current) => current.map(applyNextLikeState));
            setRecommendedUserProfiles((current) => current.map(applyNextLikeState));
          }

          try {
            const likeCount = await getListLikeCount(session.accessToken, parsedListId);
            setMyListLikeCountById((current) => ({
              ...current,
              [listId]: likeCount,
            }));
          } catch {
            // Keep the previous count if refresh fails.
          }

          return;
        }

        if (isCurrentlyLiked && (error.status === 400 || error.status === 404)) {
          setMyListLikeStateById((current) => ({
            ...current,
            [listId]: false,
          }));
          if (selectedUserProfileId && selectedVisibleUserProfile?.representativeListId === listId) {
            const applyNextLikeState = (profile: UserProfile) =>
              profile.id === selectedUserProfileId
                ? {
                    ...profile,
                    representativeListIsLiked: false,
                  }
                : profile;

            setRemoteUserProfiles((current) => current.map(applyNextLikeState));
            setSearchResultUserProfiles((current) => current.map(applyNextLikeState));
            setRecommendedUserProfiles((current) => current.map(applyNextLikeState));
          }

          try {
            const likeCount = await getListLikeCount(session.accessToken, parsedListId);
            setMyListLikeCountById((current) => ({
              ...current,
              [listId]: likeCount,
            }));
          } catch {
            // Keep the previous count if refresh fails.
          }

          return;
        }
      }

      Alert.alert('?덈궡', '由ъ뒪??醫뗭븘?붿슂瑜??섏젙?섏? 紐삵뻽?듬땲??');
    } finally {
      setMyListLikePendingIds((current) => current.filter((id) => id !== listId));
    }
  };

  return {
    handleToggleMyListLike,
  };
}
