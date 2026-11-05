import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  sourcemap: true,
  dts: true,
  clean: true,
  fixedExtension: false,
  tsconfig: "tsconfig.build.json",
});
