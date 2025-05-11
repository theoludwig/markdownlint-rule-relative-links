import relativeLinksRule, { markdownIt } from "./src/index.js"

const config = {
  config: {
    extends: "markdownlint/style/prettier",
    default: true,
    "relative-links": true,
    "no-inline-html": false,
  },
  globs: ["**/*.md"],
  ignores: ["**/node_modules", "**/test/fixtures/**"],
  customRules: [relativeLinksRule],
  markdownItFactory: () => {
    return markdownIt
  },
}

export default config
