import { Worker } from "bullmq";
import { connection } from "../queues/connection";
import { enqueueEmail } from "../queues/email.queue";
import { REPORT_QUEUE, scheduleWeeklyReport } from "../queues/report.queue";
import { buildWeeklyReport } from "../services/report.service";

// Builds the report on schedule, then hands delivery to the email queue.
export const reportWorker = new Worker(
  REPORT_QUEUE,
  async () => {
    await enqueueEmail("weeklyReport", process.env.REPORT_EMAIL!, await buildWeeklyReport());
  },
  { connection },
);

reportWorker.on("failed", (job, err) => console.error(`report job ${job?.id} failed:`, err.message));

await scheduleWeeklyReport();
