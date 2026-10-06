import { Queue } from 'bullmq';
import { connection } from './connection';

export const REPORT_QUEUE = 'report';

export const reportQueue = new Queue(REPORT_QUEUE, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 20,
    removeOnFail: 50,
  },
});

// Idempotent: safe to call on every worker start, it upserts a single scheduler.
export function scheduleWeeklyReport() {
  return reportQueue.upsertJobScheduler(
    'weekly-report',
    { pattern: '0 6 * * 1', tz: process.env.REPORT_TZ || undefined }, // Mondays 06:00
    { name: 'weekly-report' },
  );
}
