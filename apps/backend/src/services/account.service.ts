import { db } from "../prisma/db";

export const RETENTION_DAYS = Number(process.env.RETENTION_DAYS) || 180;
const DAY_MS = 86_400_000;

export const purgeCutoff = (now = Date.now()) => new Date(now - RETENTION_DAYS * DAY_MS);
export const restoreDeadline = (deletedAt: string) => new Date(Date.parse(deletedAt) + RETENTION_DAYS * DAY_MS);
export const isRestorable = (deletedAt: string, now = Date.now()) => now < restoreDeadline(deletedAt).getTime();

// Soft delete: only flags the row. Returns the restore deadline, or null if no active user.
export async function deleteAccount(email: string) {
  const user = await db.orm.public.User.where({ email }).first();
  if (!user || user.deletedAt) return null;
  const deletedAt = new Date().toISOString();
  await db.orm.public.User.where({ id: user.id }).update({ deletedAt });
  return { name: user.name, restoreBy: restoreDeadline(deletedAt) };
}

export async function restoreAccount(email: string) {
  const user = await db.orm.public.User.where({ email }).first();
  if (!user || !user.deletedAt) return { status: "not_found" } as const;
  if (!isRestorable(user.deletedAt)) return { status: "expired" } as const;
  await db.orm.public.User.where({ id: user.id }).update({ deletedAt: null });
  return { status: "restored", name: user.name } as const;
}

// Hard delete of accounts past the retention window. Idempotent: safe to re-run after a crash.
export async function purgeExpiredAccounts() {
  const expired = await db.orm.public.User
    .where((u) => u.deletedAt.lt(purgeCutoff().toISOString()))
    .all();
  // ponytail: no dependent tables yet; delete child rows here before the user once they exist
  for (const u of expired) await db.orm.public.User.where({ id: u.id }).delete();
  return expired.length;
}
