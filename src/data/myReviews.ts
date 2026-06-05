import type { ReviewMediaItem } from '../types/reviews';

export type MyReview = {
  id: string;
  myReaction?: 'dislike' | 'like' | null;
  restaurantName: string;
  restaurantId?: string;
  restaurantImageUri?: string;
  category: string;
  date: string;
  content: string;
  likes: number;
  dislikes: number;
  media?: ReviewMediaItem[];
  imageUris?: string[];
};
