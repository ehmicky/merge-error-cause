import normalizeException from 'normalize-exception'

import {
  setAggregate,
  getAggregateErrors,
  mergeAggregate,
} from './aggregate.js'
import { mergeMessage } from './message.js'
import { copyProps } from './props.js'
import { getStackIndex, fixStack } from './stack.js'

// Merge `error.cause` recursively to a single error.
// In Node <16.9.0 and in some browsers, `error.cause` requires a polyfill like
// `error-cause-ponyfill`.
export default function mergeErrorCause(error) {
  const stackIndex = getStackIndex(error)
  return mergeError(error, stackIndex)
}

// The recursion is applied pair by pair, as opposed to all errors at once.
//  - This ensures the same result no matter how many times this function
//    applied along the stack trace
// It is applied in `error.cause`, but not in `error.errors` which have their
// own stack.
const mergeError = function (error, stackIndex) {
  const parent = normalizeException(error)
  const parentErrors = getAggregateErrors(parent, mergeErrorCause)

  if (parent.cause === undefined) {
    setAggregate(parent, parentErrors)
    return parent
  }

  return mergeCause(parent, parentErrors, stackIndex)
}

// `normalizeException()` is called again to ensure the new `name|message` is
// reflected in `error.stack`.
const mergeCause = function (parent, parentErrors, stackIndex) {
  const child = mergeError(parent.cause, stackIndex - 1)
  const message = mergeMessage(parent.message, child.message)
  const mergedError = createError(parent, message)
  fixStack({ mergedError, parent, child, stackIndex })
  mergeAggregate({ mergedError, parentErrors, child, mergeErrorCause })
  copyProps(mergedError, parent, child)
  return normalizeException(mergedError)
}

// Ensure both the prototype and `error.name` are correct, by creating a new
// instance with the right constructor.
// The parent error's type is kept.
//  - Unless its constructor throws, then we default to Error.
const createError = function (parent, message) {
  try {
    return parent.constructor.name === 'AggregateError' &&
      'AggregateError' in globalThis
      ? new parent.constructor([], message)
      : new parent.constructor(message)
  } catch {
    return new Error(message)
  }
}
