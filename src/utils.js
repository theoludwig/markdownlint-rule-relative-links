import MarkdownIt from "markdown-it"

import { getHtmlAttributeRe } from "./markdownlint-rule-helpers/helpers.js"

export const markdownIt = new MarkdownIt({ html: true })

export const lineFragmentRe = /^#(?:L\d+(?:C\d+)?-L\d+(?:C\d+)?|L\d+)$/

/**
 * Converts a Markdown heading into an HTML fragment according to the rules
 * used by GitHub.
 *
 * @see https://github.com/DavidAnson/markdownlint/blob/d01180ec5a014083ee9d574b693a8d7fbc1e566d/lib/md051.js#L1
 * @param {string} inlineText Inline token for heading.
 * @returns {string} Fragment string for heading.
 */
export const convertHeadingToHTMLFragment = (inlineText) => {
  return (
    "#" +
    encodeURIComponent(
      inlineText
        .toLowerCase()
        // RegExp source with Ruby's \p{Word} expanded into its General Categories
        // https://github.com/gjtorikian/html-pipeline/blob/main/lib/html/pipeline/toc_filter.rb
        // https://ruby-doc.org/core-3.0.2/Regexp.html
        .replace(
          /[^\p{Letter}\p{Mark}\p{Number}\p{Connector_Punctuation}\- ]/gu,
          "",
        )
        .replace(/ /gu, "-"),
    )
  )
}

const headingTags = new Set(["h1", "h2", "h3", "h4", "h5", "h6"])
const ignoredTokens = new Set(["heading_open", "heading_close"])

/**
 * Gets the headings from a Markdown string.
 * @param {string} content
 * @returns {string[]}
 */
export const getMarkdownHeadings = (content) => {
  const tokens = markdownIt.parse(content, {})

  /** @type {string[]} */
  const headings = []

  /** @type {string | null} */
  let headingToken = null

  for (const token of tokens) {
    if (headingTags.has(token.tag)) {
      if (token.type === "heading_open") {
        headingToken = token.markup
      } else if (token.type === "heading_close") {
        headingToken = null
      }
    }

    if (ignoredTokens.has(token.type)) {
      continue
    }

    if (headingToken === null) {
      continue
    }

    const children = token.children ?? []

    headings.push(
      `${children
        .map((token) => {
          return token.content
        })
        .join("")}`,
    )
  }

  return headings
}

const nameHTMLAttributeRegex = getHtmlAttributeRe("name")
const idHTMLAttributeRegex = getHtmlAttributeRe("id")

/**
 * Gets the id or anchor name fragments from a Markdown string.
 * @param {string} content
 * @returns {string[]}
 */
export const getMarkdownIdOrAnchorNameFragments = (content) => {
  const tokens = markdownIt.parse(content, {})

  /** @type {string[]} */
  const result = []

  for (const token of tokens) {
    const regexMatch =
      idHTMLAttributeRegex.exec(token.content) ||
      nameHTMLAttributeRegex.exec(token.content)
    if (regexMatch == null) {
      continue
    }

    const idOrName = regexMatch[1]
    if (idOrName == null || idOrName.length <= 0) {
      continue
    }

    const htmlFragment = "#" + idOrName
    if (!result.includes(htmlFragment)) {
      result.push(htmlFragment)
    }
  }

  return result
}

/**
 * Checks if a string is a valid integer.
 *
 * Using `Number.parseInt` combined with `Number.isNaN` will not be sufficient enough because `Number.parseInt("1abc", 10)` will return `1` (a valid number) instead of `NaN`.
 *
 * @param {string} value
 * @returns {boolean}
 * @example isValidIntegerString("1") // true
 * @example isValidIntegerString("45") // true
 * @example isValidIntegerString("1abc") // false
 * @example isValidIntegerString("1.0") // false
 */
export const isValidIntegerString = (value) => {
  const regex = /^\d+$/
  return regex.test(value)
}

/**
 * Gets the number of lines in a string, based on the number of `\n` characters.
 * @param {string} content
 * @returns {number}
 */
export const getNumberOfLines = (content) => {
  return content.split("\n").length
}

/**
 * Gets the line number string from a fragment.
 * @param {string} fragment
 * @returns {string}
 * @example getLineNumberStringFromFragment("#L50") // 50
 */
export const getLineNumberStringFromFragment = (fragment) => {
  return fragment.slice(2)
}
