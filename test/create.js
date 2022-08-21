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

if ('AggregateError' in globalThis) {
  test("Aggregate errors' names are kept", (t) => {
    const error = new TypeError('test')
    error.cause = new Error('cause')
    error.cause.errors = [new RangeError('innerError')]
    mergeErrorCause(error)
    t.is(error.name, 'TypeError')
    t.is(error.errors[0].name, 'RangeError')
  })
}
