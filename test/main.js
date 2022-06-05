import test from 'ava'
import mergeErrorCause from 'merge-error-cause'

test('Error without cause is left as is', (t) => {
  const error = new Error('test')
  t.is(mergeErrorCause(error), error)
})

test('Error is normalized', (t) => {
  t.true(mergeErrorCause() instanceof Error)
})
