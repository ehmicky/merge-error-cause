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

test('Child stack trace is used', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  const { stack } = error.cause
  mergeErrorCause(error)
  isSameStack(t, error.stack, stack)
})

test('Child stack trace is used deeply', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  error.cause.cause = new Error('innerCause')
  const { stack } = error.cause.cause
  mergeErrorCause(error)
  isSameStack(t, error.stack, stack)
})

each([undefined, '', 'invalid'], ({ title }, invalidStack) => {
  test(`Invalid child stack traces are not used | ${title}`, (t) => {
    const error = new Error('test')
    error.cause = new Error('cause')
    error.cause.stack = invalidStack
    const { stack } = error
    mergeErrorCause(error)
    const { stack: newStack } = error
    isSameStack(t, newStack, stack)
  })
})

test('Invalid child stack traces are not used deeply', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  error.cause.cause = new Error('innerCause')
  error.cause.cause.stack = ''
  const { stack } = error.cause
  mergeErrorCause(error)
  isSameStack(t, error.stack, stack)
})

test('Invalid child stack traces at the top are ignored', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  error.stack = ''
  error.cause.cause = new Error('innerCause')
  error.cause.stack = ''
  const { stack } = error.cause.cause
  mergeErrorCause(error)
  isSameStack(t, error.stack, stack)
})

// eslint-disable-next-line unicorn/no-null
each([null, ''], ({ title }, causeStack) => {
  test(`Invalid errors' stacks are not used | ${title}`, (t) => {
    const error = new Error('test')
    error.cause = { stack: causeStack }
    const { stack } = error
    mergeErrorCause(error)
    const { stack: newStack } = error
    isSameStack(t, newStack, stack)
  })
})

test("Plain objects' stack traces are used", (t) => {
  const error = new Error('test')
  const { stack } = new Error('cause')
  error.cause = { stack }
  mergeErrorCause(error)
  isSameStack(t, error.stack, stack)
})

test('New stack traces are created if none available', (t) => {
  const error = new Error('test')
  error.stack = ''
  mergeErrorCause(error)
  t.true(error.stack.includes('at '))
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
  const error = new Error('test')
  error.cause = new Error('cause')
  mergeErrorCause(error)
  t.false(isEnum.call(error, 'stack'))
})
/* eslint-enable max-lines */
