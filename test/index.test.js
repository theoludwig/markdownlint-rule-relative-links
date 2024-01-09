const { test } = require("node:test")
const assert = require("node:assert/strict")

const { markdownlint } = require("markdownlint").promises

const relativeLinksRule = require("../src/index.js")

/**
 *
 * @param {string} fixtureFile
 * @returns
 */
const validateMarkdownLint = async (fixtureFile) => {
  const lintResults = await markdownlint({
    files: [fixtureFile],
    config: {
      default: false,
      "relative-links": true,
    },
    customRules: [relativeLinksRule],
  })
  return lintResults[fixtureFile]
}

test("ensure the rule validates correctly", async (t) => {
  await t.test("should be valid", async (t) => {
    await t.test("with an existing heading fragment", async () => {
      const lintResults = await validateMarkdownLint(
        "test/fixtures/valid/existing-heading-fragment/existing-heading-fragment.md",
      )
      assert.equal(lintResults?.length, 0)
    })

    await t.test("with an existing file", async () => {
      const lintResults = await validateMarkdownLint(
        "test/fixtures/valid/existing-file.md",
      )
      assert.equal(lintResults?.length, 0)
    })

    await t.test("with an existing image", async () => {
      const lintResults = await validateMarkdownLint(
        "test/fixtures/valid/existing-image.md",
      )
      assert.equal(lintResults?.length, 0)
    })

    await t.test("should ignore absolute paths", async () => {
      const lintResults = await validateMarkdownLint(
        "test/fixtures/valid/ignore-absolute-paths.md",
      )
      assert.equal(lintResults?.length, 0)
    })

    await t.test("should ignore external links", async () => {
      const lintResults = await validateMarkdownLint(
        "test/fixtures/valid/ignore-external-links.md",
      )
      assert.equal(lintResults?.length, 0)
    })
  })

  await t.test("should be invalid", async (t) => {
    await t.test("with a non-existing heading fragment", async () => {
      const lintResults = await validateMarkdownLint(
        "test/fixtures/invalid/non-existing-heading-fragment/non-existing-heading-fragment.md",
      )
      assert.equal(lintResults?.length, 1)
      assert.deepEqual(lintResults?.[0]?.ruleNames, relativeLinksRule.names)
      assert.equal(
        lintResults?.[0]?.ruleDescription,
        relativeLinksRule.description,
      )
      assert.equal(
        lintResults?.[0]?.errorDetail,
        '"./awesome.md#non-existing-heading" should have a valid fragment identifier',
      )
    })

    await t.test("with a non-existing file", async () => {
      const lintResults = await validateMarkdownLint(
        "test/fixtures/invalid/non-existing-file.md",
      )
      assert.equal(lintResults?.length, 1)
      assert.deepEqual(lintResults?.[0]?.ruleNames, relativeLinksRule.names)
      assert.equal(
        lintResults?.[0]?.ruleDescription,
        relativeLinksRule.description,
      )
      assert.equal(
        lintResults?.[0]?.errorDetail,
        '"./index.test.js" should exist in the file system',
      )
    })

    await t.test("with a non-existing image", async () => {
      const lintResults = await validateMarkdownLint(
        "test/fixtures/invalid/non-existing-image.md",
      )
      assert.equal(lintResults?.length, 1)
      assert.deepEqual(lintResults?.[0]?.ruleNames, relativeLinksRule.names)
      assert.equal(
        lintResults?.[0]?.ruleDescription,
        relativeLinksRule.description,
      )
      assert.equal(
        lintResults?.[0]?.errorDetail,
        '"./image.png" should exist in the file system',
      )
    })
  })
})
