import test from 'ava'
import mergeErrorCause from 'merge-error-cause'

test('Child error properties are merged', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  error.cause.prop = true
  t.true(mergeErrorCause(error).prop)
})

test('Parent error properties are merged', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  error.prop = true
  t.true(mergeErrorCause(error).prop)
})

test('Parent error properties are merged with priority', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  error.prop = true
  error.cause.prop = false
  t.true(mergeErrorCause(error).prop)
})
