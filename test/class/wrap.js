import test from 'ava'
import mergeErrorCause from 'merge-error-cause'

test('Child class is used if parent is Error', (t) => {
  const error = new Error('test')
  error.cause = new RangeError('cause')
  mergeErrorCause(error)
  t.is(error.name, 'RangeError')
})

test('Child class is used if parent.wrap true', (t) => {
  const error = new TypeError('test')
  error.cause = new RangeError('cause')
  error.wrap = true
  mergeErrorCause(error)
  t.is(error.name, 'RangeError')
  t.false('wrap' in error)
})

test('Child class is not used if parent.wrap false', (t) => {
  const error = new TypeError('test')
  error.cause = new RangeError('cause')
  error.wrap = false
  mergeErrorCause(error)
  t.is(error.name, 'TypeError')
  t.false('wrap' in error)
})

test('Child class is not used if parent.wrap not boolean', (t) => {
  const error = new TypeError('test')
  error.cause = new RangeError('cause')
  error.wrap = 'true'
  mergeErrorCause(error)
  t.is(error.name, 'TypeError')
  t.is(error.wrap, 'true')
})

test('parent.wrap has priority over Error name', (t) => {
  const error = new Error('test')
  error.cause = new RangeError('cause')
  error.wrap = false
  mergeErrorCause(error)
  t.is(error.name, 'Error')
  t.false('wrap' in error)
})

// eslint-disable-next-line fp/no-class
class WrapError extends Error {}
// eslint-disable-next-line fp/no-mutating-assign
Object.assign(WrapError.prototype, { name: 'WrapError', wrap: true })

test('parent.wrap can be set on the error prototype', (t) => {
  const error = new WrapError('test')
  error.cause = new RangeError('cause')
  mergeErrorCause(error)
  t.is(error.name, 'RangeError')
  t.false('wrap' in error)
  t.true(WrapError.prototype.wrap)
})

test('parent.wrap is removed even without a cause', (t) => {
  const error = new Error('test')
  error.wrap = false
  mergeErrorCause(error)
  t.false('wrap' in error)
})
