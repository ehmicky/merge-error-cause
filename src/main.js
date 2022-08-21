import normalizeException from 'normalize-exception'

import { mergeAggregateCauses, mergeAggregateErrors } from './aggregate.js'
import { mergeMessage } from './message.js'
import { copyProps } from './props.js'
import { mergePrototype } from './prototype.js'
import { getStack, hasGeneratedStack, fixStack } from './stack.js'

// Merge `error.cause` recursively to a single error.
// In Node <16.9.0 and in some browsers, `error.cause` requires a polyfill like
// `error-cause-ponyfill`.
export default function mergeErrorCause(error) {
  const { error: errorA } = mergeError(error)
  return errorA
}

// The recursion is applied pair by pair, as opposed to all errors at once.
//  - This ensures the same result no matter how many times this function
//    applied along the stack trace
// It is applied in `error.cause`, but not in `error.errors` which have their
// own stack.
const mergeError = function (error) {
  const stack = getStack(error)
  const errorA = normalizeException(error, { shallow: true })
  const generatedStack = hasGeneratedStack(errorA, stack)
  mergeAggregateCauses(errorA, mergeError)
  const errorB = mergeCause(errorA)
  return { error: errorB, generatedStack }
}

// `normalizeException()` is called again to ensure the new `name|message` is
// reflected in `error.stack`.
const mergeCause = function (parent) {
  if (parent.cause === undefined) {
    return parent
  }

  const { error: child, generatedStack } = mergeError(parent.cause)
  // eslint-disable-next-line fp/no-delete, no-param-reassign
  delete parent.cause
  mergeChild(parent, child, generatedStack)
  return normalizeException(parent)
}

const mergeChild = function (parent, child, generatedStack) {
  mergeMessage(parent, child)
  fixStack(parent, child, generatedStack)
  mergeAggregateErrors(parent, child)
  copyProps(parent, child)
  mergePrototype(parent, child)
}
