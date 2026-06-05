import { Alert } from 'react-native';

import { ApiError } from '../../../api/client';
import { uploadImageWithPresignedUrl } from '../../../api/upload';
import {
  deleteMyUser,
  formatBirthDate,
  formatGenderLabel,
  getMyInfo,
  getMyLists,
  signupProfile,
  updateMyUser,
} from '../../../api/wagu';
import type { LoginProvider } from '../../../screens/profile/MyInfoScreen';
import type { Restaurant } from '../../../types/restaurants';
import type { AuthSession, FlowScreen } from '../types';

type ProfileImageSelection = {
  fileName?: string | null;
  mimeType?: string | null;
  uri: string;
};

type SignupProfileInput = {
  birthDay: number;
  birthMonth: number;
  birthYear: number;
  gender: 'FEMALE' | 'MALE';
};

type CreateAuthFlowHandlersDeps = {
  applyStoredSession: (provider: LoginProvider, nextSession: AuthSession) => Promise<void>;
  clearAuthSession: () => Promise<void>;
  hydrateHomeRecommendations: (
    token: string,
    options: { retryOnEmpty?: boolean },
  ) => Promise<void>;
  pendingNickname: string | null;
  requiresProfileSetup: boolean;
  session: AuthSession | null;
  setActiveTab: (tab: 'home') => void;
  setBirthDateLabel: (label: string | null) => void;
  setGenderLabel: (label: string | null) => void;
  setNickname: (nickname: string) => void;
  setPendingNickname: (nickname: string | null) => void;
  setProfileImageUrl: (url: string | null) => void;
  setRequiresProfileSetup: (required: boolean) => void;
  setScreen: (screen: FlowScreen) => void;
  setSelectedRestaurants: (restaurants: Restaurant[]) => void;
  setTasteFlowSource: (source: 'my-lists' | 'onboarding') => void;
  setTasteListName: (name: string) => void;
  waitForServerUserReady: (token: string, attempts?: number) => Promise<boolean>;
};

export function createAuthFlowHandlers({
  applyStoredSession,
  clearAuthSession,
  hydrateHomeRecommendations,
  pendingNickname,
  requiresProfileSetup,
  session,
  setActiveTab,
  setBirthDateLabel,
  setGenderLabel,
  setNickname,
  setPendingNickname,
  setProfileImageUrl,
  setRequiresProfileSetup,
  setScreen,
  setSelectedRestaurants,
  setTasteFlowSource,
  setTasteListName,
  waitForServerUserReady,
}: CreateAuthFlowHandlersDeps) {
  const handleUpdateProfileImage = async (selection: ProfileImageSelection) => {
    if (!session?.accessToken) {
      throw new Error('로그인이 필요합니다.');
    }

    const uploadedImageUrl = await uploadImageWithPresignedUrl({
      fileName: selection.fileName,
      mimeType: selection.mimeType,
      token: session.accessToken,
      type: 'PROFILE',
      uri: selection.uri,
    });

    await updateMyUser(session.accessToken, { profileImageUrl: uploadedImageUrl });
    setProfileImageUrl(uploadedImageUrl);
    return uploadedImageUrl;
  };

  const handleLoginSuccess = async (
    provider: LoginProvider,
    nextSession: AuthSession,
  ) => {
    await applyStoredSession(provider, nextSession);
    setActiveTab('home');

    try {
      const me = await getMyInfo(nextSession.accessToken);
      const lists = await getMyLists(nextSession.accessToken);

      setNickname(me.nickname);
      setProfileImageUrl(me.profileImageUrl ?? null);
      setBirthDateLabel(formatBirthDate(me));
      setGenderLabel(formatGenderLabel(me.gender));

      const derivedNeedsProfile =
        !me.birthYear || !me.birthMonth || !me.birthDay || !me.gender;
      const needsSignupProfile = nextSession.needsProfile ?? derivedNeedsProfile;

      setRequiresProfileSetup(needsSignupProfile);

      if (lists.length === 0) {
        setTasteFlowSource('onboarding');
        setScreen('signup-nickname');
        return;
      }

      if (needsSignupProfile) {
        setScreen('signup-profile');
        return;
      }

      setScreen('tabs');
    } catch {
      setRequiresProfileSetup(nextSession.needsProfile ?? true);
      setTasteFlowSource('onboarding');
      setScreen('signup-nickname');
    }
  };

  const handleSignupNicknameSubmit = async (nextNickname: string) => {
    setNickname(nextNickname);
    setPendingNickname(nextNickname);

    if (!requiresProfileSetup && session?.accessToken) {
      try {
        await updateMyUser(session.accessToken, { nickname: nextNickname });
        setPendingNickname(null);
      } catch {
        // Keep the local nickname and try again during later onboarding steps.
      }
    }

    if (requiresProfileSetup) {
      setScreen('signup-profile');
      return;
    }

    setTasteFlowSource('onboarding');
    setTasteListName('');
    setSelectedRestaurants([]);
    setScreen('taste-list-name');
  };

  const handleSignupProfileSubmit = async (profile: SignupProfileInput) => {
    if (!session?.accessToken) {
      throw new Error('濡쒓렇???뺣낫媛 ?놁뼱???꾨줈?꾩쓣 ??ν븷 ???놁뼱??');
    }

    if (pendingNickname) {
      try {
        console.log('[signup profile] syncing pending nickname');
        await updateMyUser(session.accessToken, { nickname: pendingNickname });
        setPendingNickname(null);
        console.log('[signup profile] pending nickname synced');
      } catch {
        console.log('[signup profile] pending nickname sync failed');
        // Proceed with profile save even if nickname sync needs to be retried later.
      }
    }

    console.log('[signup profile] submitting profile');
    await signupProfile(session.accessToken, profile);
    console.log('[signup profile] profile submitted');
    setBirthDateLabel(`${profile.birthYear}년 ${profile.birthMonth}월 ${profile.birthDay}일`);
    setGenderLabel(profile.gender === 'MALE' ? '남성' : '여성');
    setRequiresProfileSetup(false);
    console.log('[signup profile] waiting for server user ready');
    await waitForServerUserReady(session.accessToken, 4);
    console.log('[signup profile] server user ready');
    console.log('[signup profile] hydrating home recommendations');
    await hydrateHomeRecommendations(session.accessToken, { retryOnEmpty: true });
    console.log('[signup profile] home recommendations hydrated');
    console.log('[signup profile] loading lists');
    const lists = await getMyLists(session.accessToken);
    console.log('[signup profile] lists loaded', { count: lists.length });
    setTasteFlowSource('onboarding');
    if (lists.length === 0) {
      setTasteListName('');
      setSelectedRestaurants([]);
      console.log('[signup profile] routing to taste-list-name');
      setScreen('taste-list-name');
      return;
    }

    console.log('[signup profile] routing to tabs');
    setScreen('tabs');
  };

  const handleLogout = async () => {
    await clearAuthSession();
  };

  const handleDeleteAccount = async () => {
    if (!session?.accessToken) {
      Alert.alert('안내', '로그인 상태를 확인해 주세요.');
      return;
    }

    try {
      await deleteMyUser(session.accessToken);
      await clearAuthSession();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message || '회원탈퇴를 진행하지 못했습니다.'
          : '회원탈퇴를 진행하지 못했습니다.';
      Alert.alert('안내', message);
    }
  };

  return {
    handleDeleteAccount,
    handleLoginSuccess,
    handleLogout,
    handleSignupNicknameSubmit,
    handleSignupProfileSubmit,
    handleUpdateProfileImage,
  };
}
