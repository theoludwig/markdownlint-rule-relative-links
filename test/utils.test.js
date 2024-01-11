const { test } = require("node:test")
const assert = require("node:assert/strict")

const {
  convertHeadingToHTMLFragment,
  getMarkdownHeadings,
  getMarkdownAnchorHTMLFragments,
} = require("../src/utils.js")

test("utils", async (t) => {
  await t.test("convertHeadingToHTMLFragment", async () => {
    assert.strictEqual(
      convertHeadingToHTMLFragment("Valid Fragments"),
      "#valid-fragments",
    )
    assert.strictEqual(
      convertHeadingToHTMLFragment("Valid Heading With Underscores _"),
      "#valid-heading-with-underscores-_",
    )
    assert.strictEqual(
      convertHeadingToHTMLFragment(
        `Valid Heading With Quotes ' And Double Quotes "`,
      ),
      "#valid-heading-with-quotes--and-double-quotes-",
    )
    assert.strictEqual(
      convertHeadingToHTMLFragment("🚀 Valid Heading With Emoji"),
      "#-valid-heading-with-emoji",
    )
  })

  await t.test("getMarkdownHeadings", async () => {
    assert.deepStrictEqual(
      getMarkdownHeadings("# Hello\n\n## World\n\n## Hello, world!\n"),
      ["Hello", "World", "Hello, world!"],
    )
  })

  await t.test("getMarkdownAnchorHTMLFragments", async () => {
    assert.deepStrictEqual(
      getMarkdownAnchorHTMLFragments('<a name="anchorName" id="anchorId"></a>'),
      ["#anchorId"],
    )
    assert.deepStrictEqual(
      getMarkdownAnchorHTMLFragments('<a name="anchorName"></a>'),
      ["#anchorName"],
    )
    assert.deepStrictEqual(getMarkdownAnchorHTMLFragments("<a></a>"), [])
    assert.deepStrictEqual(getMarkdownAnchorHTMLFragments("<a>"), [])
  })
})
