import test from 'ava'
import mergeErrorCause from 'merge-error-cause'

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

if (hasAggregateErrors()) {
  test('Merge cause in "errors" without "cause"', (t) => {
    const cause = new Error('cause')
    const innerError = new Error('innerError', { cause })
    const error = new AggregateError([innerError], 'test')
    t.is(mergeErrorCause(error).errors[0].message, 'cause\ninnerError')
  })

  test('Merge cause in "errors" with "cause"', (t) => {
    const cause = new Error('cause')
    const innerError = new Error('innerError', { cause })
    const secondCause = new Error('secondCause')
    const error = new AggregateError([innerError], 'test', {
      cause: secondCause,
    })
    const { errors, message } = mergeErrorCause(error)
    t.is(message, 'secondCause\ntest')
    t.is(errors[0].message, 'cause\ninnerError')
  })
}
