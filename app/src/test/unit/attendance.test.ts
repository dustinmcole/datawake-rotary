import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getRotaryYear, getWeeksElapsedInRotaryYear } from "@/lib/queries/attendance";

describe("getRotaryYear()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns July start when month is August", () => {
    // Use a mid-month date to avoid timezone edge cases
    vi.setSystemTime(new Date("2025-08-15T12:00:00"));
    const { start, end, label } = getRotaryYear();
    expect(start).toBe("2025-07-01");
    expect(end).toBe("2026-06-30");
    expect(label).toBe("2025\u20132026");
  });

  it("returns prior July when month is February", () => {
    vi.setSystemTime(new Date("2026-02-15T12:00:00"));
    const { start, end, label } = getRotaryYear();
    expect(start).toBe("2025-07-01");
    expect(end).toBe("2026-06-30");
    expect(label).toBe("2025\u20132026");
  });

  it("transitions to a new year mid-July", () => {
    vi.setSystemTime(new Date("2026-07-15T12:00:00"));
    const { start, label } = getRotaryYear();
    expect(start).toBe("2026-07-01");
    expect(label).toBe("2026\u20132027");
  });
});

describe("getWeeksElapsedInRotaryYear()", () => {
  it("returns 1 for a very recent start", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-07-03T12:00:00"));
    expect(getWeeksElapsedInRotaryYear("2025-07-01")).toBe(1);
    vi.useRealTimers();
  });

  it("returns at least 1", () => {
    expect(getWeeksElapsedInRotaryYear("2020-07-01")).toBeGreaterThanOrEqual(1);
  });
});
