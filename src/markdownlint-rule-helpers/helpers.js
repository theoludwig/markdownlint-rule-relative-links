/**
 * Dependency Vendoring of `markdownlint-rule-helpers`
 * @see https://www.npmjs.com/package/markdownlint-rule-helpers
 */

/** @typedef {import('markdownlint').RuleParams} MarkdownLintRuleParams */
/** @typedef {import('markdownlint').MarkdownItToken} MarkdownItToken */

/**
 * Calls the provided function for each matching token.
 *
 * @param {MarkdownLintRuleParams} params RuleParams instance.
 * @param {string} type Token type identifier.
 * @param {(token: MarkdownItToken) => void} handler Callback function.
 * @returns {void}
 */
const filterTokens = (params, type, handler) => {
  for (const token of params.parsers.markdownit.tokens) {
    if (token.type === type) {
      handler(token)
    }
  }
}

/**
 * Gets a Regular Expression for matching the specified HTML attribute.
 *
 * @param {string} name HTML attribute name.
 * @returns {RegExp} Regular Expression for matching.
 */
const getHtmlAttributeRe = (name) => {
  return new RegExp(`\\s${name}\\s*=\\s*['"]?([^'"\\s>]*)`, "iu")
}

module.exports = {
  filterTokens,
  getHtmlAttributeRe,
}
