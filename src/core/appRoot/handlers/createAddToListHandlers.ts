import { Alert } from 'react-native';
import type { Dispatch, SetStateAction } from 'react';

import { addRestaurantToList, searchRestaurants } from '../../../api/wagu';
import type { MyList } from '../../../types/myLists';
import type { Restaurant } from '../../../types/restaurants';
import type { AuthSession, FlowScreen } from '../types';

type CreateAddToListHandlersDeps = {
  addToListTargetListIds: string[];
  convertFiveStarToTenPoint: (value: number) => number;
  getAddToListRestaurant: () => Restaurant | null;
  getReadableApiErrorMessage: (error: unknown, fallback: string) => string;
  session: AuthSession | null;
  setCompletionSource: (source: 'taste-flow' | 'add-to-list') => void;
  setMyLists: Dispatch<SetStateAction<MyList[]>>;
  setScreen: (screen: FlowScreen) => void;
};

export function createAddToListHandlers({
  addToListTargetListIds,
  convertFiveStarToTenPoint,
  getAddToListRestaurant,
  getReadableApiErrorMessage,
  session,
  setCompletionSource,
  setMyLists,
  setScreen,
}: CreateAddToListHandlersDeps) {
  const handleAddRestaurantToListComplete = async (ratings: {
    taste: number;
    service: number;
    value: number;
  }) => {
    const restaurant = getAddToListRestaurant();

    if (!restaurant || addToListTargetListIds.length === 0) {
      return;
    }

    let nextRestaurantId = restaurant.id;
    let nextRestaurantName = restaurant.shortName || restaurant.name;
    let nextRestaurantAddress = restaurant.address ?? '';

    const applyLocalAdd = () => {
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
                id: nextRestaurantId,
                name: nextRestaurantName,
                address: nextRestaurantAddress,
                ratings,
              },
            ],
          };
        }),
      );
    };

    if (session?.accessToken) {
      try {
        const parsedListIds = addToListTargetListIds.map((listId) => Number(listId));

        if (parsedListIds.some((listId) => Number.isNaN(listId))) {
          throw new Error('invalid_list_id');
        }

        const candidates = await searchRestaurants(session.accessToken, restaurant.name);
        const matchedRestaurant =
          candidates.find((item) => item.name === restaurant.name) ??
          candidates.find((item) => item.name === restaurant.shortName) ??
          candidates[0];

        if (!matchedRestaurant) {
          throw new Error('restaurant_not_found');
        }

        nextRestaurantId = String(matchedRestaurant.id);
        nextRestaurantName = matchedRestaurant.name;
        nextRestaurantAddress = matchedRestaurant.address ?? restaurant.address ?? '';

        await Promise.all(
          parsedListIds.map((listId) =>
            addRestaurantToList(session.accessToken!, listId, {
              restaurantId: matchedRestaurant.id,
              tasteScore: convertFiveStarToTenPoint(ratings.taste),
              valueScore: convertFiveStarToTenPoint(ratings.value),
              moodScore: convertFiveStarToTenPoint(ratings.service),
            }),
          ),
        );
      } catch (error) {
        console.error('[AddToList] addRestaurantToList failed', error);
        Alert.alert(
          '안내',
          `리스트에 가게 점수를 저장하지 못했어요.\n${getReadableApiErrorMessage(
            error,
            '다시 시도해 주세요.',
          )}`,
        );
        return;
      }
    }

    applyLocalAdd();

    setCompletionSource('add-to-list');
    setScreen('complete');
  };

  return {
    handleAddRestaurantToListComplete,
  };
}
