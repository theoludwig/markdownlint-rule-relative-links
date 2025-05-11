import type MarkdownIt from "markdown-it"
import type { Rule } from "markdownlint"

declare const relativeLinksRule: Rule
export default relativeLinksRule

declare const markdownIt: MarkdownIt
export { markdownIt }
