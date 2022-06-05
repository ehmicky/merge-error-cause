[![Codecov](https://img.shields.io/codecov/c/github/ehmicky/merge-error-cause.svg?label=tested&logo=codecov)](https://codecov.io/gh/ehmicky/merge-error-cause)
[![Build](https://github.com/ehmicky/merge-error-cause/workflows/Build/badge.svg)](https://github.com/ehmicky/merge-error-cause/actions)
[![Node](https://img.shields.io/node/v/merge-error-cause.svg?logo=node.js)](https://www.npmjs.com/package/merge-error-cause)
[![Twitter](https://img.shields.io/badge/%E2%80%8B-twitter-4cc61e.svg?logo=twitter)](https://twitter.com/intent/follow?screen_name=ehmicky)
[![Medium](https://img.shields.io/badge/%E2%80%8B-medium-4cc61e.svg?logo=medium)](https://medium.com/@ehmicky)

Merge an error with its `cause`.

Work in progress!

# Examples

```js

```

# Install

```bash
npm install merge-error-cause
```

This package is an ES module and must be loaded using
[an `import` or `import()` statement](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c),
not `require()`.

# API

## mergeErrorCause(error)

`error` `any`\
_Return value_: `Error`

`mergeErrorCause()` never throws.

If `error` is an `Error` instance and has a `cause`, it is returned. Otherwise,
a new one is created and returned.

# Support

For any question, _don't hesitate_ to [submit an issue on GitHub](../../issues).

Everyone is welcome regardless of personal background. We enforce a
[Code of conduct](CODE_OF_CONDUCT.md) in order to promote a positive and
inclusive environment.

# Contributing

This project was made with ❤️. The simplest way to give back is by starring and
sharing it online.

If the documentation is unclear or has a typo, please click on the page's `Edit`
button (pencil icon) and suggest a correction.

If you would like to help us fix a bug or add a new feature, please check our
[guidelines](CONTRIBUTING.md). Pull requests are welcome!

<!-- Thanks go to our wonderful contributors: -->

<!-- ALL-CONTRIBUTORS-LIST:START -->
<!-- prettier-ignore -->
<!--
<table><tr><td align="center"><a href="https://twitter.com/ehmicky"><img src="https://avatars2.githubusercontent.com/u/8136211?v=4" width="100px;" alt="ehmicky"/><br /><sub><b>ehmicky</b></sub></a><br /><a href="https://github.com/ehmicky/merge-error-cause/commits?author=ehmicky" title="Code">💻</a> <a href="#design-ehmicky" title="Design">🎨</a> <a href="#ideas-ehmicky" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/ehmicky/merge-error-cause/commits?author=ehmicky" title="Documentation">📖</a></td></tr></table>
 -->
<!-- ALL-CONTRIBUTORS-LIST:END -->
