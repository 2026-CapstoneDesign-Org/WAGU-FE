import type { MyListRestaurant } from './myLists';

export type UserProfile = {
  id: string;
  nickname: string;
  profileImageUrl?: string;
  followerCount?: string;
  followingCount?: string;
  honorPeriod?: string;
  honorTitle?: string;
  reliabilityGrade?: string;
  reliabilityScore?: number;
  reviewCount?: string;
  representativeListIsLiked?: boolean;
  representativeListId?: string;
  representativeListTitle: string;
  representativeAccentColor: string;
  representativeRestaurants: MyListRestaurant[];
  temperature?: string;
};
