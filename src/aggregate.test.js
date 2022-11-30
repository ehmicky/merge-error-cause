import test from 'ava'
import mergeErrorCause from 'merge-error-cause'
import { each } from 'test-each'

const { propertyIsEnumerable: isEnum } = Object.prototype

each([TypeError, Error], ({ title }, ErrorClass) => {
  test(`Merge cause in "errors" without "cause" | ${title}`, (t) => {
    const error = new ErrorClass('test')
    error.errors = [new TypeError('innerError')]
    error.errors[0].cause = new TypeError('cause')
    const { message, errors } = mergeErrorCause(error)
    t.is(message, 'test')
    t.is(errors[0].message, 'cause\ninnerError')
  })

  test(`Merge cause in "errors" with "cause" | ${title}`, (t) => {
    const error = new ErrorClass('test')
    error.errors = [new TypeError('innerError')]
    error.cause = new TypeError('secondCause')
    error.errors[0].cause = new TypeError('cause')
    const { message, errors } = mergeErrorCause(error)
    t.is(message, 'secondCause\ntest')
    t.is(errors[0].message, 'cause\ninnerError')
  })

  test(`Does not set "errors" if none | ${title}`, (t) => {
    const error = new ErrorClass('test')
    error.cause = new TypeError('cause')
    t.false('errors' in mergeErrorCause(error))
  })

  test(`Use child "errors" if no parent | ${title}`, (t) => {
    const error = new ErrorClass('test')
    error.cause = new TypeError('cause')
    const errors = [new TypeError('innerError')]
    error.cause.errors = errors
    const returnError = mergeErrorCause(error)
    t.is(returnError.errors[0].message, 'innerError')
    t.false(isEnum.call(returnError, 'errors'))
  })

  test(`Normalize "errors" | ${title}`, (t) => {
    const error = new ErrorClass('test')
    error.errors = ['innerError']
    t.is(mergeErrorCause(error).errors[0].message, 'innerError')
  })

  test(`Handles invalid "errors" | ${title}`, (t) => {
    const error = new ErrorClass('test')
    error.errors = 'innerError'
    t.is(mergeErrorCause(error).errors, undefined)
  })

  test(`Use parent "errors" if no child | ${title}`, (t) => {
    const error = new ErrorClass('test')
    error.cause = new TypeError('cause')
    error.errors = [new TypeError('innerError')]
    t.is(mergeErrorCause(error).errors[0].message, 'innerError')
  })

  test(`Concatenate "errors" | ${title}`, (t) => {
    const error = new ErrorClass('test')
    error.cause = new TypeError('cause')
    error.cause.errors = [new TypeError('two')]
    error.errors = [new TypeError('one')]
    const { errors } = mergeErrorCause(error)
    t.is(errors.length, 2)
    t.is(errors[0].message, 'two')
    t.is(errors[1].message, 'one')
  })
})
