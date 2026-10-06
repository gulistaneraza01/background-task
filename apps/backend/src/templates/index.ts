// Email template registry. To add a mail: add an entry here, then enqueueEmail("<name>", to, data).
// priority: BullMQ semantics, 1 = highest. Lower-priority mail waits behind higher-priority mail.
export const PRIORITY = { HIGH: 1, NORMAL: 5, LOW: 10 } as const;

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const templates = {
  welcome: {
    priority: PRIORITY.HIGH,
    render: ({ name }: { name?: string | null }) => ({
      subject: `Welcome${name ? `, ${name}` : ""}!`,
      html: `<p>Hi ${escapeHtml(name ?? "there")}, thanks for registering.</p>`,
    }),
  },
  accountDeletionScheduled: {
    priority: PRIORITY.HIGH,
    render: ({ name, restoreBy }: { name?: string | null; restoreBy: string }) => ({
      subject: "Your account is scheduled for deletion",
      html: `<p>Hi ${escapeHtml(name ?? "there")}, your account will be permanently deleted on ${escapeHtml(restoreBy)}. Restore it before then to keep your data.</p>`,
    }),
  },
  accountRestored: {
    priority: PRIORITY.HIGH,
    render: ({ name }: { name?: string | null }) => ({
      subject: "Your account has been restored",
      html: `<p>Welcome back, ${escapeHtml(name ?? "there")}! Your account is active again.</p>`,
    }),
  },
  weeklyReport: {
    priority: PRIORITY.LOW,
    render: ({ since, newUsers }: { since: string; newUsers: number }) => ({
      subject: "Weekly report",
      html: `<p>New users since ${escapeHtml(since)}: <strong>${newUsers}</strong></p>`,
    }),
  },
};

export type TemplateName = keyof typeof templates;
export type TemplateData<T extends TemplateName> = Parameters<(typeof templates)[T]["render"]>[0];
