import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMail(to: string, subject: string, html: string) {
  const { error } = await resend.emails.send({ from: process.env.MAIL_FROM!, to, subject, html });
  // throw so BullMQ retries the job
  if (error) throw new Error(`Resend: ${error.message}`);
}
