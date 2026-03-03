import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RotaryFooter } from "@/components/layout/rotary-footer";

// Mock next/link since we're in jsdom without the Next.js router
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe("RotaryFooter", () => {
  it("renders club name", () => {
    render(<RotaryFooter />);
    expect(screen.getByText("Fullerton Rotary Club")).toBeInTheDocument();
  });

  it("shows weekly meeting day and time", () => {
    render(<RotaryFooter />);
    expect(screen.getByText("Every Wednesday")).toBeInTheDocument();
    expect(screen.getByText(/12:00 PM/)).toBeInTheDocument();
  });

  it("includes a link to Rotary International", () => {
    render(<RotaryFooter />);
    const link = screen.getByRole("link", { name: /Rotary International/i });
    expect(link).toHaveAttribute("href", "https://www.rotary.org");
  });

  it("shows the current year in the copyright notice", () => {
    render(<RotaryFooter />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });
});
