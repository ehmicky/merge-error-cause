import normalizeException from 'normalize-exception'

import {
  setAggregate,
  getAggregateErrors,
  mergeAggregate,
} from './aggregate.js'
import { createError } from './create.js'
import { mergeMessage } from './message.js'
import { copyProps } from './props.js'
import { getStackIndex, fixStack } from './stack.js'

// Merge `error.cause` recursively to a single error.
// This allows consumers to conveniently wrap errors using:
//   try {
//     ...
//   } catch (error) {
//     throw new ErrorType('message', { cause: error })
//   }
// While still working around the following issues with `error.cause`:
//  - The consumer needs to traverse `error.cause`
//     - to retrieve both error class and properties
//     - traversing is especially tricky since:
//        - exceptions might not be error instances
//        - the recursion might be infinite
//  - The stack trace shows the innermost error message last, even though it is
//    the most relevant one
//  - The stack trace of each error is most likely a duplicate of the others
//     - This is because, in most cases, `try/catch` blocks follow the stack
//       trace
//     - This might not be the case if:
//        - `Error.stackTraceLimit` is too low, in which case it should be
//          increased
//        - Using callbacks, in which case `async`/`await` should be used
//  - When printed, each error cause is indented and prints its own stack trace,
///   which is very verbose and hard to read
// In Node <16.9.0 and in some browsers, `error.cause` requires a polyfill like
// `error-cause`.
// The recursion is applied pair by pair, as opposed to all errors at once.
//  - This ensures the same result no matter how many times this function
//    applied along the stack trace
// `normalizeError()` is called again to ensure the new `name|message` is
// reflected in `error.stack`.
export default function mergeErrorCause(error) {
  const stackIndex = getStackIndex(error)
  return mergeError(error, stackIndex)
}

const mergeError = function (error, stackIndex) {
  const parent = normalizeException(error)
  const parentErrors = getAggregateErrors(parent, mergeErrorCause)

  if (parent.cause === undefined) {
    setAggregate(parent, parentErrors)
    return parent
  }

  return mergeCause(parent, parentErrors, stackIndex)
}

const mergeCause = function (parent, parentErrors, stackIndex) {
  const child = mergeError(parent.cause, stackIndex - 1)
  const message = mergeMessage(parent.message, child.message)
  const mergedError = createError(parent, child, message)
  fixStack({ mergedError, parent, child, stackIndex })
  mergeAggregate({ mergedError, parentErrors, child, mergeErrorCause })
  copyProps(mergedError, parent, child)
  return normalizeException(mergedError)
}
