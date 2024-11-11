import typescriptESLint from "typescript-eslint"
import configConventions from "eslint-config-conventions"

export default typescriptESLint.config(...configConventions, {
  files: ["**/*.ts", "**/*.tsx"],
  languageOptions: {
    parser: typescriptESLint.parser,
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
