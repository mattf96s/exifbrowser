/** @type {import("prettier").Options} */
export default {
  arrowParens: "avoid",
  bracketSameLine: false,
  bracketSpacing: true,
  proseWrap: "always",
  semi: false,
  singleAttributePerLine: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: "all",
  useTabs: true,
  overrides: [
    {
      files: ["**/*.json"],
      options: {
        useTabs: false,
      },
    },
  ],
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindConfig: "./tailwind.config.js",
  tailwindFunctions: ["clsx", "twMerge", "cn"],
};
