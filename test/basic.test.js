const test = require("node:test")
const assert = require("node:assert/strict")

const { markdownlint } = require("markdownlint").promises

const relativeLinks = require("../src/index.js")

test("ensure the rule validate correctly", async () => {
  const lintResults = await markdownlint({
    files: ["test/fixtures/Valid.md", "test/fixtures/Invalid.md"],
    config: {
      default: false,
      "relative-links": true,
    },
    customRules: [relativeLinks],
  })
  assert.equal(lintResults["test/fixtures/Valid.md"].length, 0)
  assert.equal(lintResults["test/fixtures/Invalid.md"].length, 3)

  assert.equal(
    lintResults["test/fixtures/Invalid.md"][0]?.ruleDescription,
    "Relative links should be valid",
  )
  assert.equal(
    lintResults["test/fixtures/Invalid.md"][0]?.errorDetail,
    'Link "./basic.test.js" should exist in the file system',
  )

  assert.equal(
    lintResults["test/fixtures/Invalid.md"][1]?.ruleDescription,
    "Relative links should be valid",
  )
  assert.equal(
    lintResults["test/fixtures/Invalid.md"][1]?.errorDetail,
    'Link "../image.png" should exist in the file system',
  )

  assert.equal(
    lintResults["test/fixtures/Invalid.md"][2]?.ruleDescription,
    "Relative links should be valid",
  )
  assert.equal(
    lintResults["test/fixtures/Invalid.md"][2]?.errorDetail,
    'Link "./Valid.md#not-existing-heading" should have a valid fragment',
  )
})
