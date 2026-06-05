import { AddRestaurantToListRatingScreen } from '../../../screens/lists/AddRestaurantToListRatingScreen';
import { AddRestaurantToListSelectScreen } from '../../../screens/lists/AddRestaurantToListSelectScreen';
import { OnboardingLoginScreen } from '../../../screens/auth/OnboardingLoginScreen';
import { RegistrationCompleteScreen } from '../../../screens/auth/RegistrationCompleteScreen';
import { SignupNicknameScreen } from '../../../screens/auth/SignupNicknameScreen';
import { SignupProfileScreen } from '../../../screens/auth/SignupProfileScreen';
import { TasteListNameScreen } from '../../../screens/lists/TasteListNameScreen';
import { TasteRatingScreen } from '../../../screens/lists/TasteRatingScreen';
import { TasteSelectionScreen } from '../../../screens/lists/TasteSelectionScreen';
import type { FlowScreen } from '../types';
import type { LoginProvider } from '../../../screens/profile/MyInfoScreen';
import type { MyList } from '../../../types/myLists';
import type { Restaurant } from '../../../types/restaurants';

type AppRootFlowScreensProps = {
  accessToken?: string;
  addToListRestaurant: Restaurant;
  addToListSource: 'restaurant-detail' | 'map' | null;
  addToListTargetListIds: string[];
  completionSource: 'taste-flow' | 'add-to-list';
  myLists: MyList[];
  nickname: string;
  onAddToListSelectionComplete: (listIds: string[]) => void;
  onBackFromAddToListSelect: () => void;
  onBackFromComplete: () => void;
  onBackFromTasteListName: () => void;
  onCompleteTasteRating: (ratings: Record<string, Record<string, number>>) => Promise<void>;
  onFlowLoginSuccess: (provider: LoginProvider, nextSession: {
    accessToken: string;
    needsProfile?: boolean | null;
    refreshToken: string | null;
  }) => void;
  onOpenAddToListRatingBack: () => void;
  onOpenRatingBack: () => void;
  onOpenSignupNicknameBack: () => void;
  onOpenSignupProfileBack: () => void;
  onOpenTasteBack: () => void;
  onSelectTasteRestaurants: (restaurants: Restaurant[]) => void;
  onSetScreen: (screen: FlowScreen) => void;
  onSetTasteListName: (name: string) => void;
  onSubmitAddToListRating: (ratings: {
    taste: number;
    service: number;
    value: number;
  }) => void | Promise<void>;
  onSubmitSignupNickname: (nickname: string) => void;
  onSubmitSignupProfile: (profile: {
    birthDay: number;
    birthMonth: number;
    birthYear: number;
    gender: 'FEMALE' | 'MALE';
  }) => void | Promise<void>;
  screen: FlowScreen;
  selectedRestaurants: Restaurant[];
  tasteFlowSource: 'onboarding' | 'my-lists';
  tasteListName: string;
};

export function AppRootFlowScreens({
  accessToken,
  addToListRestaurant,
  addToListSource,
  addToListTargetListIds,
  completionSource,
  myLists,
  nickname,
  onAddToListSelectionComplete,
  onBackFromAddToListSelect,
  onBackFromComplete,
  onBackFromTasteListName,
  onCompleteTasteRating,
  onFlowLoginSuccess,
  onOpenAddToListRatingBack,
  onOpenRatingBack,
  onOpenSignupNicknameBack,
  onOpenSignupProfileBack,
  onOpenTasteBack,
  onSelectTasteRestaurants,
  onSetScreen,
  onSetTasteListName,
  onSubmitAddToListRating,
  onSubmitSignupNickname,
  onSubmitSignupProfile,
  screen,
  selectedRestaurants,
  tasteFlowSource,
  tasteListName,
}: AppRootFlowScreensProps) {
  if (screen === 'login') {
    return (
      <OnboardingLoginScreen
        onLoginSuccess={(provider, nextSession) =>
          void onFlowLoginSuccess(provider as LoginProvider, nextSession)
        }
      />
    );
  }

  if (screen === 'signup-nickname') {
    return (
      <SignupNicknameScreen
        initialNickname=""
        onBack={onOpenSignupNicknameBack}
        onSubmit={onSubmitSignupNickname}
      />
    );
  }

  if (screen === 'signup-profile') {
    return (
      <SignupProfileScreen
        nickname={nickname}
        onBack={onOpenSignupProfileBack}
        onSubmit={onSubmitSignupProfile}
      />
    );
  }

  if (screen === 'taste-list-name') {
    return (
      <TasteListNameScreen
        mode={tasteFlowSource === 'my-lists' ? 'new-list' : 'first-list'}
        nickname={nickname}
        onBack={onBackFromTasteListName}
        onSubmit={(name) => {
          onSetTasteListName(name);
          onSetScreen('taste');
        }}
      />
    );
  }

  if (screen === 'taste') {
    return (
      <TasteSelectionScreen
        accessToken={accessToken}
        onBack={onOpenTasteBack}
        onConfirm={(restaurants) => {
          onSelectTasteRestaurants(restaurants);
          onSetScreen('rating');
        }}
      />
    );
  }

  if (screen === 'rating') {
    return (
      <TasteRatingScreen
        listName={tasteListName}
        onBack={onOpenRatingBack}
        onSubmit={onCompleteTasteRating}
        restaurants={selectedRestaurants}
      />
    );
  }

  if (screen === 'add-to-list-select') {
    return (
      <AddRestaurantToListSelectScreen
        lists={myLists}
        onBack={onBackFromAddToListSelect}
        onSelectLists={onAddToListSelectionComplete}
        restaurant={addToListRestaurant}
      />
    );
  }

  if (screen === 'add-to-list-rating') {
    return (
      <AddRestaurantToListRatingScreen
        lists={myLists.filter((item) => addToListTargetListIds.includes(item.id))}
        onBack={onOpenAddToListRatingBack}
        onSubmit={onSubmitAddToListRating}
        restaurant={addToListRestaurant}
      />
    );
  }

  if (screen === 'complete') {
    return <RegistrationCompleteScreen onComplete={onBackFromComplete} />;
  }

  return null;
}
