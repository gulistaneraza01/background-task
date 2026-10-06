import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(to: string, name?: string | null) {
  const { error } = await resend.emails.send({
    from: process.env.MAIL_FROM!,
    to,
    subject: `Welcome${name ? `, ${name}` : ""}!`,
    text: `Hi ${name ?? "there"}, thanks for registering.`,
  });
  // throw so BullMQ retries the job
  if (error) throw new Error(`Resend: ${error.message}`);
}
