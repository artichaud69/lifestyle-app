import { describe, expect, it } from "vitest";
import { addDays, isDateKey, localDateKey, parseRelativeDate, startOfWeek } from "@/lib/dates";

describe("dates", () => {
  it("validates date keys strictly", () => {
    expect(isDateKey("2026-11-21")).toBe(true);
    expect(isDateKey("2026-02-30")).toBe(false);
    expect(isDateKey("21/11/2026")).toBe(false);
  });

  it("computes today in the user's timezone", () => {
    const lateUtc = new Date("2026-11-21T23:30:00Z");
    expect(localDateKey("UTC", lateUtc)).toBe("2026-11-21");
    expect(localDateKey("Europe/Amsterdam", lateUtc)).toBe("2026-11-22");
  });

  it("handles week starts", () => {
    expect(startOfWeek("2026-11-21", 1)).toBe("2026-11-16");
    expect(startOfWeek("2026-11-16", 1)).toBe("2026-11-16");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });

  it.each([
    ["today", "2026-11-21"],
    ["tomorrow", "2026-11-22"],
    ["in 3 days", "2026-11-24"],
    ["next week", "2026-11-23"],
    ["on monday", "2026-11-23"],
    ["saturday", "2026-11-28"],
    ["demain", "2026-11-22"],
    ["on 2026-12-24", "2026-12-24"],
  ])("parses %s", (phrase, expected) => {
    expect(parseRelativeDate(`do it ${phrase}`, "2026-11-21")?.date).toBe(expected);
  });

  it("returns null rather than guessing", () => {
    expect(parseRelativeDate("sometime soonish", "2026-11-21")).toBeNull();
  });
});
