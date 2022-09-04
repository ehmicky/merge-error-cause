import test from 'ava'
import mergeErrorCause from 'merge-error-cause'
import { each } from 'test-each'

each(
  [Error, TypeError],
  ['test:', 'test: '],
  ({ title }, ErrorClass, message) => {
    test(`Prepend messages with colon | ${title}`, (t) => {
      const error = new ErrorClass(message)
      error.cause = new TypeError('cause')
      t.is(mergeErrorCause(error).message, 'test: cause')
    })
  },
)

each([Error, TypeError], ({ title }, ErrorClass) => {
  test(`Messages are trimmed | ${title}`, (t) => {
    const error = new ErrorClass(' test ')
    error.cause = new TypeError(' cause ')
    t.is(mergeErrorCause(error).message, 'cause\ntest')
  })

  test(`Empty parent messages are ignored | ${title}`, (t) => {
    const error = new ErrorClass('')
    error.prop = true
    error.cause = new TypeError('cause')
    const returnError = mergeErrorCause(error)
    t.is(returnError.message, 'cause')
    t.true(returnError.prop)
  })

  test(`Empty child messages are ignored | ${title}`, (t) => {
    const error = new ErrorClass('test')
    error.cause = new TypeError('')
    error.cause.prop = true
    const returnError = mergeErrorCause(error)
    t.is(returnError.message, 'test')
    t.true(returnError.prop)
  })

  test(`Prepend messages with colon and newline | ${title}`, (t) => {
    const error = new ErrorClass('test:\n')
    error.cause = new TypeError('cause')
    t.is(mergeErrorCause(error).message, 'test:\ncause')
  })

  test(`Does not prepend messages with newline but no colon | ${title}`, (t) => {
    const error = new ErrorClass('test\n')
    error.cause = new TypeError('cause')
    t.is(mergeErrorCause(error).message, 'cause\ntest')
  })

  test(`New error message is reflected in stack | ${title}`, (t) => {
    const error = new ErrorClass('test')
    error.cause = new TypeError('cause')
    const returnError = mergeErrorCause(error)
    t.true(returnError.stack.includes(returnError.message))
  })

  test(`New error message is reflected in stack even if child stack is invalid | ${title}`, (t) => {
    const error = new ErrorClass('test')
    error.cause = new TypeError('cause')
    error.cause.stack = ''
    const returnError = mergeErrorCause(error)
    t.true(returnError.stack.includes(returnError.message))
  })

  test(`New error message is reflected in stack even if both stacks are invalid | ${title}`, (t) => {
    const error = new ErrorClass('test')
    error.cause = new TypeError('cause')
    error.stack = ''
    error.cause.stack = ''
    const returnError = mergeErrorCause(error)
    t.true(returnError.stack.includes(returnError.message))
  })
})
