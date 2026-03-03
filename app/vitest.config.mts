import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    server: {
      deps: {
        // Force React to use development build so act() is available
        inline: ["react", "react-dom"],
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(new URL(".", import.meta.url).pathname, "src"),
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("development"),
  },
});
