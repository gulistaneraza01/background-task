import { Worker } from "bullmq";
import { connection } from "../queues/connection";
import { PURGE_QUEUE, scheduleAccountPurge } from "../queues/purge.queue";
import { purgeExpiredAccounts } from "../services/account.service";

export const purgeWorker = new Worker(
  PURGE_QUEUE,
  async () => {
    const count = await purgeExpiredAccounts();
    console.log(`account purge: ${count} account(s) permanently deleted`);
  },
  { connection },
);

purgeWorker.on("failed", (job, err) => console.error(`purge job ${job?.id} failed:`, err.message));

await scheduleAccountPurge();
