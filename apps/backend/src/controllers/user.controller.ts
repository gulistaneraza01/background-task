import type { Request, Response } from "express";
import { enqueueEmail } from "../queues/email.queue";
import { registerUser } from "../services/user.service";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const optionalString = (v: unknown) => v === undefined || typeof v === "string";

export async function register(req: Request, res: Response) {
  const { email, name, username } = req.body ?? {};
  if (typeof email !== "string" || !EMAIL.test(email) || !optionalString(name) || !optionalString(username)) {
    return res.status(400).json({ error: "Invalid email, name or username" });
  }
  const user = await registerUser({ email: email.toLowerCase(), name, username });
  if (!user) return res.status(409).json({ error: "Email already registered" });
  await enqueueEmail("welcome", user.email, { name: user.name });
  res.status(201).json(user);
}
