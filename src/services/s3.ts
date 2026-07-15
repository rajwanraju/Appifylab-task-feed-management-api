import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { config } from '../config';
import { AppError } from '../shared/errors';

const s3Client = new S3Client({
  region: config.s3.region,
  endpoint: config.s3.endpoint,
  forcePathStyle: true,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
  },
});

const BUCKET = config.s3.bucket;

async function ensureBucket(): Promise<void> {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET }));
  } catch {
    await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET }));
  }
}

const bucketReady = ensureBucket();

export async function uploadFile(buffer: Buffer, filename: string, mimetype: string): Promise<string> {
  try {
    await bucketReady;
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: filename,
        Body: buffer,
        ContentType: mimetype,
      }),
    );
    return filename;
  } catch {
    throw new AppError('Failed to upload file to storage', 500);
  }
}

export async function deleteFile(key: string): Promise<void> {
  try {
    await bucketReady;
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
      }),
    );
  } catch {
    // ignore if file doesn't exist
  }
}
