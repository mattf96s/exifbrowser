/** @type {import('eslint').Linter.Config} */

module.exports = {
    extends: [
        "@remix-run/eslint-config",
        "@remix-run/eslint-config/node",
        "prettier",
        "plugin:react-hooks/recommended",
        "plugin:react/recommended",
    ],
    settings: {
        react: { version: "detect" },
    },
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
    },
    plugins: ["unused-imports"],
    rules: {
        "react/display-name": "off",
        "no-unused-vars": "off",
        "react/react-in-jsx-scope": "off",
        "unused-imports/no-unused-imports": "error",
        "@typescript-eslint/no-unused-vars": "warn",
        "@typescript-eslint/consistent-type-imports": [
            "warn",
            {
                prefer: "type-imports",
                disallowTypeAnnotations: true,
                fixStyle: "inline-type-imports",
            },
        ],
        "import/no-duplicates": ["warn", { "prefer-inline": true }],
        "import/consistent-type-specifier-style": ["warn", "prefer-inline"],
        "import/order": [
            "warn",
            {
                alphabetize: { order: "asc", caseInsensitive: true },
                groups: [
                    "builtin",
                    "external",
                    "internal",
                    "parent",
                    "sibling",
                    "index",
                ],
            },
        ],
        "react/function-component-definition": [
            "error",
            {
                namedComponents: "function-declaration",
                unnamedComponents: "arrow-function",
            },
        ],
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "error",
    }
};
