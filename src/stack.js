import { setErrorProperty } from './set.js'

// This needs to be performed before `child` is normalized by either
// `mergeErrorCause(parent.cause)` or `normalizeException(parent)`
export const childHasStack = function (parent) {
  return isObject(parent) && hasStack(parent.cause)
}

const hasStack = function (child) {
  return isObject(child) && (isStackProp(child.stack) || hasStack(child.cause))
}

const isObject = function (value) {
  return typeof value === 'object' && value !== null
}

const isStackProp = function (stack) {
  return typeof stack === 'string' && stack.includes(STACK_LINE_START)
}

const STACK_LINE_START = 'at '

// Only show the child error's stack trace since the parent one contains mostly
// the same lines.
// Do not do it if the child error is missing a proper stack trace.
//  - Unless it has a `cause` which has one
export const fixStack = function ({
  mergedError,
  parent,
  child,
  hasChildStack,
}) {
  const { stack } = hasChildStack ? child : parent
  setErrorProperty(mergedError, 'stack', stack)
}
