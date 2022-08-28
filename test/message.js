import test from 'ava'
import mergeErrorCause from 'merge-error-cause'
import { each } from 'test-each'

test('Messages are trimmed', (t) => {
  const error = new Error(' test ')
  error.cause = new Error(' cause ')
  mergeErrorCause(error)
  t.is(error.message, 'cause\ntest')
})

test('Empty parent messages are ignored', (t) => {
  const error = new Error('')
  error.prop = true
  error.cause = new Error('cause')
  mergeErrorCause(error)
  t.is(error.message, 'cause')
  t.true(error.prop)
})

test('Empty child messages are ignored', (t) => {
  const error = new Error('test')
  error.cause = new Error('')
  error.cause.prop = true
  mergeErrorCause(error)
  t.is(error.message, 'test')
  t.true(error.prop)
})

each(['test:', 'test: '], ({ title }, message) => {
  test(`Prepend messages with colon | ${title}`, (t) => {
    const error = new Error(message)
    error.cause = new Error('cause')
    mergeErrorCause(error)
    t.is(error.message, 'test: cause')
  })
})

test('Prepend messages with colon and newline', (t) => {
  const error = new Error('test:\n')
  error.cause = new Error('cause')
  mergeErrorCause(error)
  t.is(error.message, 'test:\ncause')
})

test('Does not prepend messages with newline but no colon', (t) => {
  const error = new Error('test\n')
  error.cause = new Error('cause')
  mergeErrorCause(error)
  t.is(error.message, 'cause\ntest')
})

test('New error message is reflected in stack', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  mergeErrorCause(error)
  t.true(error.stack.includes(error.message))
})

test('New error message is reflected in stack even if child stack is invalid', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  error.cause.stack = ''
  mergeErrorCause(error)
  t.true(error.stack.includes(error.message))
})

test('New error message is reflected in stack even if both stacks are invalid', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  error.stack = ''
  error.cause.stack = ''
  mergeErrorCause(error)
  t.true(error.stack.includes(error.message))
})
