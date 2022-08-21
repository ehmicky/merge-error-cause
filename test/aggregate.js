import test from 'ava'
import mergeErrorCause from 'merge-error-cause'

const { propertyIsEnumerable: isEnum } = Object.prototype

test('Merge cause in "errors" without "cause"', (t) => {
  const innerError = new Error('innerError')
  // eslint-disable-next-line fp/no-mutation
  innerError.cause = new Error('cause')
  const error = new Error('test')
  error.errors = [innerError]
  mergeErrorCause(error)
  t.is(error.message, 'test')
  t.is(error.errors[0].message, 'cause\ninnerError')
})

test('Merge cause in "errors" with "cause"', (t) => {
  const innerError = new Error('innerError')
  // eslint-disable-next-line fp/no-mutation
  innerError.cause = new Error('cause')
  const error = new Error('test')
  error.errors = [innerError]
  error.cause = new Error('secondCause')
  mergeErrorCause(error)
  t.is(error.message, 'secondCause\ntest')
  t.is(error.errors[0].message, 'cause\ninnerError')
})

test('Does not set "errors" if none', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  mergeErrorCause(error)
  t.false('errors' in error)
})

test('Use child "errors" if no parent', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  error.cause.errors = [new Error('innerError')]
  mergeErrorCause(error)
  t.is(error.errors[0].message, 'innerError')
})

test('Keep "errors" non-enumerable', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  error.cause.errors = [new Error('innerError')]
  mergeErrorCause(error)
  t.false(isEnum.call(error, 'errors'))
})

test('Normalize "errors"', (t) => {
  const error = new Error('test')
  error.errors = ['innerError']
  mergeErrorCause(error)
  t.is(error.errors[0].message, 'innerError')
})

test('Handles invalid "errors"', (t) => {
  const error = new Error('test')
  error.errors = 'innerError'
  mergeErrorCause(error)
  t.is(error.errors, undefined)
})

test('Use parent "errors" if no child', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  error.errors = [new Error('innerError')]
  mergeErrorCause(error)
  t.is(error.errors[0].message, 'innerError')
})

test('Concatenate "errors"', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  error.errors = [new Error('one')]
  error.cause.errors = [new Error('two')]
  mergeErrorCause(error)
  t.is(error.errors.length, 2)
  t.is(error.errors[0].message, 'two')
  t.is(error.errors[1].message, 'one')
})
