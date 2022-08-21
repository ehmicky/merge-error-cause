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
export const mergeAggregateCauses = function (parent, recurse) {
  if (parent.errors === undefined) {
    return
  }

  const errors = parent.errors
    .map((error) => recurse(error).error)
    .filter(Boolean)
  setErrorProperty(parent, 'errors', errors)
}

export const mergeAggregateErrors = function (parent, child) {
  if (child.errors === undefined) {
    return
  }

  const errors =
    parent.errors === undefined
      ? child.errors
      : [...child.errors, ...parent.errors]
  setErrorProperty(parent, 'errors', errors)
}
