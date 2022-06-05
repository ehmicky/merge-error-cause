import test from 'ava'
import mergeErrorCause from 'merge-error-cause'
import { each } from 'test-each'

test('Error without cause is left as is', (t) => {
  const error = new Error('test')
  t.is(mergeErrorCause(error), error)
})

// eslint-disable-next-line unicorn/no-null
each([undefined, null, '', new Set([])], ({ title }, error) => {
  test(`Error is normalized | ${title}`, (t) => {
    t.true(mergeErrorCause(error) instanceof Error)
  })
})

test('Error cause is merged', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  t.is(mergeErrorCause(error).message, 'cause\ntest')
})

test('Error cause is merged deeply', (t) => {
  const cause = new Error('cause')
  // eslint-disable-next-line fp/no-mutation
  cause.cause = new Error('innerCause')
  const error = new Error('test')
  error.cause = cause
  t.is(mergeErrorCause(error).message, 'innerCause\ncause\ntest')
})

test('Messages are trimmed', (t) => {
  const error = new Error(' test ')
  error.cause = new Error(' cause ')
  t.is(mergeErrorCause(error).message, 'cause\ntest')
})

test('Empty parent messages are ignored', (t) => {
  // eslint-disable-next-line unicorn/error-message
  const error = new Error('')
  error.prop = true
  error.cause = new Error('cause')
  const { message, prop } = mergeErrorCause(error)
  t.is(message, 'cause')
  t.true(prop)
})

test('Empty child messages are ignored', (t) => {
  const error = new Error('test')
  // eslint-disable-next-line unicorn/error-message
  error.cause = new Error('')
  error.cause.prop = true
  const { message, prop } = mergeErrorCause(error)
  t.is(message, 'test')
  t.true(prop)
})
