import { Queue } from "bullmq";
import { connection } from "./connection";

export const PURGE_QUEUE = "account-purge";

export const purgeQueue = new Queue(PURGE_QUEUE, {
  connection,
  defaultJobOptions: { attempts: 3, backoff: { type: "exponential", delay: 10_000 }, removeOnComplete: 20, removeOnFail: 50 },
});

// Idempotent: upserts a single scheduler, safe to call on every worker start.
export function scheduleAccountPurge() {
  return purgeQueue.upsertJobScheduler(
    "account-purge",
    { pattern: "0 3 * * *", tz: process.env.REPORT_TZ || undefined }, // daily 03:00
    { name: "account-purge" },
  );
}
