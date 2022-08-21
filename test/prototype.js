import test from 'ava'
import mergeErrorCause from 'merge-error-cause'

test('Parent name is kept', (t) => {
  const error = new TypeError('test')
  error.cause = new RangeError('cause')
  mergeErrorCause(error)
  t.is(error.name, 'TypeError')
})

test('Parent name is kept in stack', (t) => {
  const error = new TypeError('test')
  error.cause = new RangeError('cause')
  mergeErrorCause(error)
  t.true(error.stack.includes('TypeError'))
})

test("Aggregate errors' names are kept", (t) => {
  const error = new TypeError('test')
  error.cause = new Error('cause')
  error.cause.errors = [new RangeError('innerError')]
  mergeErrorCause(error)
  t.is(error.name, 'TypeError')
  t.is(error.errors[0].name, 'RangeError')
})

test('Child name is used if parent is Error', (t) => {
  const error = new Error('test')
  error.cause = new RangeError('cause')
  mergeErrorCause(error)
  t.is(error.name, 'RangeError')
})

test('Child name is used if parent.wrap true', (t) => {
  const error = new TypeError('test')
  error.cause = new RangeError('cause')
  error.wrap = true
  mergeErrorCause(error)
  t.is(error.name, 'RangeError')
})

test('Child name is not used if parent.wrap false', (t) => {
  const error = new TypeError('test')
  error.cause = new RangeError('cause')
  error.wrap = false
  mergeErrorCause(error)
  t.is(error.name, 'TypeError')
})

// eslint-disable-next-line fp/no-class
class TestError extends Error {
  constructor(...args) {
    super(...args)
    // eslint-disable-next-line fp/no-this, fp/no-mutation
    this.name = 'TestError'
  }
}

test('Child name is used even if not set on prototype', (t) => {
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

test('New name is updated in stack', (t) => {
  const error = new Error('test')
  error.cause = new RangeError('cause')
  error.cause.stack = ''
  mergeErrorCause(error)
  t.is(error.name, 'RangeError')
  t.true(error.stack.includes('RangeError: cause'))
})
