import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
    { ignores: ["node_modules", "dist", "generated", "prisma/migrations"] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["src/**/*.ts"],
        languageOptions: { globals: globals.node },
        rules: {
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
        },
    },
];