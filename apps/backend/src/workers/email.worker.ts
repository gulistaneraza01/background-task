import { Worker } from "bullmq";
import { connection } from "../queues/connection";
import { EMAIL_QUEUE, type EmailJob } from "../queues/email.queue";
import { sendMail } from "../services/mail.service";
import { templates } from "../templates";

export const emailWorker = new Worker<EmailJob>(
  EMAIL_QUEUE,
  async ({ data: { template, to, data } }) => {
    const { subject, html } = templates[template].render(data as never);
    await sendMail(to, subject, html);
    console.log(`email "${template}" sent to ${to}`);
  },
  { connection },
);

emailWorker.on("failed", (job, err) => console.error(`email job ${job?.id} (${job?.data.template}) failed:`, err.message));
