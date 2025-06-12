import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: ["src/components/ui/**/*"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      perfectionist: (await import("eslint-plugin-perfectionist")).default,
      "unused-imports": (await import("eslint-plugin-unused-imports")).default,
    },
    rules: {
      // Import sorting - minimal but effective
      "perfectionist/sort-imports": [
        "error",
        {
          type: "alphabetical",
          order: "asc",
          ignoreCase: true,
          newlinesBetween: "always",
          groups: [
            "type",
            ["builtin", "external"],
            "internal-type",
            "internal",
            ["parent-type", "sibling-type", "index-type"],
            ["parent", "sibling", "index"],
          ],
        },
      ],
      "perfectionist/sort-named-imports": ["error", { type: "alphabetical" }],
      "perfectionist/sort-jsx-props": ["error", { type: "alphabetical" }],

      // Unused imports cleanup
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
  // This must be last to prevent conflicts with Prettier
  ...compat.extends("prettier"),
];

export default eslintConfig;
