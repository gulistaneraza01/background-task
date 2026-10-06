import { Worker } from "bullmq";
import { connection } from "../queues/connection";
import { IMAGE_QUEUE, type ImageJob } from "../queues/image.queue";
import { markImageFailed, processImage } from "../services/image.service";

export const imageWorker = new Worker<ImageJob>(IMAGE_QUEUE, ({ data }) => processImage(data.imageId), {
  connection,
  concurrency: 2,
});

imageWorker.on("failed", async (job, err) => {
  console.error(`image job ${job?.id} failed:`, err.message);
  // only mark failed once BullMQ has used up its retries
  if (job && job.attemptsMade >= (job.opts.attempts ?? 1)) await markImageFailed(job.data.imageId, err.message);
});
