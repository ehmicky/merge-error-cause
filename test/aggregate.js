import test from 'ava'
import mergeErrorCause from 'merge-error-cause'

const { propertyIsEnumerable: isEnum } = Object.prototype

test('Merge cause in "errors" without "cause"', (t) => {
  const error = new TypeError('test')
  error.errors = [new TypeError('innerError')]
  error.errors[0].cause = new TypeError('cause')
  mergeErrorCause(error)
  t.is(error.message, 'test')
  t.is(error.errors[0].message, 'cause\ninnerError')
})

test('Merge cause in "errors" with "cause"', (t) => {
  const error = new TypeError('test')
  error.errors = [new TypeError('innerError')]
  error.cause = new TypeError('secondCause')
  error.errors[0].cause = new TypeError('cause')
  mergeErrorCause(error)
  t.is(error.message, 'secondCause\ntest')
  t.is(error.errors[0].message, 'cause\ninnerError')
})

test('Does not set "errors" if none', (t) => {
  const error = new TypeError('test')
  error.cause = new TypeError('cause')
  mergeErrorCause(error)
  t.false('errors' in error)
})

test('Use child "errors" if no parent', (t) => {
  const error = new TypeError('test')
  error.cause = new TypeError('cause')
  error.cause.errors = [new TypeError('innerError')]
  mergeErrorCause(error)
  t.is(error.errors[0].message, 'innerError')
  t.false(isEnum.call(error, 'errors'))
})

test('Normalize "errors"', (t) => {
  const error = new TypeError('test')
  error.errors = ['innerError']
  mergeErrorCause(error)
  t.is(error.errors[0].message, 'innerError')
})

test('Handles invalid "errors"', (t) => {
  const error = new TypeError('test')
  error.errors = 'innerError'
  mergeErrorCause(error)
  t.is(error.errors, undefined)
})

test('Use parent "errors" if no child', (t) => {
  const error = new TypeError('test')
  error.cause = new TypeError('cause')
  error.errors = [new TypeError('innerError')]
  mergeErrorCause(error)
  t.is(error.errors[0].message, 'innerError')
})

test('Concatenate "errors"', (t) => {
  const error = new TypeError('test')
  error.cause = new TypeError('cause')
  error.errors = [new TypeError('one')]
  error.cause.errors = [new TypeError('two')]
  mergeErrorCause(error)
  t.is(error.errors.length, 2)
  t.is(error.errors[0].message, 'two')
  t.is(error.errors[1].message, 'one')
})
