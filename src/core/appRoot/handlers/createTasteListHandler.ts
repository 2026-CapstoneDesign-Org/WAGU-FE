import { Alert } from 'react-native';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';

import {
  addExternalRestaurantToListFallback,
  createList,
  searchRestaurants,
  setRepresentativeList,
  toggleListVisibility,
} from '../../../api/wagu';
import type { MyList } from '../../../types/myLists';
import type { Restaurant } from '../../../types/restaurants';
import type { AuthSession } from '../types';

type CreateTasteListHandlerDeps = {
  appendNewList: (title: string, selected: Restaurant[]) => MyList;
  convertFiveStarToTenPoint: (value: number) => number;
  createTasteListLockRef: MutableRefObject<boolean>;
  delay: (ms: number) => Promise<void>;
  getReadableApiErrorMessage: (error: unknown, fallback: string) => string;
  hydrateHomeRecommendations: (
    token: string,
    options?: { cancelled?: () => boolean; retryOnEmpty?: boolean },
  ) => Promise<void>;
  isUserNotFoundApiError: (error: unknown) => boolean;
  myLists: MyList[];
  refreshMyLists: (accessToken: string) => Promise<MyList[]>;
  searchRestaurantsLocal: (token: string, query: string) => ReturnType<typeof searchRestaurants>;
  session: AuthSession | null;
  setMyLists: Dispatch<SetStateAction<MyList[]>>;
  setRepresentativeListRemote: typeof setRepresentativeList;
  tasteFlowSource: 'my-lists' | 'onboarding';
  toggleListVisibilityRemote: typeof toggleListVisibility;
  waitForServerUserReady: (token: string, attempts?: number) => Promise<boolean>;
};

export function createTasteListHandler({
  appendNewList,
  convertFiveStarToTenPoint,
  createTasteListLockRef,
  delay,
  getReadableApiErrorMessage,
  hydrateHomeRecommendations,
  isUserNotFoundApiError,
  myLists,
  refreshMyLists,
  searchRestaurantsLocal,
  session,
  setMyLists,
  setRepresentativeListRemote,
  tasteFlowSource,
  toggleListVisibilityRemote,
  waitForServerUserReady,
}: CreateTasteListHandlerDeps) {
  const createTasteList = async (
    title: string,
    selected: Restaurant[],
    ratings: Record<string, Record<'맛' | '서비스' | '가성비', number>>,
  ) => {
    if (createTasteListLockRef.current) {
      return;
    }

    createTasteListLockRef.current = true;

    try {
      if (!session?.accessToken) {
        if (tasteFlowSource === 'my-lists' && title.trim()) {
          const nextList = appendNewList(title.trim(), selected);
          setMyLists((current) => [...current, nextList]);
        }
        return;
      }

      const internalRestaurants = selected.filter((restaurant) => !restaurant.externalPlaceId);
      const externalRestaurants = selected.filter(
        (restaurant): restaurant is Restaurant & { externalPlaceId: string } =>
          Boolean(restaurant.externalPlaceId),
      );

      if (internalRestaurants.length === 0) {
        throw new Error('리스트를 만들려면 검색된 가게를 한 곳 이상 선택해 주세요.');
      }

      if (internalRestaurants.length < 5) {
        const missingCount = 5 - internalRestaurants.length;
        throw new Error(
          `외부 식당은 첫 리스트 생성의 최소 개수에 포함되지 않아요. 일반 가게를 ${missingCount}곳 더 선택해 주세요.`,
        );
      }

      const resolvedRestaurants = await Promise.all(
        internalRestaurants.map(async (restaurant) => {
          const candidates = await searchRestaurantsLocal(session.accessToken!, restaurant.name);
          const matched =
            candidates.find((item) => item.name === restaurant.name) ??
            candidates.find((item) => item.name === restaurant.shortName) ??
            candidates[0];

          if (!matched) {
            throw new Error(`${restaurant.name} 식당을 서버에서 찾지 못했어요.`);
          }

          return matched;
        }),
      );

      const regionName =
        resolvedRestaurants[0]?.regionName ??
        selected[0]?.address?.split(' ')[0] ??
        '용인';

      const existingListCount = myLists.length;

      let createdList: Awaited<ReturnType<typeof createList>> | null = null;

      try {
        const createListBody = {
          isPublic: true,
          title: title.trim(),
          regionName,
          restaurants: internalRestaurants.map((restaurant, index) => {
            const rating = ratings[restaurant.id];
            const resolvedRestaurant = resolvedRestaurants[index];

            return {
              restaurantId: resolvedRestaurant.id,
              tasteScore: convertFiveStarToTenPoint(rating['맛']),
              valueScore: convertFiveStarToTenPoint(rating['가성비']),
              moodScore: convertFiveStarToTenPoint(rating['서비스']),
            };
          }),
        };

        let lastCreateListError: unknown = null;

        for (let attempt = 0; attempt < 3; attempt += 1) {
          try {
            createdList = await createList(session.accessToken, createListBody);
            lastCreateListError = null;
            break;
          } catch (error) {
            lastCreateListError = error;

            if (!isUserNotFoundApiError(error) || attempt === 2) {
              throw error;
            }

            console.warn(
              `[TasteList] createList user-not-found retry ${attempt + 1}/3`,
              error,
            );
            await waitForServerUserReady(session.accessToken, 2);
            await delay(500 * (attempt + 1));
          }
        }

        if (lastCreateListError || !createdList) {
          throw lastCreateListError;
        }
      } catch (error) {
        console.error('[TasteList] createList failed', error);
        Alert.alert(
          '안내',
          `리스트 생성 중 문제가 발생했어요.\n${getReadableApiErrorMessage(
            error,
            '다시 시도해 주세요.',
          )}`,
        );
        return;
      }

      if (!createdList.isPublic) {
        await toggleListVisibilityRemote(session.accessToken, createdList.id);
      }

      try {
        await Promise.all(
          externalRestaurants.map((restaurant) => {
            const rating = ratings[restaurant.id];

            return addExternalRestaurantToListFallback(session.accessToken!, createdList.id, {
              externalPlaceId: restaurant.externalPlaceId,
              searchQuery: restaurant.externalSearchQuery ?? restaurant.name,
              tasteScore: convertFiveStarToTenPoint(rating['맛']),
              valueScore: convertFiveStarToTenPoint(rating['가성비']),
              moodScore: convertFiveStarToTenPoint(rating['서비스']),
            });
          }),
        );
      } catch (error) {
        console.error('[TasteList] addExternalRestaurantToListFallback failed', error);
        Alert.alert(
          '안내',
          `외부 가게 평점 저장 중 문제가 발생했어요.\n${getReadableApiErrorMessage(
            error,
            '다시 시도해 주세요.',
          )}`,
        );
        return;
      }

      if (existingListCount === 0) {
        await setRepresentativeListRemote(session.accessToken, createdList.id);
      }

      await refreshMyLists(session.accessToken);

      try {
        await hydrateHomeRecommendations(session.accessToken, { retryOnEmpty: true });
      } catch (error) {
        console.log('[TasteList] home recommendations refresh failed', error);
      }
    } finally {
      createTasteListLockRef.current = false;
    }
  };

  return {
    createTasteList,
  };
}
