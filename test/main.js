import test from 'ava'
import mergeErrorCause from 'merge-error-cause'
import { each } from 'test-each'

// eslint-disable-next-line unicorn/no-null
each([undefined, null, '', new Set([])], ({ title }, error) => {
  test(`Error is normalized | ${title}`, (t) => {
    t.true(mergeErrorCause(error) instanceof Error)
  })
})

each([Error, TypeError], ({ title }, ErrorClass) => {
  test(`Error without cause is left as is | ${title}`, (t) => {
    const error = new ErrorClass('test')
    t.false('cause' in mergeErrorCause(error))
  })

  test(`Error cause is merged | ${title}`, (t) => {
    const error = new ErrorClass('test')
    error.cause = new TypeError('cause')
    const returnError = mergeErrorCause(error)
    t.is(returnError.message, 'cause\ntest')
    t.false('cause' in returnError)
  })

  test(`Error cause is merged deeply | ${title}`, (t) => {
    const error = new ErrorClass('test')
    error.cause = new TypeError('cause')
    error.cause.cause = new TypeError('innerCause')
    t.is(mergeErrorCause(error).message, 'innerCause\ncause\ntest')
  })

  test(`Handle cause cycles | ${title}`, (t) => {
    const error = new ErrorClass('test')
    error.cause = error
    const returnError = mergeErrorCause(error)
    t.false('cause' in returnError)
    t.is(returnError.message, 'test')
  })

  test(`Handle aggregate errors cycles | ${title}`, (t) => {
    const error = new ErrorClass('test')
    error.errors = [error]
    mergeErrorCause(error)
    const { message, errors } = mergeErrorCause(error)
    t.is(message, 'test')
    t.is(errors.length, 0)
  })

  test(`Handle cause and aggregate errors cycles | ${title}`, (t) => {
    const error = new ErrorClass('test')
    error.cause = new TypeError('cause')
    error.cause.errors = [new TypeError('innerCause'), error]
    error.cause.errors[0].cause = error
    const { message, errors } = mergeErrorCause(error)
    t.is(message, 'cause\ntest')
    t.is(errors.length, 1)
    t.is(errors[0].message, 'innerCause')
  })
})
