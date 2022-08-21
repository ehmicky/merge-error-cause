import test from 'ava'
import errorType from 'error-type'
import mergeErrorCause from 'merge-error-cause'

test('Parent name is kept', (t) => {
  const error = new TypeError('test')
  error.cause = new RangeError('cause')
  t.is(mergeErrorCause(error).name, 'TypeError')
})

test('Parent name is kept in stack', (t) => {
  const error = new TypeError('test')
  error.cause = new RangeError('cause')
  t.true(mergeErrorCause(error).stack.includes('TypeError'))
})

const testErrorHandler = function (_, { testOpt }) {
  if (!testOpt) {
    throw new Error('test')
  }
}

const TestError = errorType('TestError', testErrorHandler)

test('Exceptions in parent constructor are handled', (t) => {
  const error = new TestError('test', { testOpt: true })
  error.cause = new RangeError('cause')
  t.is(mergeErrorCause(error).name, 'Error')
})

if ('AggregateError' in globalThis) {
  test("Aggregate errors' names are kept", (t) => {
    const error = new TypeError('test')
    const innerError = new RangeError('innerError')
    error.cause = new AggregateError([innerError], 'cause')
    const { name, errors } = mergeErrorCause(error)
    t.is(name, 'TypeError')
    t.is(errors[0].name, 'RangeError')
  })
}
