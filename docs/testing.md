# Testing Guide

This project uses [Vitest](https://vitest.dev/) with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for unit and integration tests.

## Setup

Dev dependencies are installed automatically with `npm install --include=dev` inside the `app/` directory.

## Running Tests

```bash
cd app

# Run all tests once
npm run test:run

# Watch mode (re-runs on file changes)
npm test

# With UI
npx vitest --ui
```

## File Conventions

| What | Where |
|------|-------|
| Test files | `src/test/unit/*.test.ts` or `src/test/unit/*.test.tsx` |
| Setup file | `src/test/setup.ts` |
| Config | `vitest.config.mts` |

Test files must end in `.test.ts` or `.test.tsx`.

## Writing Tests

### Utility functions

```ts
import { describe, it, expect } from "vitest";
import { formatCurrency } from "@/lib/utils";

describe("formatCurrency()", () => {
  it("formats USD", () => {
    expect(formatCurrency(99.99)).toBe("$99.99");
  });
});
```

### Functions with time dependency

Use `vi.useFakeTimers()` and `vi.setSystemTime()` for any code that calls `new Date()`:

```ts
import { vi, beforeEach, afterEach } from "vitest";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

it("...", () => {
  vi.setSystemTime(new Date("2025-08-15T12:00:00")); // mid-month to avoid TZ edge cases
  // ...
});
```

### React components

```tsx
import { render, screen } from "@testing-library/react";
import { MyComponent } from "@/components/layout/my-component";

// Mock next/link so it renders as <a> in jsdom
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => <a href={href} {...props}>{children}</a>,
}));

it("renders the title", () => {
  render(<MyComponent />);
  expect(screen.getByText("Hello")).toBeInTheDocument();
});
```

## Path Aliases

The `@/` alias maps to `src/` (matching `tsconfig.json`). Use it freely in test imports.

## CI

Tests run automatically on every push and pull request via `.github/workflows/ci.yml`. The `test` job installs devDependencies with `--include=dev` before running `npm run test:run`.

## Notes

- **Timezone**: Date strings like `"2025-07-01"` are parsed as UTC midnight. Use mid-month dates or `new Date(year, month, day)` (local time) to avoid off-by-one issues in timezone-sensitive assertions.
- **React 19 + jsdom**: The config forces `NODE_ENV=development` so that `React.act()` is available for Testing Library. Do not override this in test files.
- **Database queries**: Tests that import from `@/lib/queries/` are unit-tested for pure utility functions only (e.g., `getRotaryYear`). Never call real DB functions in tests; mock the DB client if needed.
