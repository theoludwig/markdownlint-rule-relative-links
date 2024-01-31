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
  await t.test("should be invalid", async (t) => {
    const testCases = [
      {
        name: "with an empty id fragment",
        fixturePath:
          "test/fixtures/invalid/empty-id-fragment/empty-id-fragment.md",
        error: '"./awesome.md#" should have a valid fragment identifier',
      },
      {
        name: "with a name fragment other than for an anchor",
        fixturePath:
          "test/fixtures/invalid/ignore-name-fragment-if-not-an-anchor/ignore-name-fragment-if-not-an-anchor.md",
        error:
          '"./awesome.md#name-should-be-ignored" should have a valid fragment identifier',
      },
      {
        name: "with a non-existing id fragment (data-id !== id)",
        fixturePath:
          "test/fixtures/invalid/ignore-not-an-id-fragment/ignore-not-an-id-fragment.md",
        error:
          '"./awesome.md#not-an-id-should-be-ignored" should have a valid fragment identifier',
      },
      {
        name: "with invalid heading with #L fragment",
        fixturePath:
          "test/fixtures/invalid/invalid-heading-with-L-fragment/invalid-heading-with-L-fragment.md",
        error: '"./awesome.md#L7abc" should have a valid fragment identifier',
      },
      {
        name: "with a invalid line number fragment",
        fixturePath:
          "test/fixtures/invalid/invalid-line-number-fragment/invalid-line-number-fragment.md",
        error:
          '"./awesome.md#L7" should have a valid fragment identifier, "./awesome.md#L7" should have at least 7 lines to be valid',
      },
      {
        name: "with a non-existing anchor name fragment",
        fixturePath:
          "test/fixtures/invalid/non-existing-anchor-name-fragment/non-existing-anchor-name-fragment.md",
        error:
          '"./awesome.md#non-existing-anchor-name-fragment" should have a valid fragment identifier',
      },
      {
        name: "with a non-existing element id fragment",
        fixturePath:
          "test/fixtures/invalid/non-existing-element-id-fragment/non-existing-element-id-fragment.md",
        error:
          '"./awesome.md#non-existing-element-id-fragment" should have a valid fragment identifier',
      },
      {
        name: "with a non-existing heading fragment",
        fixturePath:
          "test/fixtures/invalid/non-existing-heading-fragment/non-existing-heading-fragment.md",
        error:
          '"./awesome.md#non-existing-heading" should have a valid fragment identifier',
      },
      {
        name: "with a link to an image with a empty fragment",
        fixturePath:
          "test/fixtures/invalid/ignore-empty-fragment-checking-for-image.md",
        error:
          '"../image.png#" should not have a fragment identifier as it is an image',
      },
      {
        name: "with a link to an image with a fragment",
        fixturePath:
          "test/fixtures/invalid/ignore-fragment-checking-for-image.md",
        error:
          '"../image.png#non-existing-fragment" should not have a fragment identifier as it is an image',
      },
      {
        name: "with a non-existing file",
        fixturePath: "test/fixtures/invalid/non-existing-file.md",
        error: '"./index.test.js" should exist in the file system',
      },
      {
        name: "with a non-existing image",
        fixturePath: "test/fixtures/invalid/non-existing-image.md",
        error: '"./image.png" should exist in the file system',
      },
    ]

    for (const { name, fixturePath, error } of testCases) {
      await t.test(name, async () => {
        const lintResults = await validateMarkdownLint(fixturePath)
        assert.equal(lintResults?.length, 1)
        assert.deepEqual(lintResults?.[0]?.ruleNames, relativeLinksRule.names)
        assert.equal(
          lintResults?.[0]?.ruleDescription,
          relativeLinksRule.description,
        )
        assert.equal(lintResults?.[0]?.errorDetail, error)
      })
    }
  })

  await t.test("should be valid", async (t) => {
    const testCases = [
      {
        name: "with an existing anchor name fragment",
        fixturePath:
          "test/fixtures/valid/existing-anchor-name-fragment/existing-anchor-name-fragment.md",
      },
      {
        name: "with an existing element id fragment",
        fixturePath:
          "test/fixtures/valid/existing-element-id-fragment/existing-element-id-fragment.md",
      },
      {
        name: "with an existing heading fragment (case insensitive)",
        fixturePath:
          "test/fixtures/valid/existing-heading-case-insensitive/existing-heading-case-insensitive.md",
      },
      {
        name: "with an existing heading fragment",
        fixturePath:
          "test/fixtures/valid/existing-heading-fragment/existing-heading-fragment.md",
      },
      {
        name: "should only parse markdown files for fragments checking",
        fixturePath:
          "test/fixtures/valid/only-parse-markdown-files-for-fragments/only-parse-markdown-files-for-fragments.md",
      },
      {
        name: 'with valid heading "like" line number fragment',
        fixturePath:
          "test/fixtures/valid/valid-heading-like-number-fragment/valid-heading-like-number-fragment.md",
      },
      {
        name: "with valid line number fragment",
        fixturePath:
          "test/fixtures/valid/valid-line-number-fragment/valid-line-number-fragment.md",
      },
      {
        name: "with an existing file",
        fixturePath: "test/fixtures/valid/existing-file.md",
      },
      {
        name: "with an existing image",
        fixturePath: "test/fixtures/valid/existing-image.md",
      },
      {
        name: "should ignore absolute paths",
        fixturePath: "test/fixtures/valid/ignore-absolute-paths.md",
      },
      {
        name: "should ignore external links",
        fixturePath: "test/fixtures/valid/ignore-external-links.md",
      },
      {
        name: "should ignore checking fragment in own file",
        fixturePath:
          "test/fixtures/valid/ignore-fragment-checking-in-own-file.md",
      },
    ]

    for (const { name, fixturePath } of testCases) {
      await t.test(name, async () => {
        const lintResults = await validateMarkdownLint(fixturePath)
        assert.equal(lintResults?.length, 0)
      })
    }
  })
})
