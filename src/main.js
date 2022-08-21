import normalizeException from 'normalize-exception'

import { mergeAggregateCauses, mergeAggregateErrors } from './aggregate.js'
import { mergeMessage } from './message.js'
import { copyProps } from './props.js'
import { mergePrototype } from './prototype.js'
import { listStacks, getGenerated, fixStack } from './stack.js'

// Merge `error.cause` recursively to a single error.
// In Node <16.9.0 and in some browsers, `error.cause` requires a polyfill like
// `error-cause-ponyfill`.
export default function mergeErrorCause(error) {
  const oldStacks = listStacks(error)
  const errorA = normalizeException(error)
  const newStacks = listStacks(errorA)
  const generated = getGenerated(oldStacks, newStacks)
  return mergeError(errorA, generated, 0)
}

// The recursion is applied pair by pair, as opposed to all errors at once.
//  - This ensures the same result no matter how many times this function
//    applied along the stack trace
// It is applied in `error.cause`, but not in `error.errors` which have their
// own stack.
const mergeError = function (parent, generated, stackIndex) {
  mergeAggregateCauses(parent, mergeErrorCause)
  return mergeCause(parent, generated, stackIndex)
}

// `normalizeException()` is called again to ensure the new `name|message` is
// reflected in `error.stack`.
const mergeCause = function (parent, generated, stackIndex) {
  if (parent.cause === undefined) {
    return parent
  }

  const child = mergeError(parent.cause, generated, stackIndex + 1)
  // eslint-disable-next-line fp/no-delete, no-param-reassign
  delete parent.cause
  mergeChild({ parent, child, generated, stackIndex })
  return normalizeException(parent)
}

const mergeChild = function ({ parent, child, generated, stackIndex }) {
  mergeMessage(parent, child)
  fixStack({ parent, child, generated, stackIndex })
  mergeAggregateErrors(parent, child)
  copyProps(parent, child)
  mergePrototype(parent, child)
}
