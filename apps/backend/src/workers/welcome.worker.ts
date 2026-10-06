import { Worker } from "bullmq";
import { connection } from "../queues/connection";
import { sendWelcomeEmail } from "../services/mail.service";
import { WELCOME_QUEUE, type WelcomeJob } from "../queues/welcome.queue";

export const welcomeWorker = new Worker<WelcomeJob>(
  WELCOME_QUEUE,
  async (job) => {
    await sendWelcomeEmail(job.data.email, job.data.name);
    console.log(`welcome job ${job.id}: sent to ${job.data.email}`);
  },
  { connection },
);

welcomeWorker.on("failed", (job, err) => console.error(`welcome job ${job?.id} failed:`, err.message));
