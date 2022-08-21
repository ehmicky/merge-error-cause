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

const getVeryDeepError = function () {
  const error = getDeepError()
  error.cause.cause = new Error('innerCause')
  return error
}

const getDeepError = function () {
  const error = new Error('test')
  error.cause = new Error('cause')
  return error
}

test('Child stack trace is used', (t) => {
  const error = getDeepError()
  const { stack } = error.cause
  mergeErrorCause(error)
  isSameStack(t, error.stack, stack)
})

test('Child stack trace is used deeply', (t) => {
  const error = getVeryDeepError()
  const { stack } = error.cause.cause
  mergeErrorCause(error)
  isSameStack(t, error.stack, stack)
})

test("Plain objects' stack traces are used", (t) => {
  const error = getDeepError()
  const { stack } = error.cause
  error.cause = { stack }
  mergeErrorCause(error)
  isSameStack(t, error.stack, stack)
})

test('Aggregate errors have separate stack traces', (t) => {
  const error = new Error('test')
  error.errors = [new Error('innerError')]
  const {
    stack,
    errors: [{ stack: innerStack }],
  } = error
  mergeErrorCause(error)
  const {
    stack: newStack,
    errors: [{ stack: newInnerStack }],
  } = error
  isSameStack(t, newStack, stack)
  isSameStack(t, newInnerStack, innerStack)
})

test('error.stack is not enumerable', (t) => {
  const error = getDeepError()
  mergeErrorCause(error)
  t.false(isEnum.call(error, 'stack'))
})

// eslint-disable-next-line unicorn/no-null
each([undefined, null, {}], ({ title }, cause) => {
  test(`Missing child stack traces are not used | ${title}`, (t) => {
    const error = new Error('test')
    error.cause = cause
    const { stack } = error
    mergeErrorCause(error)
    const { stack: newStack } = error
    isSameStack(t, newStack, stack)
  })
})

/* eslint-disable unicorn/consistent-destructuring */
// eslint-disable-next-line unicorn/no-null
each([undefined, null, true, ''], ({ title }, invalidStack) => {
  test(`Invalid child stack traces are not used | ${title}`, (t) => {
    const error = getDeepError()
    error.cause.stack = invalidStack
    const { stack } = error
    mergeErrorCause(error)
    isSameStack(t, error.stack, stack)
  })

  test(`Invalid child stack traces at the bottom and center are ignored | ${title}`, (t) => {
    const error = getVeryDeepError()
    error.cause.stack = invalidStack
    error.cause.cause.stack = invalidStack
    const { stack } = error
    mergeErrorCause(error)
    isSameStack(t, error.stack, stack)
  })

  test(`Invalid child stack traces at the bottom are ignored | ${title}`, (t) => {
    const error = getVeryDeepError()
    error.cause.cause.stack = invalidStack
    const { stack } = error.cause
    mergeErrorCause(error)
    isSameStack(t, error.stack, stack)
  })

  test(`Invalid child stack traces at the center are ignored | ${title}`, (t) => {
    const error = getVeryDeepError()
    error.cause.stack = invalidStack
    const { stack } = error.cause.cause
    mergeErrorCause(error)
    isSameStack(t, error.stack, stack)
  })

  test(`Invalid child stack traces at the top are ignored | ${title}`, (t) => {
    const error = getVeryDeepError()
    error.stack = invalidStack
    const { stack } = error.cause.cause
    mergeErrorCause(error)
    isSameStack(t, error.stack, stack)
  })

  test(`New stack traces are created if none available | ${title}`, (t) => {
    const error = new Error('test')
    error.stack = invalidStack
    mergeErrorCause(error)
    t.not(error.stack, invalidStack)
  })
})
/* eslint-enable unicorn/consistent-destructuring */
/* eslint-enable max-lines */
