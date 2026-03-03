import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock next/link so it renders as a plain anchor in jsdom
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import { RotaryFooter } from "@/components/layout/rotary-footer";

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

  it("includes a Rotary International link", () => {
    render(<RotaryFooter />);
    const links = screen.getAllByRole("link", { name: /Rotary International/i });
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]).toHaveAttribute("href", "https://www.rotary.org");
  });

  it("shows the current year in copyright", () => {
    render(<RotaryFooter />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });
});
