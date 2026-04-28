import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppTab } from '../components/BottomTabBar';
import { Restaurant } from '../data/restaurants';
import { AiChatScreen } from '../screens/AiChatScreen';
import { DeleteAccountScreen } from '../screens/DeleteAccountScreen';
import { EditNicknameScreen } from '../screens/EditNicknameScreen';
import { MainHomeScreen } from '../screens/MainHomeScreen';
import { MapScreen } from '../screens/MapScreen';
import { MapSearchScreen } from '../screens/MapSearchScreen';
import { LoginProvider, MyInfoScreen } from '../screens/MyInfoScreen';
import { MyPageScreen } from '../screens/MyPageScreen';
import { MyReviewsScreen } from '../screens/MyReviewsScreen';
import { NewsScreen } from '../screens/NewsScreen';
import { OnboardingIntroScreen } from '../screens/OnboardingIntroScreen';
import { OnboardingLoginScreen } from '../screens/OnboardingLoginScreen';
import { RankingDetailScreen } from '../screens/RankingDetailScreen';
import { RankingTabScreen } from '../screens/RankingTabScreen';
import { RegistrationCompleteScreen } from '../screens/RegistrationCompleteScreen';
import { RestaurantDetailScreen } from '../screens/RestaurantDetailScreen';
import { SearchResultScreen } from '../screens/SearchResultScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TasteRatingScreen } from '../screens/TasteRatingScreen';
import { TasteSelectionScreen } from '../screens/TasteSelectionScreen';

type FlowScreen =
  | 'login'
  | 'intro'
  | 'taste'
  | 'rating'
  | 'complete'
  | 'tabs'
  | 'ai-chat'
  | 'news'
  | 'search'
  | 'search-result'
  | 'map-search'
  | 'settings'
  | 'my-info'
  | 'my-reviews'
  | 'edit-nickname'
  | 'delete-account'
  | 'restaurant-detail';

type RankingDetailState = {
  sourceTab: AppTab;
  variant: 'local' | 'national';
} | null;

type RestaurantDetailSource =
  | { type: 'search-result' }
  | { type: 'my-reviews' }
  | { type: 'tabs'; tab: AppTab }
  | { type: 'ranking-detail'; detail: NonNullable<RankingDetailState> }
  | null;

export function AppRoot() {
  const [screen, setScreen] = useState<FlowScreen>('login');
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [rankingDetail, setRankingDetail] = useState<RankingDetailState>(null);
  const [selectedRestaurants, setSelectedRestaurants] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [loginProvider, setLoginProvider] = useState<LoginProvider>('kakao');
  const [nickname, setNickname] = useState('먹부림');
  const [selectedRestaurantName, setSelectedRestaurantName] = useState('와이앤웍');
  const [restaurantDetailSource, setRestaurantDetailSource] =
    useState<RestaurantDetailSource>(null);

  const openRankingDetail = (variant: 'local' | 'national') => {
    setRankingDetail({
      sourceTab: activeTab,
      variant,
    });
  };

  const handleBackFromRankingDetail = () => {
    if (!rankingDetail) {
      return;
    }

    setActiveTab(rankingDetail.sourceTab);
    setRankingDetail(null);
  };

  const openRestaurantDetail = (
    restaurantName: string,
    source: Exclude<RestaurantDetailSource, null>,
  ) => {
    setSelectedRestaurantName(restaurantName);
    setRestaurantDetailSource(source);
    setScreen('restaurant-detail');
  };

  const handleBackFromRestaurantDetail = () => {
    if (!restaurantDetailSource) {
      setScreen('tabs');
      return;
    }

    if (restaurantDetailSource.type === 'search-result') {
      setScreen('search-result');
      return;
    }

    if (restaurantDetailSource.type === 'my-reviews') {
      setScreen('my-reviews');
      return;
    }

    if (restaurantDetailSource.type === 'tabs') {
      setActiveTab(restaurantDetailSource.tab);
      setScreen('tabs');
      return;
    }

    setActiveTab(restaurantDetailSource.detail.sourceTab);
    setRankingDetail(restaurantDetailSource.detail);
    setScreen('tabs');
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      {screen === 'login' ? (
        <OnboardingLoginScreen
          onSelectLogin={(provider) => {
            if (provider === 'naver') {
              setScreen('tabs');
              setActiveTab('home');
              return;
            }

            setScreen('intro');
          }}
        />
      ) : screen === 'intro' ? (
        <OnboardingIntroScreen
          onPressNext={() => setScreen('taste')}
          userName={nickname}
        />
      ) : screen === 'taste' ? (
        <TasteSelectionScreen
          onBack={() => setScreen('intro')}
          onConfirm={(restaurants) => {
            setSelectedRestaurants(restaurants);
            setScreen('rating');
          }}
        />
      ) : screen === 'rating' ? (
        <TasteRatingScreen
          restaurants={selectedRestaurants}
          onBack={() => setScreen('taste')}
          onSubmit={() => setScreen('complete')}
        />
      ) : screen === 'complete' ? (
        <RegistrationCompleteScreen
          onComplete={() => {
            setScreen('tabs');
            setActiveTab('home');
          }}
        />
      ) : screen === 'ai-chat' ? (
        <AiChatScreen onBack={() => setScreen('tabs')} />
      ) : screen === 'news' ? (
        <NewsScreen onBack={() => setScreen('tabs')} />
      ) : screen === 'search' ? (
        <SearchScreen
          initialQuery={searchQuery}
          onClose={() => setScreen('tabs')}
          onSearch={(query) => {
            setSearchQuery(query);
            setScreen('search-result');
          }}
        />
      ) : screen === 'search-result' ? (
        <SearchResultScreen
          query={searchQuery}
          onBack={() => setScreen('search')}
          onOpenRestaurantDetail={(restaurantName) =>
            openRestaurantDetail(restaurantName, { type: 'search-result' })
          }
          onSearch={(query) => setSearchQuery(query)}
        />
      ) : screen === 'map-search' ? (
        <MapSearchScreen
          initialQuery={mapSearchQuery}
          onClose={() => {
            setActiveTab('map');
            setScreen('tabs');
          }}
          onSearch={(query) => {
            setMapSearchQuery(query);
            setActiveTab('map');
            setScreen('tabs');
          }}
        />
      ) : screen === 'restaurant-detail' ? (
        <RestaurantDetailScreen
          restaurantName={selectedRestaurantName}
          onBack={handleBackFromRestaurantDetail}
        />
      ) : screen === 'settings' ? (
        <SettingsScreen
          onBack={() => setScreen('tabs')}
          onOpenMyInfo={() => setScreen('my-info')}
          onOpenDeleteAccount={() => setScreen('delete-account')}
        />
      ) : screen === 'my-info' ? (
        <MyInfoScreen
          onBack={() => setScreen('settings')}
          onOpenEditNickname={() => setScreen('edit-nickname')}
          onChangeLoginProvider={setLoginProvider}
          loginProvider={loginProvider}
          nickname={nickname}
        />
      ) : screen === 'my-reviews' ? (
        <MyReviewsScreen
          onBack={() => setScreen('tabs')}
          onOpenRestaurantDetail={(restaurantName) =>
            openRestaurantDetail(restaurantName, { type: 'my-reviews' })
          }
        />
      ) : screen === 'edit-nickname' ? (
        <EditNicknameScreen
          initialNickname={nickname}
          onBack={() => setScreen('my-info')}
          onSubmit={(nextNickname) => {
            setNickname(nextNickname);
            setScreen('my-info');
          }}
        />
      ) : screen === 'delete-account' ? (
        <DeleteAccountScreen onBack={() => setScreen('settings')} />
      ) : rankingDetail ? (
        <RankingDetailScreen
          onBack={handleBackFromRankingDetail}
          onOpenRestaurantDetail={(restaurantName) =>
            openRestaurantDetail(restaurantName, {
              type: 'ranking-detail',
              detail: rankingDetail,
            })
          }
          variant={rankingDetail.variant}
        />
      ) : activeTab === 'home' ? (
        <MainHomeScreen
          onOpenRestaurantDetail={(restaurantName) =>
            openRestaurantDetail(restaurantName, { type: 'tabs', tab: 'home' })
          }
          onPressAi={() => setScreen('ai-chat')}
          onPressNews={() => setScreen('news')}
          onPressLocalRanking={() => openRankingDetail('local')}
          onPressNationalRanking={() => openRankingDetail('national')}
          onPressSearch={() => setScreen('search')}
          onSelectTab={setActiveTab}
        />
      ) : activeTab === 'ranking' ? (
        <RankingTabScreen
          onOpenRestaurantDetail={(restaurantName) =>
            openRestaurantDetail(restaurantName, { type: 'tabs', tab: 'ranking' })
          }
          onPressLocalRanking={() => openRankingDetail('local')}
          onPressNationalRanking={() => openRankingDetail('national')}
          onSelectTab={setActiveTab}
        />
      ) : activeTab === 'map' ? (
        <MapScreen
          onOpenRestaurantDetail={(restaurantName) =>
            openRestaurantDetail(restaurantName, { type: 'tabs', tab: 'map' })
          }
          onPressSearchBar={() => setScreen('map-search')}
          searchQuery={mapSearchQuery}
          onClearSearch={() => setMapSearchQuery('')}
          onSelectTab={setActiveTab}
        />
      ) : (
        <MyPageScreen
          nickname={nickname}
          onOpenMyReviews={() => setScreen('my-reviews')}
          onOpenSettings={() => setScreen('settings')}
          onSelectTab={setActiveTab}
        />
      )}
    </SafeAreaProvider>
  );
}
