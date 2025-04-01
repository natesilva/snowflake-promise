import { coverageConfigDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    mockReset: true,
    coverage: {
      exclude: ["**/website/**", "**/examples/**", ...coverageConfigDefaults.exclude],
    },
  },
});
