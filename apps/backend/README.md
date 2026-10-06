# backend

Express API with Prisma (PostgreSQL), and BullMQ background jobs that send email through Resend.

## Setup

```bash
bun install
cp .env.example .env   # then fill in the values
bunx prisma db migrate # apply migrations
```

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis for BullMQ |
| `RESEND_API_KEY`, `MAIL_FROM` | Sending email (`onboarding@resend.dev` only delivers to your own Resend account until you verify a domain) |
| `REPORT_EMAIL`, `REPORT_TZ` | Recipient and timezone for the weekly report |
| `RETENTION_DAYS` | Days a deleted account can be restored before it is purged (default 180) |

## Run

The API and the worker are separate processes. Run both:

```bash
bun run dev      # API on PORT (default 3000)
bun run worker   # background jobs: email, weekly report, account purge
```

## API

| Method | Path | Body | Result |
|---|---|---|---|
| POST | `/register` | `{ email, name?, username? }` | `201` user, `409` if the email exists. Queues a welcome email |
| DELETE | `/account` | `{ email }` | `202` soft delete, returns `restoreBy`. Queues a deletion email |
| POST | `/account/restore` | `{ email }` | `200` restored, `404` nothing to restore, `410` window passed |

> `/account` routes identify the account by the email in the body because there is no auth yet. Do not expose them publicly until auth is added.

## Background jobs

```
src/
├── routes/        HTTP routes
├── controllers/   request validation and responses
├── services/      business logic (account, report, mail)
├── queues/        BullMQ queues (email, report, purge)
├── workers/       BullMQ workers
└── templates/     email templates and their priorities
```

- **Email queue:** every email goes through `enqueueEmail(template, to, data)`. One worker sends them. Each template has a priority (1 = highest), so `welcome` and account mails go ahead of the weekly report. To add an email, add an entry to `src/templates/index.ts`.
- **Weekly report:** cron `0 19 * * 1` (Mondays 19:00) builds the report and enqueues it as a low-priority email.
- **Account deletion:** `DELETE /account` only sets `deletedAt`. A daily 03:00 job permanently deletes accounts whose `deletedAt` is older than `RETENTION_DAYS`. Restoring clears `deletedAt`.

## Database

The contract is `src/prisma/contract.prisma`. After editing it:

```bash
bunx prisma contract emit
bunx prisma migration plan --name <name>
bunx prisma db migrate
```

## Tests

```bash
bun test
```
