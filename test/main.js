import test from 'ava'
import mergeErrorCause from 'merge-error-cause'
import { each } from 'test-each'

// `AggregateError` is not available in Node <15.0.0 and in some browsers
const hasAggregateErrors = function () {
  try {
    // eslint-disable-next-line no-unused-expressions
    AggregateError
    return true
  } catch {
    return false
  }
}

test('Error without cause is left as is', (t) => {
  const error = new Error('test')
  t.is(mergeErrorCause(error), error)
})

// eslint-disable-next-line unicorn/no-null
each([undefined, null, '', new Set([])], ({ title }, error) => {
  test(`Error is normalized | ${title}`, (t) => {
    t.true(mergeErrorCause(error) instanceof Error)
  })
})

if (hasAggregateErrors()) {
  test('Merge cause in "errors" without "cause"', (t) => {
    const cause = new Error('cause')
    const innerError = new Error('innerError', { cause })
    const error = new AggregateError([innerError], 'test')
    t.is(mergeErrorCause(error).errors[0].message, 'cause\ninnerError')
  })
}
