<h1 align="center">markdownlint-rule-relative-links</h1>

<p align="center">
  <strong>Custom rule for <a href="https://github.com/DavidAnson/markdownlint">markdownlint</a> to validate relative links.</strong>
</p>

<p align="center">
  <a href="./CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat" alt="CONTRIBUTING" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/licence-MIT-blue.svg" alt="Licence MIT"/></a>
  <a href="./CODE_OF_CONDUCT.md"><img src="https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg" alt="Contributor Covenant" /></a>
  <br />
  <a href="https://github.com/theoludwig/markdownlint-rule-relative-links/actions/workflows/lint.yml"><img src="https://github.com/theoludwig/markdownlint-rule-relative-links/actions/workflows/lint.yml/badge.svg?branch=develop" alt="Lint" /></a>
  <a href="https://github.com/theoludwig/markdownlint-rule-relative-links/actions/workflows/test.yml"><img src="https://github.com/theoludwig/markdownlint-rule-relative-links/actions/workflows/test.yml/badge.svg?branch=develop" alt="Test" /></a>
  <br />
  <a href="https://conventionalcommits.org"><img src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg" alt="Conventional Commits" /></a>
  <a href="https://github.com/semantic-release/semantic-release"><img src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg" alt="semantic-release" /></a>
  <a href="https://www.npmjs.com/package/markdownlint-rule-relative-links"><img src="https://img.shields.io/npm/v/markdownlint-rule-relative-links.svg" alt="npm version"></a>
</p>

## 📜 About

**markdownlint-rule-relative-links** is a [markdownlint](https://github.com/DavidAnson/markdownlint) custom rule to validate relative links.

It ensures that relative links (using `file:` protocol) are working and exists in the file system of the project that uses [markdownlint](https://github.com/DavidAnson/markdownlint).

### Example

File structure:

```txt
├── abc.txt
└── awesome.md
```

With `awesome.md` content:

```md
[abc](./abc.txt)

[Invalid link](./invalid.txt)
```

Running [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2) with `markdownlint-rule-relative-links` will output:

```sh
awesome.md:3 relative-links Relative links should be valid ["./invalid.txt" should exist in the file system]
```

### Additional features

- Support images (e.g: `![Image](./image.png)`).
- Support links fragments similar to the [built-in `markdownlint` rule - MD051](https://github.com/DavidAnson/markdownlint/blob/main/doc/md051.md) (e.g: `[Link](./awesome.md#heading)`).
- Ignore external links and absolute paths as it only checks relative links (e.g: `https://example.com/` or `/absolute/path.png`).

### Limitations

- Only images and links defined using markdown syntax are validated, html syntax is ignored (e.g: `<a href="./link.txt" />` or `<img src="./image.png" />`).

Contributions are welcome to improve the rule, and to alleviate these limitations. See [CONTRIBUTING.md](./CONTRIBUTING.md) for more information.

### Related links

- [DavidAnson/markdownlint#253](https://github.com/DavidAnson/markdownlint/issues/253)
- [DavidAnson/markdownlint#121](https://github.com/DavidAnson/markdownlint/issues/121)
- [nschonni/markdownlint-valid-links](https://github.com/nschonni/markdownlint-valid-links)

## Prerequisites

[Node.js](https://nodejs.org/) >= 16.0.0

## Installation

```sh
npm install --save-dev markdownlint-rule-relative-links
```

## Configuration

There are various ways [markdownlint](https://github.com/DavidAnson/markdownlint) can be configured using objects, config files etc. For more information on configuration refer to [options.config](https://github.com/DavidAnson/markdownlint#optionsconfig).

We recommend configuring [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2) over [markdownlint-cli](https://github.com/igorshubovych/markdownlint-cli) for compatibility with the [vscode-markdownlint](https://github.com/DavidAnson/vscode-markdownlint) extension.

`.markdownlint-cli2.jsonc`

```json
{
  "config": {
    "default": true,
    "relative-links": true
  },
  "globs": ["**/*.md"],
  "ignores": ["**/node_modules"],
  "customRules": ["markdownlint-rule-relative-links"]
}
```

`package.json`

```json
{
  "scripts": {
    "lint:markdown": "markdownlint-cli2"
  }
}
```

## Usage

```sh
npm run lint:markdown
```

## 💡 Contributing

Anyone can help to improve the project, submit a Feature Request, a bug report or even correct a simple spelling mistake.

The steps to contribute can be found in the [CONTRIBUTING.md](./CONTRIBUTING.md) file.

## 📄 License

[MIT](./LICENSE)
