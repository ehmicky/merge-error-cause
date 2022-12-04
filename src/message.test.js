import test from 'ava'
import { each } from 'test-each'

import mergeErrorCause from 'merge-error-cause'

each([TypeError, Error], ({ title }, ErrorClass) => {
  test(`Append messages by default | ${title}`, (t) => {
    const error = new ErrorClass('test')
    error.cause = new TypeError('cause')
    t.is(mergeErrorCause(error).message, 'cause\ntest')
  })

  test(`Prepend messages with colon | ${title}`, (t) => {
    const error = new ErrorClass('test:')
    error.cause = new TypeError('cause')
    t.is(mergeErrorCause(error).message, 'test: cause')
  })

  test(`Empty parent messages are ignored | ${title}`, (t) => {
    const error = new ErrorClass('')
    error.prop = true
    error.cause = new TypeError('cause')
    const { message, prop } = mergeErrorCause(error)
    t.is(message, 'cause')
    t.true(prop)
  })

  test(`New error message is reflected in stack | ${title}`, (t) => {
    const error = new ErrorClass('test')
    error.cause = new TypeError('cause')
    const { stack, message } = mergeErrorCause(error)
    t.true(stack.includes(message))
  })

  test(`New error message is reflected in stack even if child stack is invalid | ${title}`, (t) => {
    const error = new ErrorClass('test')
    error.cause = new TypeError('cause')
    error.cause.stack = ''
    const { stack, message } = mergeErrorCause(error)
    t.true(stack.includes(message))
  })

  test(`New error message is reflected in stack even if both stacks are invalid | ${title}`, (t) => {
    const error = new ErrorClass('test')
    error.cause = new TypeError('cause')
    error.stack = ''
    error.cause.stack = ''
    const { stack, message } = mergeErrorCause(error)
    t.true(stack.includes(message))
  })
})
