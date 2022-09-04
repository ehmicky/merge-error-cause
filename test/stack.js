/* eslint-disable max-lines */
import test from 'ava'
import mergeErrorCause from 'merge-error-cause'
import { each } from 'test-each'

const { propertyIsEnumerable: isEnum } = Object.prototype

const isSameStack = function (t, stackA, stackB) {
  t.is(getFirstStackLine(stackA), getFirstStackLine(stackB))
}

const getFirstStackLine = function (stack) {
  const lines = stack.split('\n')
  const index = lines.findIndex(isStackLine)
  return lines[index]
}

const isStackLine = function (line) {
  return line.trim().startsWith('at ')
}

const getVeryDeepError = function (ErrorClass) {
  const error = getDeepError(ErrorClass)
  error.cause.cause = new TypeError('innerCause')
  return error
}

const getDeepError = function (ErrorClass) {
  const error = new ErrorClass('test')
  error.cause = new TypeError('cause')
  return error
}

each([TypeError, Error], ({ title }, ErrorClass) => {
  test(`Child stack trace is used | ${title}`, (t) => {
    const error = getDeepError(ErrorClass)
    const { stack } = error.cause
    isSameStack(t, mergeErrorCause(error).stack, stack)
  })

  test(`Child stack trace is used deeply | ${title}`, (t) => {
    const error = getVeryDeepError(ErrorClass)
    const { stack } = error.cause.cause
    isSameStack(t, mergeErrorCause(error).stack, stack)
  })

  test(`Plain objects' stack traces are used | ${title}`, (t) => {
    const error = getDeepError(ErrorClass)
    const { stack } = error.cause
    error.cause = { stack }
    isSameStack(t, mergeErrorCause(error).stack, stack)
  })

  test(`Aggregate errors have separate stack traces | ${title}`, (t) => {
    const error = new ErrorClass('test')
    error.errors = [new TypeError('innerError')]
    const {
      stack,
      errors: [{ stack: innerStack }],
    } = error
    const {
      stack: newStack,
      errors: [{ stack: newInnerStack }],
    } = mergeErrorCause(error)
    isSameStack(t, newStack, stack)
    isSameStack(t, newInnerStack, innerStack)
  })

  test(`error.stack is not enumerable | ${title}`, (t) => {
    const error = getDeepError(ErrorClass)
    t.false(isEnum.call(mergeErrorCause(error), 'stack'))
  })
})

each(
  [TypeError, Error],
  // eslint-disable-next-line unicorn/no-null
  [undefined, null, {}],
  ({ title }, ErrorClass, cause) => {
    test(`Missing child stack traces are not used | ${title}`, (t) => {
      const error = new ErrorClass('test')
      error.cause = cause
      const { stack } = error
      mergeErrorCause(error)
      const { stack: newStack } = error
      isSameStack(t, newStack, stack)
    })
  },
)

each(
  [Error, TypeError],
  // eslint-disable-next-line unicorn/no-null
  [undefined, null, true, ''],
  ({ title }, ErrorClass, invalidStack) => {
    test(`Invalid child stack traces are not used | ${title}`, (t) => {
      const error = getDeepError(ErrorClass)
      error.cause.stack = invalidStack
      const { stack } = error
      isSameStack(t, mergeErrorCause(error).stack, stack)
    })

    test(`Invalid child stack traces at the bottom and center are ignored | ${title}`, (t) => {
      const error = getVeryDeepError(ErrorClass)
      error.cause.stack = invalidStack
      error.cause.cause.stack = invalidStack
      const { stack } = error
      isSameStack(t, mergeErrorCause(error).stack, stack)
    })

    test(`Invalid child stack traces at the bottom are ignored | ${title}`, (t) => {
      const error = getVeryDeepError(ErrorClass)
      error.cause.cause.stack = invalidStack
      const { stack } = error.cause
      isSameStack(t, mergeErrorCause(error).stack, stack)
    })

    test(`Invalid child stack traces at the center are ignored | ${title}`, (t) => {
      const error = getVeryDeepError(ErrorClass)
      error.cause.stack = invalidStack
      const { stack } = error.cause.cause
      isSameStack(t, mergeErrorCause(error).stack, stack)
    })

    test(`Invalid child stack traces at the top are ignored | ${title}`, (t) => {
      const error = getVeryDeepError(ErrorClass)
      error.stack = invalidStack
      const { stack } = error.cause.cause
      isSameStack(t, mergeErrorCause(error).stack, stack)
    })

    test(`New stack traces are created if none available | ${title}`, (t) => {
      const error = new ErrorClass('test')
      error.stack = invalidStack
      t.not(mergeErrorCause(error).stack, invalidStack)
    })
  },
)
/* eslint-enable max-lines */
