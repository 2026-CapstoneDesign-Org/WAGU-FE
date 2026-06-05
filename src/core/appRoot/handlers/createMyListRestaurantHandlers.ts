import type { Dispatch, SetStateAction } from 'react';

import { Alert } from 'react-native';

import {
  removeRestaurantFromList,
  searchRestaurants,
  updateRestaurantInList,
} from '../../../api/wagu';
import type { MyList } from '../../../types/myLists';
import type { AuthSession } from '../types';

type CreateMyListRestaurantHandlersDeps = {
  myLists: MyList[];
  session: AuthSession | null;
  setMyLists: Dispatch<SetStateAction<MyList[]>>;
};

const convertFiveStarToTenPoint = (value: number) => value * 2;

export function createMyListRestaurantHandlers({
  myLists,
  session,
  setMyLists,
}: CreateMyListRestaurantHandlersDeps) {
  const handleRemoveRestaurantsFromMyList = async (
    listId: string,
    restaurantIds: string[],
  ) => {
    if (restaurantIds.length === 0) {
      return;
    }

    const applyLocalRemove = () => {
      setMyLists((current) =>
        current.map((list) =>
          list.id === listId
            ? {
                ...list,
                restaurants: list.restaurants.filter(
                  (restaurant) => !restaurantIds.includes(restaurant.id),
                ),
                restaurantCount: list.restaurants.filter(
                  (restaurant) => !restaurantIds.includes(restaurant.id),
                ).length,
              }
            : list,
        ),
      );
    };

    if (!session?.accessToken) {
      applyLocalRemove();
      return;
    }

    const parsedListId = Number(listId);

    if (Number.isNaN(parsedListId)) {
      applyLocalRemove();
      return;
    }

    const currentList = myLists.find((list) => list.id === listId);

    try {
      const resolvedRestaurantIds = await Promise.all(
        restaurantIds.map(async (restaurantId) => {
          const parsedRestaurantId = Number(restaurantId);

          if (!Number.isNaN(parsedRestaurantId)) {
            return parsedRestaurantId;
          }

          const targetRestaurant = currentList?.restaurants.find(
            (restaurant) => restaurant.id === restaurantId,
          );

          if (!targetRestaurant) {
            throw new Error('restaurant_not_found');
          }

          const candidates = await searchRestaurants(session.accessToken!, targetRestaurant.name);
          const matchedRestaurant =
            candidates.find((item) => item.name === targetRestaurant.name) ?? candidates[0];

          if (!matchedRestaurant) {
            throw new Error('restaurant_not_found');
          }

          return matchedRestaurant.id;
        }),
      );

      await Promise.all(
        resolvedRestaurantIds.map((restaurantId) =>
          removeRestaurantFromList(session.accessToken!, parsedListId, restaurantId),
        ),
      );
      applyLocalRemove();
    } catch {
      Alert.alert('?덈궡', '媛寃뚮? ??젣?섏? 紐삵뻽?듬땲??');
    }
  };

  const handleUpdateRestaurantRatingsInMyList = async (
    listId: string,
    restaurantId: string,
    ratings: {
      taste: number;
      service: number;
      value: number;
    },
  ) => {
    const applyLocalUpdate = () => {
      setMyLists((current) =>
        current.map((list) =>
          list.id === listId
            ? {
                ...list,
                restaurants: list.restaurants.map((restaurant) =>
                  restaurant.id === restaurantId
                    ? {
                        ...restaurant,
                        ratings,
                      }
                    : restaurant,
                ),
              }
            : list,
        ),
      );
    };

    if (!session?.accessToken) {
      applyLocalUpdate();
      return;
    }

    const parsedListId = Number(listId);

    if (Number.isNaN(parsedListId)) {
      applyLocalUpdate();
      return;
    }

    const currentList = myLists.find((list) => list.id === listId);
    const targetRestaurant = currentList?.restaurants.find(
      (restaurant) => restaurant.id === restaurantId,
    );

    if (!targetRestaurant) {
      return;
    }

    try {
      const candidateRestaurantIds: number[] = [];
      const parsedRestaurantId = Number(restaurantId);

      if (!Number.isNaN(parsedRestaurantId)) {
        candidateRestaurantIds.push(parsedRestaurantId);
      }

      const parsedListItemId = Number(targetRestaurant.listItemId);

      if (!Number.isNaN(parsedListItemId) && !candidateRestaurantIds.includes(parsedListItemId)) {
        candidateRestaurantIds.push(parsedListItemId);
      }

      if (candidateRestaurantIds.length === 0) {
        const candidates = await searchRestaurants(session.accessToken, targetRestaurant.name);
        const matchedRestaurant =
          candidates.find((item) => item.name === targetRestaurant.name) ?? candidates[0];

        if (!matchedRestaurant) {
          throw new Error('restaurant_not_found');
        }

        candidateRestaurantIds.push(matchedRestaurant.id);
      }

      let updated = false;
      let lastError: unknown = null;

      for (const candidateRestaurantId of candidateRestaurantIds) {
        try {
          await updateRestaurantInList(session.accessToken, parsedListId, candidateRestaurantId, {
            tasteScore: convertFiveStarToTenPoint(ratings.taste),
            moodScore: convertFiveStarToTenPoint(ratings.service),
            valueScore: convertFiveStarToTenPoint(ratings.value),
          });
          updated = true;
          break;
        } catch (error) {
          lastError = error;
        }
      }

      if (!updated) {
        throw lastError ?? new Error('update_failed');
      }

      applyLocalUpdate();
    } catch {
      Alert.alert('?덈궡', '媛寃??먯닔瑜??섏젙?섏? 紐삵뻽?듬땲??');
    }
  };

  return {
    handleRemoveRestaurantsFromMyList,
    handleUpdateRestaurantRatingsInMyList,
  };
}
