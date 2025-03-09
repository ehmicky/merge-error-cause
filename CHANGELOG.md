# 5.0.1

## Bug fixes

- Fix `error.message` repeating in `error.stack`, if an invalid `error.cause` is
  used

# 5.0.0

## Breaking changes

- Minimal supported Node.js version is now `18.18.0`

# 4.0.1

## Dependencies

- Upgrade internal dependencies

# 4.0.0

## Breaking changes

- Minimal supported Node.js version is now `16.17.0`

# 3.5.0

## Features

- Improve [`set-error-props`](https://github.com/ehmicky/set-error-props)
  dependency

# 3.4.0

## Features

- Separate message wrapping logic to own library
  [`wrap-error-message`](https://github.com/ehmicky/wrap-error-message)

# 3.3.0

## Features

- Add browser support

# 3.2.0

## Features

- Improve TypeScript types

# 3.1.1

## Bug fixes

- Fix `package.json`

# 3.1.0

- Switch to MIT license

# 3.0.0

## Breaking changes

- When the argument's class is `Error` or when it has a `wrap: true` property,
  its `cause` property is now
  [modified and returned instead](README.md#error-class).

# 2.5.1

## Bug fixes

- Delete internal `wrap` property

# 2.5.0

## Features

- Improve merging properties

# 2.4.0

## Features

- Improve performance

# 2.3.0

## Features

- Improve handling empty error messages

# 2.2.0

## Features

- Improves [`error.wrap`](README.md#error-class)

# 2.1.1

## Bug fixes

- Allow `ErrorClass.prototype.constructor` to mismatch `ErrorClass`, in order to
  support polyfills like
  [`error-cause-polyfill`](https://github.com/ehmicky/error-cause-polyfill)

# 2.1.0

## Features

- Improve how `error` classes are merged thanks to
  [`set-error-class`](https://github.com/ehmicky/set-error-class)
- Improve how `error` message are merged thanks to
  [`set-error-message`](https://github.com/ehmicky/set-error-message)
- Improve how `error` properties are merged thanks to
  [`set-error-props`](https://github.com/ehmicky/set-error-props)
- Improve how `error.stack` is merged
- Improve TypeScript types

# 2.0.0

## Breaking changes

- The argument is now directly modified, providing it is an `Error` instance.
  Otherwise, a new `error` is created then returned.
- The outer error type is now kept when it is `AggregateError`

## Features

- The inner error type can now be re-used by using `error.wrap = true`

# 1.3.0

## Features

- Reduce npm package size

# 1.2.0

## Features

- Improve error normalization
