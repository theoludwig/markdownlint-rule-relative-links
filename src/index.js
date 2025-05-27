import { pathToFileURL } from "node:url"
import fs from "node:fs"

import { filterTokens } from "./markdownlint-rule-helpers/helpers.js"
import {
  convertHeadingToHTMLFragment,
  getMarkdownHeadings,
  getMarkdownIdOrAnchorNameFragments,
  isValidIntegerString,
  getNumberOfLines,
  getLineNumberStringFromFragment,
  lineFragmentRe,
} from "./utils.js"

export { markdownIt } from "./utils.js"

/** @typedef {import('markdownlint').Rule} MarkdownLintRule */

/**
 * @type {MarkdownLintRule}
 */
const relativeLinksRule = {
  names: ["relative-links"],
  description: "Relative links should be valid",
  tags: ["links"],
  parser: "markdownit",
  function: (params, onError) => {
    filterTokens(params, "inline", (token) => {
      const children = token.children ?? []
      for (const child of children) {
        const { type, attrs, lineNumber } = child

        /** @type {string | undefined} */
        let hrefSrc

        if (type === "link_open") {
          for (const attr of attrs) {
            if (attr[0] === "href") {
              hrefSrc = attr[1]
              break
            }
          }
        }

        if (type === "image") {
          for (const attr of attrs) {
            if (attr[0] === "src") {
              hrefSrc = attr[1]
              break
            }
          }
        }

        if (hrefSrc == null || hrefSrc.startsWith("#")) {
          continue
        }

        let url

        if (hrefSrc.startsWith("/")) {
          const rootPath = params.config["root_path"]

          if (!rootPath) {
            continue
          }

          url = new URL(`.${hrefSrc}`, pathToFileURL(`${rootPath}/`))
        } else {
          url = new URL(hrefSrc, pathToFileURL(params.name))
        }

        if (url.protocol !== "file:") {
          continue
        }

        const detail = `"${hrefSrc}"`

        if (!fs.existsSync(url)) {
          onError({
            lineNumber,
            detail: `${detail} should exist in the file system`,
          })
          continue
        }

        if (url.hash.length <= 0) {
          if (hrefSrc.includes("#")) {
            if (type === "image") {
              onError({
                lineNumber,
                detail: `${detail} should not have a fragment identifier as it is an image`,
              })
              continue
            }

            onError({
              lineNumber,
              detail: `${detail} should have a valid fragment identifier`,
            })
            continue
          }
          continue
        }

        if (type === "image") {
          onError({
            lineNumber,
            detail: `${detail} should not have a fragment identifier as it is an image`,
          })
          continue
        }

        if (!url.pathname.endsWith(".md")) {
          continue
        }

        const fileContent = fs.readFileSync(url, { encoding: "utf8" })
        const headings = getMarkdownHeadings(fileContent)
        const idOrAnchorNameHTMLFragments =
          getMarkdownIdOrAnchorNameFragments(fileContent)

        /** @type {Map<string, number>} */
        const fragments = new Map()

        const fragmentsHTML = headings.map((heading) => {
          const fragment = convertHeadingToHTMLFragment(heading)
          const count = fragments.get(fragment) ?? 0
          fragments.set(fragment, count + 1)
          if (count !== 0) {
            return `${fragment}-${count}`
          }
          return fragment
        })

        fragmentsHTML.push(...idOrAnchorNameHTMLFragments)

        if (!fragmentsHTML.includes(url.hash)) {
          if (url.hash.startsWith("#L")) {
            const lineNumberFragmentString = getLineNumberStringFromFragment(
              url.hash,
            )

            const hasOnlyDigits = isValidIntegerString(lineNumberFragmentString)
            if (!hasOnlyDigits) {
              if (lineFragmentRe.test(url.hash)) {
                continue
              }

              onError({
                lineNumber,
                detail: `${detail} should have a valid fragment identifier`,
              })
              continue
            }

            const lineNumberFragment = Number.parseInt(
              lineNumberFragmentString,
              10,
            )
            const numberOfLines = getNumberOfLines(fileContent)
            if (lineNumberFragment > numberOfLines) {
              onError({
                lineNumber,
                detail: `${detail} should have a valid fragment identifier, ${detail} should have at least ${lineNumberFragment} lines to be valid`,
              })
              continue
            }

            continue
          }

          onError({
            lineNumber,
            detail: `${detail} should have a valid fragment identifier`,
          })
          continue
        }
      }
    })
  },
}

export default relativeLinksRule
