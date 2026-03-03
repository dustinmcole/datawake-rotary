import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getRotaryYear, getWeeksElapsedInRotaryYear } from "@/lib/queries/attendance";

describe("getRotaryYear()", () => {
  it("returns July start when current month is July or later", () => {
    // Simulate August 2025
    vi.setSystemTime(new Date("2025-08-15"));
    const { start, end, label } = getRotaryYear();
    expect(start).toBe("2025-07-01");
    expect(end).toBe("2026-06-30");
    expect(label).toBe("2025–2026");
  });

  it("returns prior July start when current month is before July", () => {
    // Simulate February 2026 (still in the 2025-26 Rotary year)
    vi.setSystemTime(new Date("2026-02-01"));
    const { start, end, label } = getRotaryYear();
    expect(start).toBe("2025-07-01");
    expect(end).toBe("2026-06-30");
    expect(label).toBe("2025–2026");
  });

  it("transitions correctly on July 1", () => {
    vi.setSystemTime(new Date("2026-07-01"));
    const { start, label } = getRotaryYear();
    expect(start).toBe("2026-07-01");
    expect(label).toBe("2026–2027");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.useFakeTimers();
  });
});

describe("getWeeksElapsedInRotaryYear()", () => {
  it("returns at least 1 week", () => {
    const start = "2025-07-01";
    const weeks = getWeeksElapsedInRotaryYear(start);
    expect(weeks).toBeGreaterThanOrEqual(1);
  });

  it("returns 1 for a very recent start date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-07-02"));
    expect(getWeeksElapsedInRotaryYear("2025-07-01")).toBe(1);
    vi.useRealTimers();
  });
});
