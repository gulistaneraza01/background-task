import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Works with AWS S3 or any S3-compatible store (e.g. Supabase Storage via S3_ENDPOINT).
// Credentials come from AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY.
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  endpoint: process.env.S3_ENDPOINT || undefined,
  forcePathStyle: !!process.env.S3_ENDPOINT,
});
const Bucket = process.env.S3_BUCKET!;

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const URL_TTL_SECONDS = 3600;

// Browser PUTs the file straight to this URL (presigned POST isn't supported by Supabase S3).
// The size can't be enforced in the signature, so completeImage checks it with objectInfo.
export const presignUpload = (Key: string, ContentType: string) =>
  getSignedUrl(s3, new PutObjectCommand({ Bucket, Key, ContentType }), { expiresIn: 600 });

export async function objectInfo(Key: string) {
  try {
    const { ContentLength } = await s3.send(new HeadObjectCommand({ Bucket, Key }));
    return { size: ContentLength ?? 0 };
  } catch (err) {
    if ((err as { name?: string }).name === "NotFound") return null;
    throw err;
  }
}

export const deleteObject = (Key: string) => s3.send(new DeleteObjectCommand({ Bucket, Key }));

export async function getObject(Key: string) {
  const { Body } = await s3.send(new GetObjectCommand({ Bucket, Key }));
  return Buffer.from(await Body!.transformToByteArray());
}

export const putObject = (Key: string, Body: Buffer, ContentType: string) =>
  s3.send(new PutObjectCommand({ Bucket, Key, Body, ContentType }));

export const signedUrl = (Key: string) =>
  getSignedUrl(s3, new GetObjectCommand({ Bucket, Key }), { expiresIn: URL_TTL_SECONDS });
