import normalizeException from 'normalize-exception'
import setErrorProps from 'set-error-props'

import { mergeAggregateCauses, mergeAggregateErrors } from './aggregate.js'
import { mergeClass } from './class.js'
import { mergeMessage } from './message.js'
import { getStack, hasStack, fixStack } from './stack.js'

// Merge `error.cause` recursively to a single error.
// In Node <16.9.0 and in some browsers, `error.cause` requires a polyfill like
// `error-cause-ponyfill`.
export default function mergeErrorCause(error) {
  return mergeError(error, []).error
}

// The recursion is applied pair by pair, as opposed to all errors at once.
//  - This ensures the same result no matter how many times this function
//    applied along the stack trace
// It is applied in `error.cause`, but not in `error.errors` which have their
// own stack.
const mergeError = function (error, parents) {
  if (parents.includes(error)) {
    return {}
  }

  const recurse = (innerError) => mergeError(innerError, [...parents, error])
  const stack = getStack(error)
  const errorA = normalizeException(error, { shallow: true })
  const parentHasStack = hasStack(errorA, stack)

  mergeAggregateCauses(errorA, recurse)
  const childHasStack = mergeCause(errorA, recurse)
  const errorHasStack = parentHasStack || childHasStack
  return { error: errorA, errorHasStack }
}

// `normalizeException()` is called again to ensure the new `name|message` is
// reflected in `error.stack`.
const mergeCause = function (parent, recurse) {
  if (parent.cause === undefined) {
    return false
  }

  const { error: child, errorHasStack: childHasStack } = recurse(parent.cause)
  // eslint-disable-next-line fp/no-delete, no-param-reassign
  delete parent.cause
  mergeChild(parent, child, childHasStack)
  return childHasStack
}

const mergeChild = function (parent, child, childHasStack) {
  if (child === undefined) {
    return
  }

  mergeMessage(parent, child)
  fixStack(parent, child, childHasStack)
  mergeAggregateErrors(parent, child)
  setErrorProps(parent, child, { lowPriority: true })
  mergeClass(parent, child)
}
