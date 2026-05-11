import { apiRequest } from './client';

export type UploadType = 'PROFILE' | 'RESTAURANT' | 'REVIEW';

type PresignedUrlResponse = {
  imageUrl: string;
  presignedUrl: string;
};

type UploadImageParams = {
  fileName?: string | null;
  mimeType?: string | null;
  token: string;
  type: UploadType;
  uri: string;
};

function getExtensionFromMimeType(mimeType?: string | null) {
  if (!mimeType) {
    return null;
  }

  const normalized = mimeType.toLowerCase();

  if (normalized === 'image/jpeg' || normalized === 'image/jpg') {
    return 'jpg';
  }

  if (normalized === 'image/png') {
    return 'png';
  }

  if (normalized === 'image/webp') {
    return 'webp';
  }

  const [, subtype] = normalized.split('/');
  return subtype || null;
}

function getExtensionFromUri(uri: string) {
  const match = uri.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/);
  return match?.[1]?.toLowerCase() || null;
}

function buildUploadFileName({
  fileName,
  mimeType,
  type,
  uri,
}: Pick<UploadImageParams, 'fileName' | 'mimeType' | 'type' | 'uri'>) {
  const cleanedFileName = fileName?.trim();

  if (cleanedFileName) {
    return cleanedFileName;
  }

  const extension = getExtensionFromMimeType(mimeType) || getExtensionFromUri(uri) || 'jpg';
  return `${type.toLowerCase()}-${Date.now()}.${extension}`;
}

export async function getPresignedUploadUrl(
  token: string,
  params: { filename: string; type: UploadType },
) {
  return apiRequest<PresignedUrlResponse>('/upload/presigned', {
    query: params,
    token,
  });
}

export async function uploadImageWithPresignedUrl({
  fileName,
  mimeType,
  token,
  type,
  uri,
}: UploadImageParams) {
  const resolvedFileName = buildUploadFileName({ fileName, mimeType, type, uri });
  const { imageUrl, presignedUrl } = await getPresignedUploadUrl(token, {
    filename: resolvedFileName,
    type,
  });

  const localFileResponse = await fetch(uri);

  if (!localFileResponse.ok) {
    throw new Error('업로드할 이미지를 읽지 못했어요.');
  }

  const blob = await localFileResponse.blob();
  const contentType = mimeType || blob.type || 'image/jpeg';
  const uploadResponse = await fetch(presignedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    body: blob,
  });

  if (!uploadResponse.ok) {
    throw new Error('이미지를 업로드하지 못했어요.');
  }

  return imageUrl;
}
