import { Queue } from "bullmq";
import { connection } from "./connection";

export const WELCOME_QUEUE = "welcome";
export type WelcomeJob = { userId: number; email: string; name?: string | null };

export const welcomeQueue = new Queue<WelcomeJob>(WELCOME_QUEUE, {
  connection,
  defaultJobOptions: { attempts: 3, backoff: { type: "exponential", delay: 1000 }, removeOnComplete: 100, removeOnFail: 500 },
});
