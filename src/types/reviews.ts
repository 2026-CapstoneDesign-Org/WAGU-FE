export type ReviewMediaItem = {
  id: string;
  type: 'image' | 'video';
  uri: string;
  fileName?: string | null;
};
