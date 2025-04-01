// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    // Define ignores globally at the top level
    ignores: ["dist", "website"],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    // Rules apply to remaining files
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^.*_$",
          varsIgnorePattern: "^.*_$",
        },
      ],
    },
  },
);
