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
- The outer error type is now kept
  [when it is `AggregateError`](README.md#error-type)

## Features

- The inner error type can now be re-used by using
  [`error.wrap = true`](README.md#error-type)

# 1.3.0

## Features

- Reduce npm package size

# 1.2.0

## Features

- Improve error normalization
