[![Codecov](https://img.shields.io/codecov/c/github/ehmicky/merge-error-cause.svg?label=tested&logo=codecov)](https://codecov.io/gh/ehmicky/merge-error-cause)
[![TypeScript](https://img.shields.io/badge/-typed-brightgreen?logo=typescript&colorA=gray&logoColor=0096ff)](/src/main.d.ts)
[![Node](https://img.shields.io/node/v/merge-error-cause.svg?logo=node.js&logoColor=66cc33)](https://www.npmjs.com/package/merge-error-cause)
[![Twitter](https://img.shields.io/badge/%E2%80%8B-twitter-brightgreen.svg?logo=twitter)](https://twitter.com/intent/follow?screen_name=ehmicky)
[![Medium](https://img.shields.io/badge/%E2%80%8B-medium-brightgreen.svg?logo=medium)](https://medium.com/@ehmicky)

Merge an error with its `cause`.

This merges
[`error.cause`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause)
recursively with its parent `error`, including its
[`message`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/message),
[`stack`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/stack),
[`name`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/name)
and
[`errors`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError).

# Example

```js
import mergeErrorCause from 'merge-error-cause'

const main = function (userId) {
  try {
    return createUser(userId)
  } catch (error) {
    throw mergeErrorCause(error)
    // Printed as:
    //   TypeError: Invalid user id: false
    //   Could not create user.
  }
}

const createUser = function (userId) {
  try {
    validateUserId(userId)
    return sendDatabaseRequest('create', userId)
  } catch (cause) {
    throw new Error('Could not create user.', { cause })
  }
}

const validateUserId = function (userId) {
  if (typeof userId !== 'string') {
    throw new TypeError(`Invalid user id: ${userId}.`)
  }
}

main(false)
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

`error` `Error | any`\
_Return value_: `Error`

If `error` is an `Error` instance, it is modified then returned. Otherwise, a
new `error` is created then returned. This never throws.

# Background

[`error.cause`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause)
is a
[recent](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause#browser_compatibility)
JavaScript feature to wrap error messages and properties.

```js
try {
  validateUserId(userId)
  sendDatabaseRequest('create', userId)
} catch (cause) {
  throw new Error('Could not create user.', { cause })
}
```

However, it comes with a few issues.

## Traversing `error.cause`

### Problem

Consumers need to traverse `error.cause`.

<!-- eslint-disable max-depth -->

```js
try {
  createUser(userId)
} catch (error) {
  if (error.code === 'E101' || (error.cause && error.cause.code === 'E101')) {
    // Checking for properties requires traversing `error.cause`
  }

  if (
    error.name === 'UserError' ||
    (error.cause && error.cause.name === 'UserError')
  ) {
    // So does checking for error class
  }
}
```

This is tricky to get right. For example:

- `error.cause.cause` might also exist (and so on)
- If `error` is not an `Error` instance, `error.name` might throw
- Recursing over `error.cause` might be an infinite cycle

### Solution

This library merges `error.cause` recursively. It also
[ensures `error` is an `Error` instance](#normalization). Consumers can then
handle errors without checking its `cause`.

<!-- eslint-disable max-depth -->

```js
try {
  createUser(userId)
} catch (error) {
  if (error.code === 'E101') {
    /* ... */
  }

  if (error.name === 'UserError') {
    /* ... */
  }
}
```

## Verbose stack trace

### Problem

Stack traces with multiple `error.cause` can be quite verbose.

```
Error: Could not create user group.
    at createUserGroup (/home/user/app/user_group.js:19:9)
    at createGroups (/home/user/app/user_group.js:101:10)
    at startApp (/home/user/app/app.js:35:20)
    at main (/home/user/app/app.js:3:4) {
  [cause]: Error: Could not create user.
      at newUser (/home/user/app/user.js:52:7)
      at createUser (/home/user/app/user.js:43:5)
      at createUserGroup (/home/user/app/user_group.js:17:11)
      at createGroups (/home/user/app/user_group.js:101:10)
      at startApp (/home/user/app/app.js:35:20)
      at main (/home/user/app/app.js:3:4) {
    [cause]: Error: Invalid user.
        at validateUser (/home/user/app/user.js:159:8)
        at userInstance (/home/user/app/user.js:20:4)
        at newUser (/home/user/app/user.js:50:7)
        at createUser (/home/user/app/user.js:43:5)
        at createUserGroup (/home/user/app/user_group.js:17:11)
        at createGroups (/home/user/app/user_group.js:101:10)
        at startApp (/home/user/app/app.js:35:20)
        at main (/home/user/app/app.js:3:4) {
      [cause]: UserError: User "15" does not exist.
          at checkUserId (/home/user/app/user.js:195:3)
          at checkUserExist (/home/user/app/user.js:170:10)
          at validateUser (/home/user/app/user.js:157:23)
          at userInstance (/home/user/app/user.js:20:4)
          at newUser (/home/user/app/user.js:50:7)
          at createUser (/home/user/app/user.js:43:5)
          at createUserGroup (/home/user/app/user_group.js:17:11)
          at createGroups (/home/user/app/user_group.js:101:10)
          at startApp (/home/user/app/app.js:35:20)
          at main (/home/user/app/app.js:3:4)
    }
  }
}
```

Each error cause is indented and printed separately.

- The stack traces mostly repeat each other since the function calls are part of
  the same line execution
- The most relevant message (innermost) is harder to find since it is shown last

### Solution

This library only keeps the innermost stack trace. Error messages are
concatenated by default from innermost to outermost. This results in much
simpler stack traces without losing any information.

```
TypeError: User "15" does not exist.
Invalid user.
Could not create user.
Could not create user group.
    at checkUserId (/home/user/app/user.js:195:3)
    at checkUserExist (/home/user/app/user.js:170:10)
    at validateUser (/home/user/app/user.js:157:23)
    at userInstance (/home/user/app/user.js:20:4)
    at newUser (/home/user/app/user.js:50:7)
    at createUser (/home/user/app/user.js:43:5)
    at createUserGroup (/home/user/app/user_group.js:17:11)
    at createGroups (/home/user/app/user_group.js:101:10)
    at startApp (/home/user/app/app.js:35:20)
    at main (/home/user/app/app.js:3:4)
```

# Features

## Stack traces

Only the innermost stack trace is kept.

Please make sure you use `async`/`await` instead of `new Promise()` or callbacks
to prevent truncated stack traces.

## Messages

Inner error messages are printed first.

```js
try {
  throw new Error('Invalid user id.')
} catch (cause) {
  throw new Error('Could not create user.', { cause })
  // Printed as:
  //   Error: Invalid user id.
  //   Could not create user.
}
```

If the outer error message ends with `:`, it is prepended instead.

```js
try {
  throw new Error('Invalid user id.')
} catch (cause) {
  throw new Error('Could not create user:', { cause })
  // Printed as:
  //   Error: Could not create user: Invalid user id.
}
```

`:` can optionally be followed by a newline.

```js
try {
  throw new Error('Invalid user id.')
} catch (cause) {
  throw new Error('Could not create user:\n', { cause })
  // Printed as:
  //   Error: Could not create user:
  //   Invalid user id.
}
```

## Error class

The outer error class is used.

```js
try {
  throw new TypeError('User id is not a string.')
} catch (cause) {
  const error = new UserError('Could not create user.', { cause })
  const mergedError = mergeErrorCause(error)
  console.log(mergedError instanceof UserError) // true
  console.log(mergedError.name) // 'UserError'
}
```

If the parent error class is `Error`, the child class is used instead. This
allows wrapping the error message or properties while keeping its class.

```js
try {
  throw new TypeError('User id is not a string.')
} catch (cause) {
  const error = new Error('Could not create user.', { cause })
  console.log(mergeErrorCause(error) instanceof TypeError) // true
}
```

`error.wrap: true` has the same effect, but works with any parent error class.

```js
try {
  throw new TypeError('User id is not a string.')
} catch (cause) {
  const error = new UserError('Could not create user.', { cause })
  error.wrap = true
  console.log(mergeErrorCause(error) instanceof TypeError) // true
}
```

## Error properties

Error properties are shallowly merged.

<!-- eslint-disable fp/no-mutating-assign -->

```js
// Both `userId` and `invalidUser` are kept
try {
  throw Object.assign(new Error('Invalid user id.'), { userId: '5' })
} catch (cause) {
  throw Object.assign(new Error('Could not create user.', { cause }), {
    invalidUser: true,
  })
}
```

Empty error messages are ignored. This is useful when wrapping error properties.

<!-- eslint-disable fp/no-mutating-assign, unicorn/error-message -->

```js
try {
  throw new Error('Invalid user id.')
} catch (cause) {
  throw Object.assign(new Error('', { cause }), { invalidUser: true })
}
```

## Aggregate errors

Any
[`aggregateError.errors[*].cause`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError)
is processed recursively. However, `aggregateError.errors` are not merged with
each other since those are different from each other.

If both `error.errors` and `error.cause.errors` exist, they are concatenated.

## Normalization

Invalid errors [are normalized](https://github.com/ehmicky/normalize-exception)
to proper `Error` instances.

<!-- eslint-disable no-throw-literal -->

```js
try {
  throw 'Invalid user id.'
} catch (error) {
  console.log(mergeErrorCause(error)) // Error: Invalid user id.
}
```

# Related projects

- [`modern-errors`](https://github.com/ehmicky/modern-errors): Handle errors
  like it's 2022 🔮
- [`error-custom-classes`](https://github.com/ehmicky/error-custom-classes):
  Create multiple error classes
- [`error-custom-class`](https://github.com/ehmicky/error-custom-class): Create
  one error class
- [`error-serializer`](https://github.com/ehmicky/error-serializer): Convert
  errors to/from plain objects
- [`normalize-exception`](https://github.com/ehmicky/normalize-exception):
  Normalize exceptions/errors
- [`set-error-class`](https://github.com/ehmicky/set-error-class): Properly
  update an error's class
- [`set-error-message`](https://github.com/ehmicky/set-error-message): Properly
  update an error's message
- [`set-error-props`](https://github.com/ehmicky/set-error-props): Properly
  update an error's properties
- [`error-cause-polyfill`](https://github.com/ehmicky/error-cause-polyfill):
  Polyfill `error.cause`
- [`handle-cli-error`](https://github.com/ehmicky/handle-cli-error): 💣 Error
  handler for CLI applications 💥
- [`log-process-errors`](https://github.com/ehmicky/log-process-errors): Show
  some ❤ to Node.js process errors

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
