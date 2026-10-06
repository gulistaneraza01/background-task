import type { Request, Response } from "express";
import { enqueueEmail } from "../queues/email.queue";
import { deleteAccount, restoreAccount } from "../services/account.service";
import { isEmail } from "./user.controller";

// ponytail: the account is identified by the email in the body because the app has no auth yet.
// Anyone can delete/restore any account; put both routes behind auth before real use.
export async function remove(req: Request, res: Response) {
  const email = req.body?.email;
  if (!isEmail(email)) return res.status(400).json({ error: "Invalid email" });
  const result = await deleteAccount(email.toLowerCase());
  if (!result) return res.status(404).json({ error: "Account not found" });
  await enqueueEmail("accountDeletionScheduled", email.toLowerCase(), {
    name: result.name,
    restoreBy: result.restoreBy.toDateString(),
  });
  res.status(202).json({ message: "Account scheduled for deletion", restoreBy: result.restoreBy });
}

export async function restore(req: Request, res: Response) {
  const email = req.body?.email;
  if (!isEmail(email)) return res.status(400).json({ error: "Invalid email" });
  const result = await restoreAccount(email.toLowerCase());
  if (result.status === "not_found") return res.status(404).json({ error: "No deleted account found" });
  if (result.status === "expired") return res.status(410).json({ error: "Restore window has passed" });
  await enqueueEmail("accountRestored", email.toLowerCase(), { name: result.name });
  res.json({ message: "Account restored" });
}
