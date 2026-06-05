import { DeleteAccountScreen } from '../../../screens/profile/DeleteAccountScreen';
import { EditNicknameScreen } from '../../../screens/profile/EditNicknameScreen';
import type { LoginProvider } from '../../../screens/profile/MyInfoScreen';
import { MyInfoScreen } from '../../../screens/profile/MyInfoScreen';
import { MyFriendsScreen } from '../../../screens/profile/MyFriendsScreen';
import { MyListDetailScreen } from '../../../screens/lists/MyListDetailScreen';
import { MyListPlaceEditScreen } from '../../../screens/lists/MyListPlaceEditScreen';
import { MyListsScreen } from '../../../screens/lists/MyListsScreen';
import { MyReviewsScreen } from '../../../screens/reviews/MyReviewsScreen';
import { RankingDetailScreen } from '../../../screens/ranking/RankingDetailScreen';
import { SettingsScreen } from '../../../screens/profile/SettingsScreen';
import { UserReviewsScreen } from '../../../screens/reviews/UserReviewsScreen';
import { UserProfileScreen } from '../../../screens/profile/UserProfileScreen';
import type { FlowScreen, RankingDetailState, UserProfileHistoryEntry, UserProfileSource } from '../types';
import type { FriendTabKey, FriendUser, FollowTogglePayload } from '../../../types/myFriends';
import type { MyList } from '../../../types/myLists';
import type { MyReview } from '../../../types/myReviews';
import type { UserProfile } from '../../../types/userProfiles';

type AppRootAccountScreensProps = {
  birthDateLabel: string | null;
  followerUsers: FriendUser[];
  followingUsers: FriendUser[];
  genderLabel: string | null;
  handleBackFromRankingDetail: () => void;
  handleBlockedOwnListLike: () => void;
  handleDeleteAccount: () => Promise<void> | void;
  handleLogout: () => Promise<void> | void;
  handleDeleteMyList: (listId: string) => Promise<void> | void;
  handleDeleteMyReview: (reviewId: string) => Promise<boolean> | boolean;
  handleDeleteRestaurantsFromMyList: (listId: string, restaurantIds: string[]) => Promise<void> | void;
  handleMyFriendFollowToggle: (payload: FollowTogglePayload) => Promise<boolean> | boolean;
  handleMyListRename: (listId: string, title: string) => Promise<void> | void;
  handleMyListSetRepresentative: (listId: string) => Promise<void> | void;
  handleMyListTogglePrivacy: (listId: string) => Promise<void> | void;
  handleOpenRestaurantDetail: (restaurantName: string, source:
    | { type: 'my-reviews' }
    | { type: 'user-reviews'; userId: string }
    | { type: 'my-list-detail'; listId: string }
    | { type: 'user-profile'; userId: string }
    | { type: 'ranking-detail'; detail: NonNullable<RankingDetailState> }
  ) => void;
  handleReportUser: (userId: string, reason: string) => Promise<void> | void;
  handleToggleMyListLike: (listId: string) => Promise<void> | void;
  handleToggleReviewReaction: (
    reviewId: string,
    nextReaction: 'dislike' | 'like' | null,
  ) => Promise<boolean> | boolean;
  handleToggleUserProfileFollow: (userId: string, nextIsFollowing: boolean) => Promise<void> | void;
  handleUpdateProfileImage: (selection: {
    fileName?: string | null;
    mimeType?: string | null;
    uri: string;
  }) => Promise<string>;
  handleUpdateRestaurantRatingsInMyList: (
    listId: string,
    restaurantId: string,
    ratings: { service: number; taste: number; value: number },
  ) => Promise<void> | void;
  loginProvider: LoginProvider;
  myListLikeCountById: Record<string, number>;
  myListLikePendingIds: string[];
  myListLikeStateById: Record<string, boolean>;
  myLists: MyList[];
  myFriendsInitialTab: FriendTabKey;
  myReviewItems: MyReview[];
  myUserId: number | null;
  nickname: string;
  onBackFromHomeUserProfile: () => void;
  onBackToMyInfo: () => void;
  onBackToSettings: () => void;
  onChangeMyFriendsTab: (tab: FriendTabKey) => void;
  onCreateMyList: () => void;
  onOpenNestedUserProfile: (userId: string, source: UserProfileSource) => void;
  onOpenReliabilityGuideFromUserProfile: () => void;
  onOpenUserProfileFromMyFriends: (userId: string) => void;
  onSetMyLists: (lists: MyList[]) => void;
  onSetMyFriendsInitialTab: (tab: FriendTabKey) => void;
  onSetNicknameAndReturn: (nickname: string) => void;
  onSetScreen: (screen: FlowScreen) => void;
  onSetSelectedMyListId: (listId: string) => void;
  onSetSelectedUserProfileId: (userId: string) => void;
  onSetUserProfileHistory: (updater: (current: UserProfileHistoryEntry[]) => UserProfileHistoryEntry[]) => void;
  onSetUserProfileSource: (source: UserProfileSource) => void;
  profileImageUrl: string | null;
  rankingDetail: RankingDetailState;
  reviewReactionPendingIds: string[];
  reviewsByUserId: Record<string, MyReview[]>;
  screen: FlowScreen;
  selectedMyListId: string | null;
  selectedUserProfileId: string | null;
  selectedUserProfileIsFollowing: boolean;
  selectedVisibleUserProfile: UserProfile | null;
  fallbackSelectedUserProfile: UserProfile | null;
  userFriendConnectionsById: Record<string, { followers: FriendUser[]; following: FriendUser[] }>;
  userProfileFollowPendingIds: string[];
  userProfileHistory: UserProfileHistoryEntry[];
  userProfileSource: UserProfileSource;
  visibleUserProfiles: UserProfile[];
};

export function AppRootAccountScreens({
  birthDateLabel,
  followerUsers,
  followingUsers,
  genderLabel,
  handleBackFromRankingDetail,
  handleBlockedOwnListLike,
  handleDeleteAccount,
  handleLogout,
  handleDeleteMyList,
  handleDeleteMyReview,
  handleDeleteRestaurantsFromMyList,
  handleMyFriendFollowToggle,
  handleMyListRename,
  handleMyListSetRepresentative,
  handleMyListTogglePrivacy,
  handleOpenRestaurantDetail,
  handleReportUser,
  handleToggleMyListLike,
  handleToggleReviewReaction,
  handleToggleUserProfileFollow,
  handleUpdateProfileImage,
  handleUpdateRestaurantRatingsInMyList,
  loginProvider,
  myListLikeCountById,
  myListLikePendingIds,
  myListLikeStateById,
  myLists,
  myFriendsInitialTab,
  myReviewItems,
  myUserId,
  nickname,
  onBackFromHomeUserProfile,
  onBackToMyInfo,
  onBackToSettings,
  onChangeMyFriendsTab,
  onCreateMyList,
  onOpenNestedUserProfile,
  onOpenReliabilityGuideFromUserProfile,
  onOpenUserProfileFromMyFriends,
  onSetMyLists,
  onSetMyFriendsInitialTab,
  onSetNicknameAndReturn,
  onSetScreen,
  onSetSelectedMyListId,
  onSetSelectedUserProfileId,
  onSetUserProfileHistory,
  onSetUserProfileSource,
  profileImageUrl,
  rankingDetail,
  reviewReactionPendingIds,
  reviewsByUserId,
  screen,
  selectedMyListId,
  selectedUserProfileId,
  selectedUserProfileIsFollowing,
  selectedVisibleUserProfile,
  fallbackSelectedUserProfile,
  userFriendConnectionsById,
  userProfileFollowPendingIds,
  userProfileHistory,
  userProfileSource,
  visibleUserProfiles,
}: AppRootAccountScreensProps) {
  if (screen === 'settings') {
    return (
        <SettingsScreen
          onBack={() => onSetScreen('tabs')}
          onLogout={() => void handleLogout()}
          onOpenDeleteAccount={() => onSetScreen('delete-account')}
          onOpenMyInfo={() => onSetScreen('my-info')}
        />
    );
  }

  if (screen === 'my-info') {
    return (
      <MyInfoScreen
        birthDateLabel={birthDateLabel}
        genderLabel={genderLabel}
        loginProvider={loginProvider}
        nickname={nickname}
        onBack={() => onSetScreen('settings')}
        onOpenEditNickname={() => onSetScreen('edit-nickname')}
        onUpdateProfileImage={handleUpdateProfileImage}
        profileImageUrl={profileImageUrl}
      />
    );
  }

  if (screen === 'my-friends') {
    return (
        <MyFriendsScreen
          currentUserId={myUserId !== null ? String(myUserId) : null}
          followerUsersData={followerUsers}
          followingUsersData={followingUsers}
          initialTab={myFriendsInitialTab}
        onBack={() => onSetScreen('tabs')}
        onChangeTab={onChangeMyFriendsTab}
        onOpenUserProfile={onOpenUserProfileFromMyFriends}
        onToggleFollow={handleMyFriendFollowToggle}
      />
    );
  }

  if (screen === 'user-friends' && selectedUserProfileId) {
    return (
        <MyFriendsScreen
          currentUserId={myUserId !== null ? String(myUserId) : null}
          followerUsersData={userFriendConnectionsById[selectedUserProfileId]?.followers ?? []}
          followingUsersData={userFriendConnectionsById[selectedUserProfileId]?.following ?? []}
          initialTab={myFriendsInitialTab}
        onBack={() => onSetScreen('user-profile')}
        onChangeTab={onChangeMyFriendsTab}
        onOpenUserProfile={(userId) => {
          onOpenNestedUserProfile(userId, {
            type: 'user-friends',
            tab: userProfileSource?.type === 'user-friends' ? userProfileSource.tab : 'following',
            userId: selectedUserProfileId,
          });
        }}
        onToggleFollow={handleMyFriendFollowToggle}
        preserveListOnToggle
        title={`${visibleUserProfiles.find((item) => item.id === selectedUserProfileId)?.nickname ?? ''}님의 밥친구`}
      />
    );
  }

  if (screen === 'my-lists') {
    return (
        <MyListsScreen
          lists={myLists}
          onBack={() => onSetScreen('tabs')}
          onChangeLists={onSetMyLists}
          onCreateList={onCreateMyList}
        onDeleteList={handleDeleteMyList}
        onOpenList={(listId) => {
          onSetSelectedMyListId(listId);
          onSetScreen('my-list-detail');
        }}
        onRenameList={handleMyListRename}
        onSetRepresentativeList={handleMyListSetRepresentative}
        onToggleListPrivacy={handleMyListTogglePrivacy}
      />
    );
  }

  if (screen === 'my-list-detail' && selectedMyListId) {
    return (
      <MyListDetailScreen
        isLikePending={myListLikePendingIds.includes(selectedMyListId)}
        isLiked={myListLikeStateById[selectedMyListId] ?? false}
        likeCount={myListLikeCountById[selectedMyListId] ?? 0}
        list={myLists.find((item) => item.id === selectedMyListId) ?? myLists[0]}
        lists={myLists}
        onBack={() => onSetScreen('my-lists')}
        onChangeLists={onSetMyLists}
        onOpenPlaceEdit={() => onSetScreen('my-list-place-edit')}
        onOpenRestaurantDetail={(restaurantName) =>
          handleOpenRestaurantDetail(restaurantName, {
            listId: selectedMyListId,
            type: 'my-list-detail',
          })
        }
        onRemoveRestaurants={handleDeleteRestaurantsFromMyList}
        onRenameList={handleMyListRename}
        onToggleLike={handleBlockedOwnListLike}
        onUpdateRestaurantRatings={handleUpdateRestaurantRatingsInMyList}
      />
    );
  }

  if (screen === 'my-list-place-edit' && selectedMyListId) {
    return (
      <MyListPlaceEditScreen
        list={myLists.find((item) => item.id === selectedMyListId) ?? myLists[0]}
        lists={myLists}
        onBack={() => onSetScreen('my-list-detail')}
        onChangeLists={onSetMyLists}
        onDeleteRestaurants={handleDeleteRestaurantsFromMyList}
      />
    );
  }

  if (screen === 'my-reviews') {
    return (
      <MyReviewsScreen
        onBack={() => onSetScreen('tabs')}
        onDeleteReview={handleDeleteMyReview}
        onOpenRestaurantDetail={(restaurantName) =>
          handleOpenRestaurantDetail(restaurantName, { type: 'my-reviews' })
        }
        reviewsData={myReviewItems}
        title="내 리뷰"
      />
    );
  }

  if (screen === 'user-reviews' && selectedUserProfileId) {
    return (
      <UserReviewsScreen
        onBack={() => onSetScreen('user-profile')}
        onOpenRestaurantDetail={(restaurantName) =>
          handleOpenRestaurantDetail(restaurantName, {
            type: 'user-reviews',
            userId: selectedUserProfileId,
          })
        }
        onToggleReaction={handleToggleReviewReaction}
        pendingReactionIds={reviewReactionPendingIds}
        reviews={reviewsByUserId[selectedUserProfileId] ?? []}
        title={`${selectedVisibleUserProfile?.nickname ?? ''}님의 리뷰`}
      />
    );
  }

  if (screen === 'edit-nickname') {
    return (
      <EditNicknameScreen
        initialNickname={nickname}
        onBack={() => onSetScreen('my-info')}
        onSubmit={onSetNicknameAndReturn}
      />
    );
  }

  if (screen === 'delete-account') {
    return (
      <DeleteAccountScreen
        onBack={() => onSetScreen('settings')}
        onSubmit={() => void handleDeleteAccount()}
      />
    );
  }

  if (screen === 'user-profile' && selectedUserProfileId) {
    const selectedProfile = selectedVisibleUserProfile;
    const representativeListId = selectedProfile?.representativeListId;
    const hasStoredLikeState = representativeListId
      ? Object.prototype.hasOwnProperty.call(myListLikeStateById, representativeListId)
      : false;

    return (
      <UserProfileScreen
        isFollowLoading={userProfileFollowPendingIds.includes(selectedUserProfileId)}
        isFollowing={selectedUserProfileIsFollowing}
        isOwnProfile={myUserId !== null && Number(selectedUserProfileId) === myUserId}
        onBack={() => {
          if (userProfileSource?.type === 'search-result') {
            onSetScreen('search-result');
            return;
          }

          if (userProfileSource?.type === 'home') {
            onBackFromHomeUserProfile();
            return;
          }

          if (userProfileSource?.type === 'restaurant-detail') {
            onSetScreen('restaurant-detail');
            return;
          }

          if (userProfileSource?.type === 'user-friends') {
            const previousProfile = userProfileHistory[userProfileHistory.length - 1];
            onSetSelectedUserProfileId(userProfileSource.userId);
            onSetUserProfileSource(previousProfile?.source ?? null);
            onSetUserProfileHistory((current) => current.slice(0, -1));
            onSetMyFriendsInitialTab(userProfileSource.tab);
            onSetScreen('user-friends');
            return;
          }

          if (userProfileSource?.type === 'my-friends') {
            onSetMyFriendsInitialTab(userProfileSource.tab);
            onSetScreen('my-friends');
            return;
          }

          onSetScreen('my-friends');
        }}
        onFollowToggle={(nextIsFollowing) =>
          void handleToggleUserProfileFollow(selectedUserProfileId, nextIsFollowing)
        }
        onOpenFollowers={() => {
          onSetMyFriendsInitialTab('followers');
          onSetScreen('user-friends');
        }}
        onOpenFollowing={() => {
          onSetMyFriendsInitialTab('following');
          onSetScreen('user-friends');
        }}
        onOpenReliabilityGuide={onOpenReliabilityGuideFromUserProfile}
        onOpenRestaurantDetail={(restaurantName) =>
          handleOpenRestaurantDetail(restaurantName, {
            type: 'user-profile',
            userId: selectedUserProfileId,
          })
        }
        onOpenReviews={() => onSetScreen('user-reviews')}
        onReportUser={
          selectedUserProfileId
            ? (reason) => void handleReportUser(selectedUserProfileId, reason)
            : undefined
        }
        onToggleRepresentativeLike={(listId) => void handleToggleMyListLike(listId)}
        profile={selectedVisibleUserProfile ?? fallbackSelectedUserProfile!}
        representativeIsLikePending={
          representativeListId ? myListLikePendingIds.includes(representativeListId) : false
        }
        representativeIsLiked={
          representativeListId
            ? hasStoredLikeState
              ? myListLikeStateById[representativeListId]
              : selectedProfile?.representativeListIsLiked ?? false
            : selectedProfile?.representativeListIsLiked ?? false
        }
        representativeLikeCount={
          representativeListId ? myListLikeCountById[representativeListId] ?? 0 : undefined
        }
      />
    );
  }

  if (screen === 'ranking-detail' && rankingDetail) {
    return (
      <RankingDetailScreen
        isLoading={rankingDetail.variant === 'region' ? rankingDetail.isLoading : false}
        items={rankingDetail.items}
        onBack={handleBackFromRankingDetail}
        onOpenRestaurantDetail={(restaurantName) =>
          handleOpenRestaurantDetail(restaurantName, {
            detail: rankingDetail,
            type: 'ranking-detail',
          })
        }
        title={rankingDetail.title}
        variant={rankingDetail.variant}
      />
    );
  }

  return null;
}
