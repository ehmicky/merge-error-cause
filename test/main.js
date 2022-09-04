import test from 'ava'
import mergeErrorCause from 'merge-error-cause'
import { each } from 'test-each'

test('Error without cause is left as is', (t) => {
  const error = new TypeError('test')
  mergeErrorCause(error)
  t.false('cause' in error)
})

test('Argument is returned', (t) => {
  const error = new TypeError('test')
  error.cause = new TypeError('cause')
  t.is(mergeErrorCause(error), error)
})

// eslint-disable-next-line unicorn/no-null
each([undefined, null, '', new Set([])], ({ title }, error) => {
  test(`Error is normalized | ${title}`, (t) => {
    t.true(mergeErrorCause(error) instanceof Error)
  })
})

test('Error cause is merged', (t) => {
  const error = new TypeError('test')
  error.cause = new TypeError('cause')
  mergeErrorCause(error)
  t.is(error.message, 'cause\ntest')
  t.false('cause' in error)
})

test('Error cause is merged deeply', (t) => {
  const error = new TypeError('test')
  error.cause = new TypeError('cause')
  error.cause.cause = new TypeError('innerCause')
  mergeErrorCause(error)
  t.is(error.message, 'innerCause\ncause\ntest')
})

test('Handle cause cycles', (t) => {
  const error = new TypeError('test')
  error.cause = error
  mergeErrorCause(error)
  t.false('cause' in error)
  t.is(error.message, 'test')
})

test('Handle aggregate errors cycles', (t) => {
  const error = new TypeError('test')
  error.errors = [error]
  mergeErrorCause(error)
  t.is(error.errors.length, 0)
  t.is(error.message, 'test')
})

test('Handle cause and aggregate errors cycles', (t) => {
  const error = new TypeError('test')
  error.cause = new TypeError('cause')
  error.cause.errors = [new TypeError('innerCause'), error]
  error.cause.errors[0].cause = error
  mergeErrorCause(error)
  t.is(error.message, 'cause\ntest')
  t.is(error.errors.length, 1)
  t.is(error.errors[0].message, 'innerCause')
})
