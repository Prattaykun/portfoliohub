// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "android-twa/**",
      "next-env.d.ts",
    ],
  },

  // Next.js and TypeScript defaults
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Custom project rules
  {
    rules: {
      // ✅ prevent build failures on these common warnings
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "react-hooks/exhaustive-deps": "warn",
      "@next/next/no-img-element": "off",

      // optional: relax react/display-name warnings
      "react/display-name": "off",
    },
  },
];

export default eslintConfig;
