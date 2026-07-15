import { config } from '../config';

const imageFields = new Set([
  'image',
  'image_url',
  'imageUrl',
  'icon',
  'banner',
  'logo',
  'thumbnail',
  'favicon',
  'avatar',
  'video_url',
  'videoUrl',
]);

function transformValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') {
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    const key = value.startsWith('/') ? value.split('/').pop()! : value;
    return `${config.s3.publicUrl}/${config.s3.bucket}/${key}`;
  }
  return value;
}

export function transformImageUrls(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data.map(transformImageUrls);
  }
  if (data !== null && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      if (imageFields.has(key)) {
        result[key] = transformValue(obj[key]);
      } else {
        result[key] = transformImageUrls(obj[key]);
      }
    }
    return result;
  }
  return data;
}
