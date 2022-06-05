import test from 'ava'
import mergeErrorCause from 'merge-error-cause'

test('Dummy test', (t) => {
  t.is(typeof mergeErrorCause, 'function')
})
