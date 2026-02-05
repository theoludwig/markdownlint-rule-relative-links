import { test } from "node:test"
import assert from "node:assert/strict"

import {
  convertHeadingToHTMLFragment,
  getMarkdownHeadings,
  getMarkdownIdOrAnchorNameFragments,
  isValidIntegerString,
  getNumberOfLines,
  getLineNumberStringFromFragment,
} from "../src/utils.js"

test("utils", async (t) => {
  await t.test("convertHeadingToHTMLFragment", async () => {
    assert.strictEqual(convertHeadingToHTMLFragment("Valid Fragments"), "#valid-fragments")
    assert.strictEqual(
      convertHeadingToHTMLFragment("Valid Heading With Underscores _"),
      "#valid-heading-with-underscores-_",
    )
    assert.strictEqual(
      convertHeadingToHTMLFragment(`Valid Heading With Quotes ' And Double Quotes "`),
      "#valid-heading-with-quotes--and-double-quotes-",
    )
    assert.strictEqual(
      convertHeadingToHTMLFragment("🚀 Valid Heading With Emoji"),
      "#-valid-heading-with-emoji",
    )
  })

  await t.test("getMarkdownHeadings", async () => {
    assert.deepStrictEqual(getMarkdownHeadings("# Hello\n\n## World\n\n## Hello, world!\n"), [
      "Hello",
      "World",
      "Hello, world!",
    ])
  })

  await t.test("getMarkdownIdOrAnchorNameFragments", async () => {
    assert.deepStrictEqual(
      getMarkdownIdOrAnchorNameFragments('<a name="anchorName" id="anchorId">Link</a>'),
      ["#anchorId"],
    )
    assert.deepStrictEqual(getMarkdownIdOrAnchorNameFragments('<a name="anchorName">Link</a>'), [
      "#anchorName",
    ])
    assert.deepStrictEqual(getMarkdownIdOrAnchorNameFragments("<a>Link</a>"), [])
    assert.deepStrictEqual(getMarkdownIdOrAnchorNameFragments("<a>"), [])
    assert.deepStrictEqual(getMarkdownIdOrAnchorNameFragments("<a id=>"), [])
  })

  await t.test("isValidIntegerString", async () => {
    assert.strictEqual(isValidIntegerString("1"), true)
    assert.strictEqual(isValidIntegerString("45"), true)
    assert.strictEqual(isValidIntegerString("1abc"), false)
    assert.strictEqual(isValidIntegerString("1.0"), false)
  })

  await t.test("getNumberOfLines", async () => {
    assert.strictEqual(getNumberOfLines(""), 1)
    assert.strictEqual(getNumberOfLines("Hello"), 1)
    assert.strictEqual(getNumberOfLines("Hello\nWorld"), 2)
    assert.strictEqual(getNumberOfLines("Hello\nWorld\n"), 3)
    assert.strictEqual(getNumberOfLines("Hello\nWorld\n\n"), 4)
  })

  await t.test("getLineNumberStringFromFragment", async () => {
    assert.strictEqual(getLineNumberStringFromFragment("#L50"), "50")
  })
})
