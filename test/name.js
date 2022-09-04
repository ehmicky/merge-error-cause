import test from 'ava'
import mergeErrorCause from 'merge-error-cause'
import { each } from 'test-each'

test('Parent name is kept', (t) => {
  const error = new TypeError('test')
  error.cause = new RangeError('cause')
  mergeErrorCause(error)
  t.is(error.name, 'TypeError')
})

test('Child name is kept', (t) => {
  const error = new Error('test')
  error.cause = new RangeError('cause')
  const cause = mergeErrorCause(error)
  t.is(cause.name, 'RangeError')
})

test('Parent name is kept in stack', (t) => {
  const error = new TypeError('test')
  error.cause = new RangeError('cause')
  mergeErrorCause(error)
  t.true(error.stack.includes('TypeError'))
})

test('Child name is kept in non-generated stack', (t) => {
  const error = new Error('test')
  error.cause = new RangeError('cause')
  const cause = mergeErrorCause(error)
  t.true(cause.stack.includes('RangeError'))
})

test('Child name is kept in generated stack', (t) => {
  const error = new Error('test')
  error.cause = new RangeError('cause')
  error.cause.stack = ''
  const cause = mergeErrorCause(error)
  t.true(cause.stack.includes('RangeError'))
})

test("Aggregate errors' names are kept", (t) => {
  const error = new TypeError('test')
  error.cause = new RangeError('cause')
  error.cause.errors = [new RangeError('innerError')]
  mergeErrorCause(error)
  t.is(error.name, 'TypeError')
  t.is(error.errors[0].name, 'RangeError')
})

each([TypeError, Error], ({ title }, ErrorClass) => {
  test(`Parent name is kept when mismatched | ${title}`, (t) => {
    const error = new ErrorClass('test')
    error.name = 'RangeError'
    error.cause = new TypeError('cause')
    mergeErrorCause(error)
    t.is(error.name, 'RangeError')
  })
})
