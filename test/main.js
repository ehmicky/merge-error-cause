import test from 'ava'
import mergeErrorCause from 'merge-error-cause'

test('Errors without cause are left as is', (t) => {
  const error = new Error('test')
  t.is(mergeErrorCause(error), error)
})
