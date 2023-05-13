import test from 'ava'
import mergeErrorCause from 'merge-error-cause'
import { each } from 'test-each'

const { propertyIsEnumerable: isEnum } = Object.prototype

const isSameStack = (t, stackA, stackB) => {
  t.is(getFirstStackLine(stackA), getFirstStackLine(stackB))
}

const getFirstStackLine = (stack) => {
  const lines = stack.split('\n')
  const index = lines.findIndex(isStackLine)
  return lines[index]
}

const isStackLine = (line) => line.trim().startsWith('at ')

const getVeryDeepError = (ErrorClass) => {
  const error = getDeepError(ErrorClass)
  error.cause.cause = new TypeError('innerCause')
  return error
}

const getDeepError = (ErrorClass) => {
  const error = new ErrorClass('test')
  error.cause = new TypeError('outerCause')
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

each([TypeError, Error], [undefined, {}], ({ title }, ErrorClass, cause) => {
  test(`Missing child stack traces are not used | ${title}`, (t) => {
    const error = new ErrorClass('test')
    error.cause = cause
    isSameStack(t, error.stack, mergeErrorCause(error).stack)
  })
})

each(
  [Error, TypeError],
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
