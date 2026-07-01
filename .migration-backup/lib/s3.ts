import "server-only";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * S3 storage for admin image uploads and AI-generated images. If
 * AWS_S3_PUBLIC_BASE_URL is set, objects are addressed by public URL; otherwise
 * a presigned GET URL is returned.
 */

let client: S3Client | null = null;

function s3(): S3Client {
  if (!client) client = new S3Client({ region: process.env.AWS_REGION });
  return client;
}

function bucket(): string {
  const b = process.env.AWS_S3_BUCKET;
  if (!b) throw new Error("AWS_S3_BUCKET is not configured.");
  return b;
}

export function buildKey(...parts: string[]): string {
  const prefix = process.env.AWS_S3_PREFIX ?? "ae-invitation";
  return [prefix, ...parts].filter(Boolean).join("/").replace(/\/{2,}/g, "/");
}

export async function uploadObject(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
): Promise<string> {
  await s3().send(
    new PutObjectCommand({ Bucket: bucket(), Key: key, Body: body, ContentType: contentType }),
  );
  return publicOrPresignedUrl(key);
}

export async function publicOrPresignedUrl(key: string): Promise<string> {
  const base = process.env.AWS_S3_PUBLIC_BASE_URL;
  if (base) return `${base.replace(/\/$/, "")}/${key}`;
  const ttl = Number(process.env.S3_PRESIGN_TTL_SECONDS ?? 60 * 60 * 24 * 7);
  return getSignedUrl(s3(), new GetObjectCommand({ Bucket: bucket(), Key: key }), {
    expiresIn: ttl,
  });
}
