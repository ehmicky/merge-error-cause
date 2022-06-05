import test from 'ava'
import mergeErrorCause from 'merge-error-cause'
import { each } from 'test-each'

test('Messages are trimmed', (t) => {
  const error = new Error(' test ')
  error.cause = new Error(' cause ')
  t.is(mergeErrorCause(error).message, 'cause\ntest')
})

test('Empty parent messages are ignored', (t) => {
  // eslint-disable-next-line unicorn/error-message
  const error = new Error('')
  error.prop = true
  error.cause = new Error('cause')
  const { message, prop } = mergeErrorCause(error)
  t.is(message, 'cause')
  t.true(prop)
})

test('Empty child messages are ignored', (t) => {
  const error = new Error('test')
  // eslint-disable-next-line unicorn/error-message
  error.cause = new Error('')
  error.cause.prop = true
  const { message, prop } = mergeErrorCause(error)
  t.is(message, 'test')
  t.true(prop)
})

each(['test:', 'test: '], ({ title }, message) => {
  test(`Prepend messages with colon | ${title}`, (t) => {
    const error = new Error(message)
    error.cause = new Error('cause')
    t.is(mergeErrorCause(error).message, 'test: cause')
  })
})

test('Prepend messages with colon and newline', (t) => {
  const error = new Error('test:\n')
  error.cause = new Error('cause')
  t.is(mergeErrorCause(error).message, 'test:\ncause')
})

test('Does not prepend messages with newline but no colon', (t) => {
  const error = new Error('test\n')
  error.cause = new Error('cause')
  t.is(mergeErrorCause(error).message, 'cause\ntest')
})

test('New error message is reflected in stack', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  t.true(mergeErrorCause(error).stack.includes('cause\ntest'))
})
