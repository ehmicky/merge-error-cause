import test from 'ava'
import mergeErrorCause from 'merge-error-cause'
import { each } from 'test-each'

test('Child is mutated and returned if parent is Error', (t) => {
  const error = new Error('test')
  error.cause = new RangeError('cause')
  const cause = mergeErrorCause(error)
  t.not(cause, error)
  t.is(cause.message, 'cause\ntest')
  t.is(error.message, 'test')
})

test('Child is mutated and returned if parent.wrap true', (t) => {
  const error = new TypeError('test')
  error.cause = new RangeError('cause')
  error.wrap = true
  t.not(mergeErrorCause(error), error)
})

each([false, undefined, 'true'], ({ title }, wrap) => {
  test(`Parent is mutated and returned if parent.wrap not true | ${title}`, (t) => {
    const error = new TypeError('test')
    const cause = new RangeError('cause')
    error.cause = cause
    error.wrap = wrap
    const sameError = mergeErrorCause(error)
    t.is(sameError, error)
    t.is(sameError.message, 'cause\ntest')
    t.is(cause.message, 'cause')
    t.not(error.wrap, false)
  })
})

test('parent.wrap has priority over Error name', (t) => {
  const error = new Error('test')
  error.cause = new RangeError('cause')
  error.wrap = false
  t.is(mergeErrorCause(error), error)
})

// eslint-disable-next-line fp/no-class
class WrapError extends Error {}
// eslint-disable-next-line fp/no-mutating-assign
Object.assign(WrapError.prototype, { name: 'WrapError', wrap: true })

test('parent.wrap can be set on the error prototype', (t) => {
  const error = new WrapError('test')
  error.cause = new RangeError('cause')
  t.not(mergeErrorCause(error), error)
  t.true('wrap' in error)
  t.true(WrapError.prototype.wrap)
})

test('parent.wrap is removed even without a cause', (t) => {
  const error = new TypeError('test')
  error.wrap = false
  mergeErrorCause(error)
  t.false('wrap' in error)
})
