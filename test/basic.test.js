const tap = require('tap')
const { markdownlint } = require('markdownlint').promises

const relativeLinks = require('../src/index.js')

tap.test('ensure we validate correctly', async (t) => {
  const lintResults = await markdownlint({
    files: ['test/fixtures/Valid.md', 'test/fixtures/Invalid.md'],
    config: {
      'relative-links': true
    },
    customRules: [relativeLinks]
  })
  t.equal(lintResults['test/fixtures/Valid.md'].length, 0)
  t.equal(lintResults['test/fixtures/Invalid.md'].length, 2)

  t.equal(
    lintResults['test/fixtures/Invalid.md'][0]?.ruleDescription,
    'Relative links should be valid'
  )
  t.equal(
    lintResults['test/fixtures/Invalid.md'][0]?.errorDetail,
    'Link "./basic.test.js" is dead'
  )

  t.equal(
    lintResults['test/fixtures/Invalid.md'][1]?.ruleDescription,
    'Relative links should be valid'
  )
  t.equal(
    lintResults['test/fixtures/Invalid.md'][1]?.errorDetail,
    'Link "../image.png" is dead'
  )
})
