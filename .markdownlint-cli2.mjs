import relativeLinksRule from "./src/index.js"

const config = {
  config: {
    extends: "markdownlint/style/prettier",
    default: true,
    "relative-links": {
      root_path: ".",
    },
    "no-inline-html": false,
  },
  globs: ["**/*.md"],
  ignores: ["**/node_modules", "**/test/fixtures/**"],
  customRules: [relativeLinksRule],
}

export default config
