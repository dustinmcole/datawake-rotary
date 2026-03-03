import { describe, it, expect } from "vitest";
import { cn, generateId, formatCurrency, formatDate } from "@/lib/utils";

describe("cn()", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "active")).toBe("base active");
  });

  it("resolves tailwind conflicts (last wins)", () => {
    expect(cn("p-4", "p-8")).toBe("p-8");
  });
});

describe("generateId()", () => {
  it("returns a non-empty string", () => {
    expect(typeof generateId()).toBe("string");
    expect(generateId().length).toBeGreaterThan(0);
  });

  it("returns unique values", () => {
    expect(generateId()).not.toBe(generateId());
  });
});

describe("formatCurrency()", () => {
  it("formats dollars", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });
});

describe("formatDate()", () => {
  it("formats a mid-month date string", () => {
    // Use mid-month to avoid UTC/local timezone boundary issues
    const result = formatDate("2025-07-15");
    expect(result).toMatch(/Jul/);
    expect(result).toMatch(/2025/);
  });

  it("formats a Date object", () => {
    const result = formatDate(new Date(2025, 0, 20)); // Jan 20, local time
    expect(result).toMatch(/Jan/);
    expect(result).toMatch(/2025/);
  });
});
