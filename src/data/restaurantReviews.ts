import type { ReviewMediaItem } from '../types/reviews';

export type RestaurantReview = {
  id: string;
  authorUserId?: number;
  restaurantName: string;
  authorName: string;
  myReaction?: 'dislike' | 'like' | null;
  isFollowing?: boolean;
  isOwner?: boolean;
  date: string;
  content: string;
  likes: number;
  dislikes: number;
  media?: ReviewMediaItem[];
  imageUris?: string[];
};
