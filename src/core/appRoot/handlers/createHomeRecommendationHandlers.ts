import {
  getFollowCount,
  getListRecommendations,
  getReliabilityScore,
  getRestaurantRecommendations,
  getUserRepresentativeList,
} from '../../../api/wagu';
import type { HomeProfileCardItem, HomeRestaurantCardItem } from '../../../screens/home/MainHomeScreen';
import type { UserProfile } from '../../../types/userProfiles';
import { normalizeReliabilityGrade } from '../../../utils/reliability';

type HomeRecommendationOptions = {
  cancelled?: () => boolean;
  retryOnEmpty?: boolean;
};

type CreateHomeRecommendationHandlersDeps = {
  hasRejectedAuthError: (results: PromiseSettledResult<unknown>[]) => boolean;
  homeProfileAccentColors: string[];
  setRecommendedMealFriendItems: (items: HomeProfileCardItem[]) => void;
  setRecommendedRestaurantItems: (items: HomeRestaurantCardItem[]) => void;
  setRecommendedUserProfiles: (profiles: UserProfile[]) => void;
};

export function createHomeRecommendationHandlers({
  hasRejectedAuthError,
  homeProfileAccentColors,
  setRecommendedMealFriendItems,
  setRecommendedRestaurantItems,
  setRecommendedUserProfiles,
}: CreateHomeRecommendationHandlersDeps) {
  const hydrateHomeRecommendations = async (
    token: string,
    options?: HomeRecommendationOptions,
  ) => {
    const applyRecommendations = async () => {
      const [restaurantRecommendationsResult, recommendationsResult] =
        await Promise.allSettled([
          getRestaurantRecommendations(token),
          getListRecommendations(token),
        ]);

      if (hasRejectedAuthError([restaurantRecommendationsResult, recommendationsResult])) {
        const authError =
          restaurantRecommendationsResult.status === 'rejected'
            ? restaurantRecommendationsResult.reason
            : recommendationsResult.status === 'rejected'
              ? recommendationsResult.reason
              : new Error('Authentication required.');

        throw authError;
      }

      if (restaurantRecommendationsResult.status === 'fulfilled') {
        console.log('[home recommendations][restaurants] success', {
          count: restaurantRecommendationsResult.value.items.length,
          ids: restaurantRecommendationsResult.value.items.map((item) => item.restaurantId),
        });
      } else {
        console.log(
          '[home recommendations][restaurants] failed',
          restaurantRecommendationsResult.reason,
        );
      }

      if (recommendationsResult.status === 'fulfilled') {
        console.log('[home recommendations][lists] success', {
          count: recommendationsResult.value.items.length,
          listIds: recommendationsResult.value.items.map((item) => item.listId),
          ownerIds: recommendationsResult.value.items.map((item) => item.owner.ownerId),
        });
      } else {
        console.log('[home recommendations][lists] failed', recommendationsResult.reason);
      }

      return { recommendationsResult, restaurantRecommendationsResult };
    };

    let { restaurantRecommendationsResult, recommendationsResult } = await applyRecommendations();

    if (
      options?.retryOnEmpty &&
      restaurantRecommendationsResult.status === 'fulfilled' &&
      recommendationsResult.status === 'fulfilled' &&
      restaurantRecommendationsResult.value.items.length === 0 &&
      recommendationsResult.value.items.length === 0
    ) {
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (options.cancelled?.()) {
        return;
      }

      ({ restaurantRecommendationsResult, recommendationsResult } = await applyRecommendations());
    }

    if (options?.cancelled?.()) {
      return;
    }

    if (restaurantRecommendationsResult.status === 'fulfilled') {
      setRecommendedRestaurantItems(
        restaurantRecommendationsResult.value.items.map((item) => ({
          id: `recommended-restaurant-${item.restaurantId}`,
          imageUri: item.imageUrl,
          name: item.restaurantName,
          restaurantId: item.restaurantId,
          restaurantName: item.restaurantName,
        })),
      );
    } else {
      setRecommendedRestaurantItems([]);
    }

    if (recommendationsResult.status === 'fulfilled') {
      const uniqueRecommendations = recommendationsResult.value.items.reduce<
        typeof recommendationsResult.value.items
      >((accumulator, item) => {
        if (accumulator.some((currentItem) => currentItem.owner.ownerId === item.owner.ownerId)) {
          return accumulator;
        }

        accumulator.push(item);
        return accumulator;
      }, []);

      const recommendedProfiles = await Promise.all(
        uniqueRecommendations.map(async (item, index) => {
          const [detailResult, followCountForOwnerResult, reliabilityResult] = await Promise.allSettled([
            getUserRepresentativeList(token, item.owner.ownerId),
            getFollowCount(token, item.owner.ownerId),
            getReliabilityScore(token, item.owner.ownerId),
          ]);

          if (detailResult.status !== 'fulfilled') {
            console.log('[home recommendations][lists] detail failed', {
              listId: item.listId,
              ownerId: item.owner.ownerId,
              reason: detailResult.reason,
            });
          }

          if (followCountForOwnerResult.status !== 'fulfilled') {
            console.log('[home recommendations][lists] follow count failed', {
              ownerId: item.owner.ownerId,
              reason: followCountForOwnerResult.reason,
            });
          }

          const representativeRestaurants =
            detailResult.status === 'fulfilled'
              ? detailResult.value.restaurants.slice(0, 5).map((restaurantItem) => ({
                  address: restaurantItem.restaurant.address,
                  id: String(restaurantItem.restaurant.id),
                  imageUri: restaurantItem.restaurant.imageUrl,
                  name: restaurantItem.restaurant.name,
                }))
              : [];

          return {
            card: {
              id: String(item.owner.ownerId),
              imageUri: item.owner.profileImageUrl,
              name: item.owner.nickname,
              reliabilityGrade:
                reliabilityResult.status === 'fulfilled'
                  ? normalizeReliabilityGrade(reliabilityResult.value.grade) ?? undefined
                  : undefined,
            },
            profile: {
              followerCount:
                followCountForOwnerResult.status === 'fulfilled'
                  ? String(followCountForOwnerResult.value.followerCount)
                  : undefined,
              id: String(item.owner.ownerId),
              nickname: item.owner.nickname,
              profileImageUrl: item.owner.profileImageUrl,
              reliabilityGrade:
                reliabilityResult.status === 'fulfilled'
                  ? normalizeReliabilityGrade(reliabilityResult.value.grade) ?? undefined
                  : undefined,
              representativeAccentColor:
                homeProfileAccentColors[index % homeProfileAccentColors.length],
              representativeListIsLiked: item.isLiked ?? false,
              representativeListId: String(item.listId),
              representativeListTitle: item.title,
              representativeRestaurants,
            },
          };
        }),
      );

      if (options?.cancelled?.()) {
        return;
      }

      const limitedRecommendedProfiles = recommendedProfiles.slice(0, 5);

      console.log('[home recommendations][lists] hydrated', {
        count: limitedRecommendedProfiles.length,
        withRepresentativeRestaurants: recommendedProfiles.filter(
          (item) => item.profile.representativeRestaurants.length > 0,
        ).length,
      });
      setRecommendedMealFriendItems(limitedRecommendedProfiles.map((item) => item.card));
      setRecommendedUserProfiles(limitedRecommendedProfiles.map((item) => item.profile));
    } else {
      setRecommendedMealFriendItems([]);
      setRecommendedUserProfiles([]);
    }
  };

  return {
    hydrateHomeRecommendations,
  };
}
