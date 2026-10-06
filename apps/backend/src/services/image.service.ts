import { randomUUID } from "node:crypto";
import { db } from "../prisma/db";
import { enqueueImageResize } from "../queues/image.queue";
import { makeVariants } from "./image-variants";
import { MAX_UPLOAD_BYTES, deleteObject, getObject, objectInfo, presignUpload, putObject, signedUrl } from "./s3.service";

export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const Images = db.orm.public.Image;
const Variants = db.orm.public.ImageVariant;

export async function createImage(contentType: string) {
  const key = `originals/${randomUUID()}`;
  const image = await Images.create({ key, contentType });
  // the browser must PUT with exactly this Content-Type header
  return { id: image.id, uploadUrl: await presignUpload(key, contentType), headers: { "Content-Type": contentType } };
}

export async function completeImage(id: number) {
  const image = await Images.where({ id }).first();
  if (!image) return "not_found" as const;
  if (image.status !== "pending") return "already_queued" as const;
  const info = await objectInfo(image.key);
  if (!info) return "not_uploaded" as const;
  if (info.size > MAX_UPLOAD_BYTES) {
    await deleteObject(image.key);
    await markImageFailed(id, "File too large");
    return "too_large" as const;
  }
  // enqueue first: if Redis is down this throws and the image stays "pending", so /complete can be retried.
  // The job id dedupes repeated calls; the worker flips the status to "processing".
  await enqueueImageResize(id);
  return "queued" as const;
}

export async function getImage(id: number) {
  const image = await Images.where({ id }).first();
  if (!image) return null;
  const rows = await Variants.where({ imageId: id }).all();
  const variants = await Promise.all(
    rows.map(async (v) => ({ label: v.label, width: v.width, height: v.height, url: await signedUrl(v.key) })),
  );
  return { id: image.id, status: image.status, error: image.error, width: image.width, height: image.height, variants };
}

// Run by the worker. Keys are deterministic, so a retry overwrites instead of duplicating.
export async function processImage(id: number) {
  const image = await Images.where({ id }).first();
  if (!image) throw new Error(`Image ${id} not found`);
  await Images.where({ id }).update({ status: "processing" });
  const { width, height, variants } = await makeVariants(await getObject(image.key));

  await Variants.where({ imageId: id }).deleteAll();
  for (const v of variants) {
    const key = `variants/${id}/${v.label}.webp`;
    await putObject(key, v.buffer, "image/webp");
    await Variants.create({ imageId: id, label: v.label, width: v.width, height: v.height, key, size: v.size });
  }
  await Images.where({ id }).update({ status: "ready", width, height, error: null });
}

export const markImageFailed = (id: number, error: string) =>
  Images.where({ id }).update({ status: "failed", error });
