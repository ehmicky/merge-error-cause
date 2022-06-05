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
  const error = new Error('test')
  error.cause = new Error('cause')
  error.cause.cause = new Error('innerCause')
  t.is(mergeErrorCause(error).message, 'innerCause\ncause\ntest')
})
