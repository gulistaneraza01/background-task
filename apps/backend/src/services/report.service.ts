import { db } from "../prisma/db";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function buildWeeklyReport() {
  const since = new Date(Date.now() - WEEK_MS).toISOString();
  const users = await db.orm.public.User.where((u) => u.createdAt.gte(since)).all();
  return { since, newUsers: users.length };
}
