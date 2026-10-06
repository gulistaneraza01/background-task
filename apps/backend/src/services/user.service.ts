import { db } from "../prisma/db";

export type RegisterInput = { email: string; name?: string; username?: string };

export async function registerUser(input: RegisterInput) {
  const existing = await db.orm.public.User.where({ email: input.email }).first();
  if (existing) return null;
  // ponytail: check-then-insert; a concurrent duplicate hits the unique index and 500s
  return db.orm.public.User.create(input);
}
