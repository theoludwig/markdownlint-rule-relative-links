const test = require('node:test')
const assert = require('node:assert/strict')

const { markdownlint } = require('markdownlint').promises

const relativeLinks = require('../src/index.js')

test('ensure we validate correctly', async () => {
  const lintResults = await markdownlint({
    files: ['test/fixtures/Valid.md', 'test/fixtures/Invalid.md'],
    config: {
      'relative-links': true
    },
    customRules: [relativeLinks]
  })
  assert.equal(lintResults['test/fixtures/Valid.md'].length, 0)
  assert.equal(lintResults['test/fixtures/Invalid.md'].length, 2)

  assert.equal(
    lintResults['test/fixtures/Invalid.md'][0]?.ruleDescription,
    'Relative links should be valid'
  )
  assert.equal(
    lintResults['test/fixtures/Invalid.md'][0]?.errorDetail,
    'Link "./basic.test.js" is dead'
  )

  assert.equal(
    lintResults['test/fixtures/Invalid.md'][1]?.ruleDescription,
    'Relative links should be valid'
  )
  assert.equal(
    lintResults['test/fixtures/Invalid.md'][1]?.errorDetail,
    'Link "../image.png" is dead'
  )
})
