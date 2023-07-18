'use strict'

const { pathToFileURL } = require('node:url')
const fs = require('node:fs')

const {
  filterTokens,
  addError,
  convertHeadingToHTMLFragment,
  getMarkdownHeadings
} = require('./utils.js')

const customRule = {
  names: ['relative-links'],
  description: 'Relative links should be valid',
  tags: ['links'],
  function: (params, onError) => {
    filterTokens(params, 'inline', (token) => {
      for (const child of token.children) {
        const { lineNumber, type, attrs } = child

        /** @type {string | null} */
        let hrefSrc = null

        if (type === 'link_open') {
          for (const attr of attrs) {
            if (attr[0] === 'href') {
              hrefSrc = attr[1]
              break
            }
          }
        }

        if (type === 'image') {
          for (const attr of attrs) {
            if (attr[0] === 'src') {
              hrefSrc = attr[1]
              break
            }
          }
        }

        if (hrefSrc != null) {
          const url = new URL(hrefSrc, pathToFileURL(params.name))
          const isRelative =
            url.protocol === 'file:' && !hrefSrc.startsWith('/')
          if (isRelative) {
            const detail = `Link "${hrefSrc}"`

            if (!fs.existsSync(url)) {
              addError(
                onError,
                lineNumber,
                `${detail} should exist in the file system`
              )
              continue
            }

            if (type === 'link_open' && url.hash !== '') {
              const fileContent = fs.readFileSync(url, { encoding: 'utf8' })
              const headings = getMarkdownHeadings(fileContent)

              /** @type {Map<string, number>} */
              const fragments = new Map()

              const headingsHTMLFragments = headings.map((heading) => {
                const fragment = convertHeadingToHTMLFragment(heading)
                const count = fragments.get(fragment) ?? 0
                fragments.set(fragment, count + 1)
                if (count !== 0) {
                  return `${fragment}-${count}`
                }
                return fragment
              })

              if (!headingsHTMLFragments.includes(url.hash)) {
                addError(
                  onError,
                  lineNumber,
                  `${detail} should have a valid fragment`
                )
              }
            }
          }
        }
      }
    })
  }
}

module.exports = customRule
