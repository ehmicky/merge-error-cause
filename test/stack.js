import test from 'ava'
import mergeErrorCause from 'merge-error-cause'
import { each } from 'test-each'

import { hasAggregateErrors } from './helpers/main.js'

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
  isSameStack(t, mergeErrorCause(error).stack, stack)
})

test('Child stack trace is used deeply', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  error.cause.cause = new Error('innerCause')
  const { stack } = error.cause.cause
  isSameStack(t, mergeErrorCause(error).stack, stack)
})

each([undefined, '', 'invalid'], ({ title }, invalidStack) => {
  test(`Invalid child stack traces are not used | ${title}`, (t) => {
    const error = new Error('test')
    error.cause = new Error('cause')
    error.cause.stack = invalidStack
    const { stack } = error
    isSameStack(t, mergeErrorCause(error).stack, stack)
  })
})

test('Invalid child stack traces are not used deeply', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  error.cause.cause = new Error('innerCause')
  error.cause.cause.stack = ''
  const { stack } = error.cause
  isSameStack(t, mergeErrorCause(error).stack, stack)
})

test('Invalid child stack traces at the top are ignored', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  error.stack = ''
  error.cause.cause = new Error('innerCause')
  error.cause.stack = ''
  const { stack } = error.cause.cause
  isSameStack(t, mergeErrorCause(error).stack, stack)
})

// eslint-disable-next-line unicorn/no-null
each([null, 'message'], ({ title }, cause) => {
  test(`Invalid errors stacks are not used | ${title}`, (t) => {
    const error = new Error('test')
    error.cause = cause
    const { stack } = error
    isSameStack(t, mergeErrorCause(error).stack, stack)
  })
})

test('Plain object stack traces are used', (t) => {
  const error = new Error('test')
  const { stack } = new Error('cause')
  error.cause = { stack }
  isSameStack(t, mergeErrorCause(error).stack, stack)
})

test('New stack traces are created if none available', (t) => {
  const error = new Error('test')
  error.stack = ''
  t.true(mergeErrorCause(error).stack.includes('at '))
})

if (hasAggregateErrors()) {
  test('Aggregate errors get new stack traces', (t) => {
    const innerError = new Error('innerError')
    const error = new AggregateError([innerError], 'test')
    const { stack: innerStack } = innerError
    const { stack } = error
    const mergedError = mergeErrorCause(error)
    isSameStack(t, mergedError.stack, stack)
    isSameStack(t, mergedError.errors[0].stack, innerStack)
  })
}

test('error.stack is not enumerable', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  t.false(isEnum.call(mergeErrorCause, 'stack'))
})
