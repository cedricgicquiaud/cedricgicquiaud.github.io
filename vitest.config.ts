import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname) },
  },
  test: {
    environment: "jsdom",
    include: ["src/__tests__/**/*.test.{ts,tsx}"],
    // Les fichiers de tests s'exécutent l'un après l'autre : `next build` pose un verrou
    // et refuse de tourner deux fois en même temps (socle.test.ts et finitions.test.tsx
    // le lancent tous deux quand `out/` est absent, cas de la CI).
    fileParallelism: false,
  },
});
