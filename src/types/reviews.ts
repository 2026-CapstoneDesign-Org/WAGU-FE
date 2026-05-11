export type ReviewMediaItem = {
  fileName?: string | null;
  id: string;
  mimeType?: string | null;
  type: 'image' | 'video';
  uri: string;
};
