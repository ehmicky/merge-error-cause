import test from 'ava'
import mergeErrorCause from 'merge-error-cause'

test('Child error properties are merged', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  error.cause.prop = true
  mergeErrorCause(error)
  t.true(error.prop)
})

test('Parent error properties are merged', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  error.prop = true
  mergeErrorCause(error)
  t.true(error.prop)
})

test('Parent error properties are merged with priority', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  error.prop = true
  error.cause.prop = false
  mergeErrorCause(error)
  t.true(error.prop)
})

test('Symbol error properties are merged', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  const symbol = Symbol('prop')
  error.cause[symbol] = true
  mergeErrorCause(error)
  t.true(error[symbol])
})

test('Inherited error properties are not merged', (t) => {
  const TestError = class extends Error {
    // eslint-disable-next-line class-methods-use-this
    testFunc() {}
  }
  const error = new TypeError('test')
  error.cause = new TestError('cause')
  mergeErrorCause(error)
  t.false('testFunc' in error)
})
