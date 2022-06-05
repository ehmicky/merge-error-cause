import test from 'ava'
import mergeErrorCause from 'merge-error-cause'
import { each } from 'test-each'

import { hasAggregateErrors } from './helpers/main.js'

const { propertyIsEnumerable: isEnum } = Object.prototype

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
  t.is(
    getFirstStackLine(mergeErrorCause(error).stack),
    getFirstStackLine(stack),
  )
})

test('Child stack trace is used deeply', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  error.cause.cause = new Error('innerCause')
  const { stack } = error.cause.cause
  t.is(
    getFirstStackLine(mergeErrorCause(error).stack),
    getFirstStackLine(stack),
  )
})

each([undefined, '', 'invalid'], ({ title }, invalidStack) => {
  test(`Invalid child stack traces are not used | ${title}`, (t) => {
    const error = new Error('test')
    error.cause = new Error('cause')
    error.cause.stack = invalidStack
    const { stack } = error
    t.is(
      getFirstStackLine(mergeErrorCause(error).stack),
      getFirstStackLine(stack),
    )
  })
})

test('Invalid child stack traces are not used deeply', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  error.cause.cause = new Error('innerCause')
  error.cause.cause.stack = ''
  const { stack } = error.cause
  t.is(
    getFirstStackLine(mergeErrorCause(error).stack),
    getFirstStackLine(stack),
  )
})

test('Invalid child stack traces at the top are ignored', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  error.cause.cause = new Error('innerCause')
  error.stack = ''
  error.cause.stack = ''
  const { stack } = error.cause.cause
  t.is(
    getFirstStackLine(mergeErrorCause(error).stack),
    getFirstStackLine(stack),
  )
})

// eslint-disable-next-line unicorn/no-null
each([null, 'message'], ({ title }, cause) => {
  test(`Invalid errors stacks are not used | ${title}`, (t) => {
    const error = new Error('test')
    error.cause = cause
    const { stack } = error
    t.is(
      getFirstStackLine(mergeErrorCause(error).stack),
      getFirstStackLine(stack),
    )
  })
})

test('Plain object stack traces are used', (t) => {
  const error = new Error('test')
  const { stack } = new Error('cause')
  error.cause = { stack }
  t.is(
    getFirstStackLine(mergeErrorCause(error).stack),
    getFirstStackLine(stack),
  )
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
    const { stack } = error
    t.is(
      getFirstStackLine(mergeErrorCause(error).stack),
      getFirstStackLine(stack),
    )
  })
}

test('error.stack is not enumerable', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  t.false(isEnum.call(mergeErrorCause, 'stack'))
})
