const MarkdownIt = require('markdown-it')

/**
 * Calls the provided function for each matching token.
 *
 * @param {Object} params RuleParams instance.
 * @param {string} type Token type identifier.
 * @param {Function} handler Callback function.
 * @returns {void}
 */
const filterTokens = (params, type, handler) => {
  for (const token of params.tokens) {
    if (token.type === type) {
      handler(token)
    }
  }
}

/**
 * Adds a generic error object via the onError callback.
 *
 * @param {Object} onError RuleOnError instance.
 * @param {number} lineNumber Line number.
 * @param {string} [detail] Error details.
 * @param {string} [context] Error context.
 * @param {number[]} [range] Column and length of error.
 * @param {Object} [fixInfo] RuleOnErrorFixInfo instance.
 * @returns {void}
 */
const addError = (onError, lineNumber, detail, context, range, fixInfo) => {
  onError({
    lineNumber,
    detail,
    context,
    range,
    fixInfo
  })
}

/**
 * Converts a Markdown heading into an HTML fragment according to the rules
 * used by GitHub.
 *
 * Taken from <https://github.com/DavidAnson/markdownlint/blob/d01180ec5a014083ee9d574b693a8d7fbc1e566d/lib/md051.js#L19>
 *
 * @param {string} inlineText Inline token for heading.
 * @returns {string} Fragment string for heading.
 */
const convertHeadingToHTMLFragment = (inlineText) => {
  return (
    '#' +
    encodeURIComponent(
      inlineText
        .toLowerCase()
        // RegExp source with Ruby's \p{Word} expanded into its General Categories
        // eslint-disable-next-line max-len
        // https://github.com/gjtorikian/html-pipeline/blob/main/lib/html/pipeline/toc_filter.rb
        // https://ruby-doc.org/core-3.0.2/Regexp.html
        .replace(
          /[^\p{Letter}\p{Mark}\p{Number}\p{Connector_Punctuation}\- ]/gu,
          ''
        )
        .replace(/ /gu, '-')
    )
  )
}

const headingTags = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
const ignoredTokens = new Set(['heading_open', 'heading_close'])

/**
 * Gets the headings from a Markdown string.
 * @param {string} content
 * @returns {string[]}
 */
const getMarkdownHeadings = (content) => {
  const markdownIt = new MarkdownIt({ html: true })
  const tokens = markdownIt.parse(content, {})

  /** @type {string[]} */
  const headings = []

  /** @type {string | null} */
  let headingToken = null

  for (const token of tokens) {
    if (headingTags.has(token.tag)) {
      if (token.type === 'heading_open') {
        headingToken = token.markup
      } else if (token.type === 'heading_close') {
        headingToken = null
      }
    }

    if (ignoredTokens.has(token.type)) {
      continue
    }

    if (headingToken === null) {
      continue
    }

    headings.push(
      `${token.children
        .map((token) => {
          return token.content
        })
        .join('')}`
    )
  }

  return headings
}

module.exports = {
  filterTokens,
  addError,
  convertHeadingToHTMLFragment,
  getMarkdownHeadings
}
