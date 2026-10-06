import { Queue } from "bullmq";
import { connection } from "./connection";
import { templates, type TemplateData, type TemplateName } from "../templates";

export const EMAIL_QUEUE = "email";
export type EmailJob = { template: TemplateName; to: string; data: unknown };

export const emailQueue = new Queue<EmailJob>(EMAIL_QUEUE, {
  connection,
  defaultJobOptions: { attempts: 3, backoff: { type: "exponential", delay: 1000 }, removeOnComplete: 100, removeOnFail: 500 },
});

export function enqueueEmail<T extends TemplateName>(template: T, to: string, data: TemplateData<T>) {
  return emailQueue.add(template, { template, to, data }, { priority: templates[template].priority });
}
