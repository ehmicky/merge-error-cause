import { setErrorProperty } from './set.js'

// Keep `error.errors` when merging errors.
// If multiple errors have `errors`, the parent's errors are prepended.
// `error.errors[*].cause` are recursed.
// We do not merge `error.errors` into a single error:
// - Because:
//    - Unlike `error.cause`, those are separate errors, which should remain so
//    - Each error's message and stack trace should be kept as is, otherwise:
//       - Those could be very long if `error.errors` is large
//       - Those could lead to confusing stack traces
// - I.e. it is the responsibility of the consumers to recurse and handle
//   `error.errors`
export const mergeAggregate = function ({
  mergedError,
  parentErrors,
  child,
  mergeErrorCause,
}) {
  const childErrors = getAggregateErrors(child, mergeErrorCause)

  if (parentErrors === undefined && childErrors === undefined) {
    return
  }

  const errors = getMergedErrors(parentErrors, childErrors)
  setErrorProperty(mergedError, 'errors', errors)
}

export const getAggregateErrors = function (error, mergeErrorCause) {
  return Array.isArray(error.errors)
    ? error.errors.map(mergeErrorCause)
    : undefined
}

const getMergedErrors = function (parentErrors, childErrors) {
  if (parentErrors === undefined) {
    return childErrors
  }

  if (childErrors === undefined) {
    return parentErrors
  }

  return [...childErrors, ...parentErrors]
}

// Set `error.errors` when there are no `error.cause.errors`
export const setAggregate = function (parent, parentErrors) {
  if (parentErrors !== undefined) {
    setErrorProperty(parent, 'errors', parentErrors)
  }
}
