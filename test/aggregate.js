import test from 'ava'
import mergeErrorCause from 'merge-error-cause'

import { hasAggregateErrors } from './helpers/main.js'

const { propertyIsEnumerable: isEnum } = Object.prototype

if (hasAggregateErrors()) {
  test('Merge cause in "errors" without "cause"', (t) => {
    const cause = new Error('cause')
    const innerError = new Error('innerError', { cause })
    const error = new AggregateError([innerError], 'test')
    const mergedError = mergeErrorCause(error)
    t.is(mergedError.errors[0].message, 'cause\ninnerError')
    t.false(isEnum.call(mergedError, 'errors'))
  })

  test('Merge cause in "errors" with "cause"', (t) => {
    const cause = new Error('cause')
    const innerError = new Error('innerError', { cause })
    const secondCause = new Error('secondCause')
    const error = new AggregateError([innerError], 'test', {
      cause: secondCause,
    })
    const mergedError = mergeErrorCause(error)
    t.is(mergedError.message, 'secondCause\ntest')
    t.is(mergedError.errors[0].message, 'cause\ninnerError')
    t.false(isEnum.call(mergedError, 'errors'))
  })

  test('Normalize "errors"', (t) => {
    const error = new AggregateError(['innerError'], 'test')
    t.is(mergeErrorCause(error).errors[0].message, 'innerError')
  })

  test('Handles invalid "errors"', (t) => {
    const error = new AggregateError([], 'test')
    error.errors = 'innerError'
    t.is(mergeErrorCause(error).errors.length, 0)
  })
}

test('Merge cause in "errors" without "cause" nor AggregateError', (t) => {
  const innerError = new Error('innerError')
  // eslint-disable-next-line fp/no-mutation
  innerError.cause = new Error('cause')
  const error = new Error('test')
  error.errors = [innerError]
  const mergedError = mergeErrorCause(error)
  t.is(mergedError.errors[0].message, 'cause\ninnerError')
})

test('Does not set "errors" if none', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  t.false('errors' in mergeErrorCause(error))
})

test('Use child "errors" if no parent', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  error.cause.errors = [new Error('innerError')]
  t.is(mergeErrorCause(error).errors[0].message, 'innerError')
})

test('Use parent "errors" if no child', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  error.errors = [new Error('innerError')]
  t.is(mergeErrorCause(error).errors[0].message, 'innerError')
})

test('Concatenate "errors"', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  error.errors = [new Error('one')]
  error.cause.errors = [new Error('two')]
  t.is(mergeErrorCause(error).errors.length, 2)
  t.is(mergeErrorCause(error).errors[0].message, 'two')
  t.is(mergeErrorCause(error).errors[1].message, 'one')
})
