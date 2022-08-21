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
