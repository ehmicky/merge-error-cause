import test from 'ava'
import mergeErrorCause from 'merge-error-cause'

test('Parent class is kept', (t) => {
  const error = new TypeError('test')
  error.cause = new RangeError('cause')
  mergeErrorCause(error)
  t.is(error.name, 'TypeError')
})

test('Parent class is kept in stack', (t) => {
  const error = new TypeError('test')
  error.cause = new RangeError('cause')
  mergeErrorCause(error)
  t.true(error.stack.includes('TypeError'))
})

test("Aggregate errors' classes are kept", (t) => {
  const error = new TypeError('test')
  error.cause = new Error('cause')
  error.cause.errors = [new RangeError('innerError')]
  mergeErrorCause(error)
  t.is(error.name, 'TypeError')
  t.is(error.errors[0].name, 'RangeError')
})

// eslint-disable-next-line fp/no-class
class TestError extends Error {
  constructor(...args) {
    super(...args)
    // eslint-disable-next-line fp/no-this, fp/no-mutation
    this.name = 'TestError'
  }
}

test('Child class is used even if name not set on prototype', (t) => {
  const error = new Error('test')
  error.cause = new TestError('cause')
  mergeErrorCause(error)
  t.is(error.name, 'TestError')
})

test('Child constructor is used even if set as parent own property', (t) => {
  const error = new Error('test')
  error.constructor = Error
  error.cause = new TestError('cause')
  mergeErrorCause(error)
  t.is(error.constructor, TestError)
  t.is(error.name, 'TestError')
})

test('New class is updated in stack', (t) => {
  const error = new Error('test')
  error.cause = new RangeError('cause')
  error.cause.stack = ''
  mergeErrorCause(error)
  t.is(error.name, 'RangeError')
  t.true(error.stack.includes('RangeError: cause'))
})

test('Parent name is kept when mismatched but class did not change', (t) => {
  const error = new TypeError('test')
  error.name = 'RangeError'
  error.cause = new TypeError('cause')
  mergeErrorCause(error)
  t.is(error.name, 'RangeError')
})

test('Parent name is kept when mismatched and class changed', (t) => {
  const error = new Error('test')
  error.cause = new TypeError('cause')
  error.cause.name = 'RangeError'
  mergeErrorCause(error)
  t.is(error.name, 'RangeError')
})