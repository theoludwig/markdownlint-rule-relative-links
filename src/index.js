'use strict'

const { pathToFileURL } = require('node:url')
const fs = require('node:fs')

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

const EXTERNAL_PROTOCOLS = new Set([
  'http:',
  'https:',
  'mailto:',
  'tel:',
  'ftp:'
])

const customRule = {
  names: ['relative-links'],
  description: 'Relative links should be valid',
  tags: ['links'],
  function: (params, onError) => {
    filterTokens(params, 'inline', (token) => {
      token.children.forEach((child) => {
        const { lineNumber, type, attrs } = child
        if (type === 'link_open') {
          attrs.forEach((attr) => {
            if (attr[0] === 'href') {
              const href = attr[1]
              const url = new URL(href, pathToFileURL(params.name))
              url.hash = ''
              const isRelative =
                href.startsWith('./') ||
                href.startsWith('../') ||
                !EXTERNAL_PROTOCOLS.has(url.protocol)
              if (isRelative && !fs.existsSync(url.pathname)) {
                const detail = `Link "${href}" is dead`
                addError(onError, lineNumber, detail)
              }
            }
          })
        }
      })
    })
  }
}

module.exports = customRule
