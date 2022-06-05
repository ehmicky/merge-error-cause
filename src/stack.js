import { setErrorProperty } from './set.js'

// This needs to be performed before `child` is normalized by either
// `mergeErrorCause(parent.cause)` or `normalizeException(parent)`
export const getStackIndex = function (error) {
  const stackIndex = findStackIndex(error, 0)
  return stackIndex === undefined ? 0 : stackIndex
}

const findStackIndex = function (error, index) {
  if (!isObject(error)) {
    return
  }

  const childIndex = findStackIndex(error.cause, index + 1)

  if (childIndex !== undefined) {
    return childIndex
  }

  return hasValidStack(error) ? index : undefined
}

// Errors can be plain objects with a `stack` property, which is handled by
// `normalize-exception`
const isObject = function (value) {
  return typeof value === 'object' && value !== null
}

const hasValidStack = function ({ stack }) {
  return typeof stack === 'string' && stack.includes(STACK_LINE_START)
}

const STACK_LINE_START = 'at '

// Only show the child error's stack trace since the parent one contains mostly
// the same lines.
// Do not do it if the child error is missing a proper stack trace.
//  - Unless it has a `cause` which has one
// Merging stacks might lose some stack trace if:
//  - `Error.stackTraceLimit` is too low, in which case it should be increased
//  - Using callbacks, in which case `async`/`await` should be used
export const fixStack = function ({ mergedError, parent, child, stackIndex }) {
  const { stack } = stackIndex > 0 ? child : parent
  setErrorProperty(mergedError, 'stack', stack)
}
