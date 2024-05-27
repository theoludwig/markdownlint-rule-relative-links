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
        name: "should be invalid with an empty id fragment",
        fixturePath:
          "test/fixtures/invalid/empty-id-fragment/empty-id-fragment.md",
        errors: ['"./awesome.md#" should have a valid fragment identifier'],
      },
      {
        name: "should be invalid with a name fragment other than for an anchor",
        fixturePath:
          "test/fixtures/invalid/ignore-name-fragment-if-not-an-anchor/ignore-name-fragment-if-not-an-anchor.md",
        errors: [
          '"./awesome.md#name-should-be-ignored" should have a valid fragment identifier',
        ],
      },
      {
        name: "should be invalid with a non-existing id fragment (data-id !== id)",
        fixturePath:
          "test/fixtures/invalid/ignore-not-an-id-fragment/ignore-not-an-id-fragment.md",
        errors: [
          '"./awesome.md#not-an-id-should-be-ignored" should have a valid fragment identifier',
        ],
      },
      {
        name: "should be invalid with uppercase letters in fragment (case sensitive)",
        fixturePath:
          "test/fixtures/invalid/invalid-heading-case-sensitive/invalid-heading-case-sensitive.md",
        errors: [
          '"./awesome.md#ExistIng-Heading" should have a valid fragment identifier',
        ],
      },
      {
        name: "should be invalid with invalid heading with #L fragment",
        fixturePath:
          "test/fixtures/invalid/invalid-heading-with-L-fragment/invalid-heading-with-L-fragment.md",
        errors: [
          '"./awesome.md#L7abc" should have a valid fragment identifier',
        ],
      },
      {
        name: "should be invalid with a invalid line column range number fragment",
        fixturePath:
          "test/fixtures/invalid/invalid-line-column-range-number-fragment/invalid-line-column-range-number-fragment.md",
        errors: [
          '"./awesome.md#L12-not-a-line-link" should have a valid fragment identifier',
          '"./awesome.md#l7" should have a valid fragment identifier',
          '"./awesome.md#L" should have a valid fragment identifier',
          '"./awesome.md#L7extra" should have a valid fragment identifier',
          '"./awesome.md#L30C" should have a valid fragment identifier',
          '"./awesome.md#L30Cextra" should have a valid fragment identifier',
          '"./awesome.md#L30L12" should have a valid fragment identifier',
          '"./awesome.md#L30C12" should have a valid fragment identifier',
          '"./awesome.md#L30C11-" should have a valid fragment identifier',
          '"./awesome.md#L30C11-L" should have a valid fragment identifier',
          '"./awesome.md#L30C11-L31C" should have a valid fragment identifier',
          '"./awesome.md#L30C11-C31" should have a valid fragment identifier',
          '"./awesome.md#C30" should have a valid fragment identifier',
          '"./awesome.md#C11-C31" should have a valid fragment identifier',
          '"./awesome.md#C11-L4C31" should have a valid fragment identifier',
        ],
      },
      {
        name: "should be invalid with a invalid line number fragment",
        fixturePath:
          "test/fixtures/invalid/invalid-line-number-fragment/invalid-line-number-fragment.md",
        errors: [
          '"./awesome.md#L7" should have a valid fragment identifier, "./awesome.md#L7" should have at least 7 lines to be valid',
        ],
      },
      {
        name: "should be invalid with a non-existing anchor name fragment",
        fixturePath:
          "test/fixtures/invalid/non-existing-anchor-name-fragment/non-existing-anchor-name-fragment.md",
        errors: [
          '"./awesome.md#non-existing-anchor-name-fragment" should have a valid fragment identifier',
        ],
      },
      {
        name: "should be invalid with a non-existing element id fragment",
        fixturePath:
          "test/fixtures/invalid/non-existing-element-id-fragment/non-existing-element-id-fragment.md",
        errors: [
          '"./awesome.md#non-existing-element-id-fragment" should have a valid fragment identifier',
        ],
      },
      {
        name: "should be invalid with a non-existing heading fragment",
        fixturePath:
          "test/fixtures/invalid/non-existing-heading-fragment/non-existing-heading-fragment.md",
        errors: [
          '"./awesome.md#non-existing-heading" should have a valid fragment identifier',
        ],
      },
      {
        name: "should be invalid with a link to an image with a empty fragment",
        fixturePath:
          "test/fixtures/invalid/ignore-empty-fragment-checking-for-image.md",
        errors: [
          '"../image.png#" should not have a fragment identifier as it is an image',
        ],
      },
      {
        name: "should be invalid with a link to an image with a fragment",
        fixturePath:
          "test/fixtures/invalid/ignore-fragment-checking-for-image.md",
        errors: [
          '"../image.png#non-existing-fragment" should not have a fragment identifier as it is an image',
        ],
      },
      {
        name: "should be invalid with a non-existing file",
        fixturePath: "test/fixtures/invalid/non-existing-file.md",
        errors: ['"./index.test.js" should exist in the file system'],
      },
      {
        name: "should be invalid with a non-existing image",
        fixturePath: "test/fixtures/invalid/non-existing-image.md",
        errors: ['"./image.png" should exist in the file system'],
      },
    ]

    for (const { name, fixturePath, errors } of testCases) {
      await t.test(name, async () => {
        const lintResults = (await validateMarkdownLint(fixturePath)) ?? []
        const errorsDetails = lintResults.map((result) => {
          assert.deepEqual(result.ruleNames, relativeLinksRule.names)
          assert.deepEqual(
            result.ruleDescription,
            relativeLinksRule.description,
          )
          return result.errorDetail
        })
        assert.deepStrictEqual(
          errorsDetails,
          errors,
          `${fixturePath}: Expected errors`,
        )
      })
    }
  })

  await t.test("should be valid", async (t) => {
    const testCases = [
      {
        name: "should be valid with an existing anchor name fragment",
        fixturePath:
          "test/fixtures/valid/existing-anchor-name-fragment/existing-anchor-name-fragment.md",
      },
      {
        name: "should be valid with an existing element id fragment",
        fixturePath:
          "test/fixtures/valid/existing-element-id-fragment/existing-element-id-fragment.md",
      },
      {
        name: "should be valid with an existing heading fragment",
        fixturePath:
          "test/fixtures/valid/existing-heading-fragment/existing-heading-fragment.md",
      },
      {
        name: 'should be valid with an existing heading fragment with accents (e.g: "é")',
        fixturePath:
          "test/fixtures/valid/existing-heading-with-accents/existing-heading-with-accents.md",
      },
      {
        name: "should only parse markdown files for fragments checking",
        fixturePath:
          "test/fixtures/valid/only-parse-markdown-files-for-fragments/only-parse-markdown-files-for-fragments.md",
      },
      {
        name: "should support lines and columns range numbers in link fragments",
        fixturePath:
          "test/fixtures/valid/valid-line-column-range-number-fragment/valid-line-column-range-number-fragment.md",
      },
      {
        name: 'should be valid with valid heading "like" line number fragment',
        fixturePath:
          "test/fixtures/valid/valid-heading-like-number-fragment/valid-heading-like-number-fragment.md",
      },
      {
        name: "should be valid with valid line number fragment",
        fixturePath:
          "test/fixtures/valid/valid-line-number-fragment/valid-line-number-fragment.md",
      },
      {
        name: "should be valid with an existing file",
        fixturePath: "test/fixtures/valid/existing-file.md",
      },
      {
        name: "should be valid with an existing image",
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
        const lintResults = (await validateMarkdownLint(fixturePath)) ?? []
        const errorsDetails = lintResults.map((result) => {
          return result.errorDetail
        })
        assert.equal(
          errorsDetails.length,
          0,
          `${fixturePath}: Expected no errors, got ${errorsDetails.join(", ")}`,
        )
      })
    }
  })
})
