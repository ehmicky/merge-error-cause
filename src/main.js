import normalizeException from 'normalize-exception'
import setErrorClass from 'set-error-class'
import setErrorProps from 'set-error-props'

import { mergeAggregateCauses, mergeAggregateErrors } from './aggregate.js'
import { mergeMessage } from './message.js'
import { getStack, hasStack, mergeStack } from './stack.js'
import { getWrap } from './wrap.js'

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
  const { parent: errorB, childHasStack } = mergeCause(errorA, recurse)
  const errorHasStack = parentHasStack || childHasStack
  return { error: errorB, errorHasStack }
}

// `normalizeException()` is called again to ensure the new `name|message` is
// reflected in `error.stack`.
const mergeCause = function (parent, recurse) {
  const wrap = getWrap(parent)

  if (parent.cause === undefined) {
    return { parent, childHasStack: false }
  }

  const { error: child, errorHasStack: childHasStack } = recurse(parent.cause)
  // eslint-disable-next-line fp/no-delete, no-param-reassign
  delete parent.cause
  const parentA = mergeChild({ parent, child, childHasStack, wrap })
  return { parent: parentA, childHasStack }
}

const mergeChild = function ({ parent, child, childHasStack, wrap }) {
  if (child === undefined) {
    return parent
  }

  const [target, source] = wrap ? [child, parent] : [parent, child]
  const stackError = mergeStack({ wrap, target, source, childHasStack })
  const targetA = setErrorClass(target, target.constructor, stackError.name)
  const targetB = mergeMessage({ parent, child, target: targetA, stackError })
  mergeAggregateErrors({ target: targetB, source, parent, child })
  const targetC = setErrorProps(targetB, source, { soft: !wrap })
  return targetC
}
