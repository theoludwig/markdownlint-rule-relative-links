"use strict"

const { pathToFileURL } = require("node:url")
const fs = require("node:fs")

const { filterTokens } = require("./markdownlint-rule-helpers/helpers.js")
const {
  convertHeadingToHTMLFragment,
  getMarkdownHeadings,
  getMarkdownIdOrAnchorNameFragments,
  isValidIntegerString,
  getNumberOfLines,
  getLineNumberStringFromFragment,
  lineFragmentRe,
} = require("./utils.js")

/** @typedef {import('markdownlint').Rule} MarkdownLintRule */

/**
 * @type {MarkdownLintRule}
 */
const customRule = {
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

        if (hrefSrc == null) {
          continue
        }

        const url = new URL(hrefSrc, pathToFileURL(params.name))
        const isRelative =
          url.protocol === "file:" &&
          !hrefSrc.startsWith("/") &&
          !hrefSrc.startsWith("#")

        if (!isRelative) {
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

        if (!fragmentsHTML.includes(url.hash.toLowerCase())) {
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

module.exports = customRule
