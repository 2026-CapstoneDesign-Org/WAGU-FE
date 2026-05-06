import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppTab } from '../components/BottomTabBar';
import { FriendTabKey } from '../data/myFriends';
import { initialMyLists, MyList } from '../data/myLists';
import { Restaurant, restaurants as initialRestaurantPool } from '../data/restaurants';
import { AddRestaurantToListRatingScreen } from '../screens/AddRestaurantToListRatingScreen';
import { AddRestaurantToListSelectScreen } from '../screens/AddRestaurantToListSelectScreen';
import { AiChatScreen } from '../screens/AiChatScreen';
import { DeleteAccountScreen } from '../screens/DeleteAccountScreen';
import { EditNicknameScreen } from '../screens/EditNicknameScreen';
import { MainHomeScreen } from '../screens/MainHomeScreen';
import { MapScreen } from '../screens/MapScreen';
import { MapSearchScreen } from '../screens/MapSearchScreen';
import { LoginProvider, MyInfoScreen } from '../screens/MyInfoScreen';
import { MyFriendsScreen } from '../screens/MyFriendsScreen';
import { MyListDetailScreen } from '../screens/MyListDetailScreen';
import { MyListPlaceEditScreen } from '../screens/MyListPlaceEditScreen';
import { MyListsScreen } from '../screens/MyListsScreen';
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
import { TasteListNameScreen } from '../screens/TasteListNameScreen';
import { TasteSelectionScreen } from '../screens/TasteSelectionScreen';

type FlowScreen =
  | 'login'
  | 'intro'
  | 'taste'
  | 'taste-list-name'
  | 'rating'
  | 'complete'
  | 'add-to-list-select'
  | 'add-to-list-rating'
  | 'tabs'
  | 'ai-chat'
  | 'news'
  | 'search'
  | 'search-result'
  | 'map-search'
  | 'settings'
  | 'my-info'
  | 'my-friends'
  | 'my-lists'
  | 'my-list-detail'
  | 'my-list-place-edit'
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
  | { type: 'my-list-detail'; listId: string }
  | { type: 'tabs'; tab: AppTab }
  | { type: 'ranking-detail'; detail: NonNullable<RankingDetailState> }
  | null;

export function AppRoot() {
  const [completionSource, setCompletionSource] = useState<'taste-flow' | 'add-to-list'>(
    'taste-flow',
  );
  const [tasteFlowSource, setTasteFlowSource] = useState<'onboarding' | 'my-lists'>(
    'onboarding',
  );
  const [screen, setScreen] = useState<FlowScreen>('login');
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [rankingDetail, setRankingDetail] = useState<RankingDetailState>(null);
  const [selectedRestaurants, setSelectedRestaurants] = useState<Restaurant[]>([]);
  const [tasteListName, setTasteListName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [myFriendsInitialTab, setMyFriendsInitialTab] =
    useState<FriendTabKey>('following');
  const [myLists, setMyLists] = useState<MyList[]>(initialMyLists);
  const [selectedMyListId, setSelectedMyListId] = useState<string | null>(null);
  const [loginProvider, setLoginProvider] = useState<LoginProvider>('kakao');
  const [nickname, setNickname] = useState('먹부림');
  const [selectedRestaurantName, setSelectedRestaurantName] = useState('와이앤웍');
  const [restaurantDetailSource, setRestaurantDetailSource] =
    useState<RestaurantDetailSource>(null);
  const [addToListSource, setAddToListSource] = useState<'restaurant-detail' | 'map' | null>(
    null,
  );
  const [addToListRestaurantId, setAddToListRestaurantId] = useState<string | null>(null);
  const [addToListTargetListIds, setAddToListTargetListIds] = useState<string[]>([]);

  const appendNewList = (title: string, selected: Restaurant[]) => {
    const accentPalette = ['#F46A67', '#56CDB5', '#8361C8', '#F6B033', '#5D8DF4', '#E96DC0'];
    const nextList: MyList = {
      id: `my-list-${Date.now()}`,
      title,
      isRepresentative: false,
      isPrivate: false,
      restaurantCount: selected.length,
      accentColor: accentPalette[myLists.length % accentPalette.length],
      restaurants: selected.map((restaurant) => ({
        id: restaurant.id,
        name: restaurant.shortName || restaurant.name,
        address: restaurant.address ?? '',
      })),
    };

    setMyLists((current) => [...current, nextList]);
  };

  const getFavoriteColor = (restaurantName: string) => {
    const normalizedName = restaurantName.trim();
    const resolvedRestaurant = initialRestaurantPool.find(
      (restaurant) =>
        restaurant.id === normalizedName ||
        restaurant.name === normalizedName ||
        restaurant.shortName === normalizedName,
    );
    const orderedLists = [
      ...myLists.filter((list) => list.isRepresentative),
      ...myLists.filter((list) => !list.isRepresentative),
    ];

    const matchedList = orderedLists.find((list) =>
      list.restaurants.some(
        (restaurant) =>
          restaurant.id === resolvedRestaurant?.id ||
          restaurant.name === resolvedRestaurant?.name ||
          restaurant.name === resolvedRestaurant?.shortName ||
          restaurant.name === normalizedName ||
          restaurant.id === normalizedName,
      ),
    );

    return matchedList?.accentColor ?? '#D9D9D9';
  };

  const resolveRestaurant = (restaurantName: string) =>
    initialRestaurantPool.find(
      (restaurant) =>
        restaurant.id === restaurantName ||
        restaurant.name === restaurantName ||
        restaurant.shortName === restaurantName,
    ) ?? null;

  const openAddRestaurantToListFlow = (
    restaurantName: string,
    source: 'restaurant-detail' | 'map',
  ) => {
    const restaurant = resolveRestaurant(restaurantName);

    if (!restaurant) {
      return;
    }

    setAddToListSource(source);
    setAddToListRestaurantId(restaurant.id);
    setAddToListTargetListIds([]);
    setScreen('add-to-list-select');
  };

  const handleAddRestaurantToListComplete = (ratings: {
    taste: number;
    service: number;
    value: number;
  }) => {
    const restaurant = initialRestaurantPool.find((item) => item.id === addToListRestaurantId);

    if (!restaurant || addToListTargetListIds.length === 0) {
      return;
    }

    setMyLists((current) =>
      current.map((list) => {
        if (!addToListTargetListIds.includes(list.id)) {
          return list;
        }

        if (list.restaurants.some((item) => item.id === restaurant.id)) {
          return list;
        }

        return {
          ...list,
          restaurantCount: list.restaurantCount + 1,
          restaurants: [
            ...list.restaurants,
            {
              id: restaurant.id,
              name: restaurant.shortName || restaurant.name,
              address: restaurant.address ?? '',
              ratings,
            },
          ],
        };
      }),
    );

    setCompletionSource('add-to-list');
    setScreen('complete');
  };

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

    if (restaurantDetailSource.type === 'my-list-detail') {
      setSelectedMyListId(restaurantDetailSource.listId);
      setScreen('my-list-detail');
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
          onPressNext={() => {
            setTasteFlowSource('onboarding');
            setScreen('taste');
          }}
          userName={nickname}
        />
      ) : screen === 'taste' ? (
        <TasteSelectionScreen
          onBack={() => setScreen(tasteFlowSource === 'my-lists' ? 'my-lists' : 'intro')}
          onConfirm={(restaurants) => {
            setSelectedRestaurants(restaurants);
            setScreen('taste-list-name');
          }}
        />
      ) : screen === 'taste-list-name' ? (
        <TasteListNameScreen
          nickname={nickname}
          mode={tasteFlowSource === 'my-lists' ? 'new-list' : 'first-list'}
          onBack={() => setScreen('taste')}
          onSubmit={(name) => {
            setTasteListName(name);
            setScreen('rating');
          }}
        />
      ) : screen === 'rating' ? (
        <TasteRatingScreen
          listName={tasteListName}
          restaurants={selectedRestaurants}
          onBack={() => setScreen('taste-list-name')}
          onSubmit={() => {
            if (tasteFlowSource === 'my-lists' && tasteListName.trim()) {
              appendNewList(tasteListName.trim(), selectedRestaurants);
            }

            setCompletionSource('taste-flow');
            setScreen('complete');
          }}
        />
      ) : screen === 'add-to-list-select' ? (
        <AddRestaurantToListSelectScreen
          restaurant={
            initialRestaurantPool.find((item) => item.id === addToListRestaurantId) ??
            initialRestaurantPool[0]
          }
          lists={myLists}
          onBack={() => {
            if (addToListSource === 'restaurant-detail') {
              setScreen('restaurant-detail');
              return;
            }

            setActiveTab('map');
            setScreen('tabs');
          }}
            onSelectLists={(listIds) => {
              setAddToListTargetListIds(listIds);
              setScreen('add-to-list-rating');
            }}
          />
        ) : screen === 'add-to-list-rating' ? (
          <AddRestaurantToListRatingScreen
            restaurant={
              initialRestaurantPool.find((item) => item.id === addToListRestaurantId) ??
              initialRestaurantPool[0]
            }
            lists={myLists.filter((item) => addToListTargetListIds.includes(item.id))}
            onBack={() => setScreen('add-to-list-select')}
            onSubmit={handleAddRestaurantToListComplete}
          />
      ) : screen === 'complete' ? (
        <RegistrationCompleteScreen
          onComplete={() => {
            if (completionSource === 'add-to-list') {
              const nextSource = addToListSource;
              setAddToListSource(null);
              setAddToListRestaurantId(null);
              setAddToListTargetListIds([]);
              setCompletionSource('taste-flow');

              if (nextSource === 'restaurant-detail') {
                setScreen('restaurant-detail');
                return;
              }

              setActiveTab('map');
              setScreen('tabs');
              return;
            }

            if (tasteFlowSource === 'my-lists') {
              setTasteFlowSource('onboarding');
              setSelectedRestaurants([]);
              setTasteListName('');
              setScreen('my-lists');
              return;
            }

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
          favoriteColor={getFavoriteColor(selectedRestaurantName)}
          onAddToList={(restaurantName) =>
            openAddRestaurantToListFlow(restaurantName, 'restaurant-detail')
          }
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
      ) : screen === 'my-friends' ? (
        <MyFriendsScreen
          initialTab={myFriendsInitialTab}
          onBack={() => setScreen('tabs')}
        />
      ) : screen === 'my-lists' ? (
        <MyListsScreen
          lists={myLists}
          onBack={() => setScreen('tabs')}
          onChangeLists={setMyLists}
          onCreateList={() => {
            setTasteFlowSource('my-lists');
            setSelectedRestaurants([]);
            setTasteListName('');
            setScreen('taste');
          }}
          onOpenList={(listId) => {
            setSelectedMyListId(listId);
            setScreen('my-list-detail');
          }}
        />
      ) : screen === 'my-list-detail' && selectedMyListId ? (
        <MyListDetailScreen
          list={myLists.find((item) => item.id === selectedMyListId) ?? myLists[0]}
          lists={myLists}
          onBack={() => setScreen('my-lists')}
          onChangeLists={setMyLists}
          onOpenPlaceEdit={() => setScreen('my-list-place-edit')}
          onOpenRestaurantDetail={(restaurantName) =>
            openRestaurantDetail(restaurantName, {
              type: 'my-list-detail',
              listId: selectedMyListId,
            })
          }
        />
      ) : screen === 'my-list-place-edit' && selectedMyListId ? (
        <MyListPlaceEditScreen
          list={myLists.find((item) => item.id === selectedMyListId) ?? myLists[0]}
          lists={myLists}
          onBack={() => setScreen('my-list-detail')}
          onChangeLists={setMyLists}
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
          onAddToList={(restaurantName) =>
            openAddRestaurantToListFlow(restaurantName, 'map')
          }
          getFavoriteColor={getFavoriteColor}
          onPressSearchBar={() => setScreen('map-search')}
          searchQuery={mapSearchQuery}
          onClearSearch={() => setMapSearchQuery('')}
          onSelectTab={setActiveTab}
        />
      ) : (
        <MyPageScreen
          nickname={nickname}
          myLists={myLists}
          onOpenMyFollowers={() => {
            setMyFriendsInitialTab('followers');
            setScreen('my-friends');
          }}
          onOpenMyFriends={() => {
            setMyFriendsInitialTab('following');
            setScreen('my-friends');
          }}
          onOpenMyLists={() => setScreen('my-lists')}
          onOpenRepresentativeList={(listId) => {
            setSelectedMyListId(listId);
            setScreen('my-list-detail');
          }}
          onOpenRestaurantDetail={(restaurantName) =>
            openRestaurantDetail(restaurantName, { type: 'tabs', tab: 'my' })
          }
          onOpenMyReviews={() => setScreen('my-reviews')}
          onOpenSettings={() => setScreen('settings')}
          onSelectTab={setActiveTab}
        />
      )}
    </SafeAreaProvider>
  );
}
