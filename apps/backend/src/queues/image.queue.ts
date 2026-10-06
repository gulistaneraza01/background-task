import { Queue } from "bullmq";
import { connection } from "./connection";

export const IMAGE_QUEUE = "image-resize";
export type ImageJob = { imageId: number };

export const imageQueue = new Queue<ImageJob>(IMAGE_QUEUE, {
  connection,
  defaultJobOptions: { attempts: 3, backoff: { type: "exponential", delay: 2000 }, removeOnComplete: 100, removeOnFail: 500 },
});

// jobId makes a repeated /complete call a no-op instead of a duplicate job
export const enqueueImageResize = (imageId: number) =>
  imageQueue.add("resize", { imageId }, { jobId: `image-${imageId}` });
