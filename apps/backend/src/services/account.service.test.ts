import { expect, test } from "bun:test";
import { RETENTION_DAYS, isRestorable, purgeCutoff } from "./account.service";

const DAY = 86_400_000;
const now = Date.parse("2026-10-06T00:00:00Z");

test("restorable one day before the retention deadline", () => {
  const deletedAt = new Date(now - (RETENTION_DAYS - 1) * DAY).toISOString();
  expect(isRestorable(deletedAt, now)).toBe(true);
});

test("not restorable once the retention window has passed", () => {
  const deletedAt = new Date(now - (RETENTION_DAYS + 1) * DAY).toISOString();
  expect(isRestorable(deletedAt, now)).toBe(false);
});

test("purge cutoff is exactly the retention window before now", () => {
  expect(purgeCutoff(now).getTime()).toBe(now - RETENTION_DAYS * DAY);
});
