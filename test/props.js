import test from 'ava'
import mergeErrorCause from 'merge-error-cause'

test('Child error properties are merged', (t) => {
  const error = new TypeError('test')
  error.cause = new TypeError('cause')
  error.cause.prop = true
  mergeErrorCause(error)
  t.true(error.prop)
})

test('Parent error properties are merged', (t) => {
  const error = new TypeError('test')
  error.cause = new TypeError('cause')
  error.prop = true
  mergeErrorCause(error)
  t.true(error.prop)
})

test('Parent error properties are merged with priority', (t) => {
  const error = new TypeError('test')
  error.cause = new TypeError('cause')
  error.prop = true
  error.cause.prop = false
  mergeErrorCause(error)
  t.true(error.prop)
})

test('Symbol error properties are merged', (t) => {
  const error = new TypeError('test')
  error.cause = new TypeError('cause')
  const symbol = Symbol('prop')
  error.cause[symbol] = true
  mergeErrorCause(error)
  t.true(error[symbol])
})
