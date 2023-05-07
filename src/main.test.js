import test from 'ava'
import mergeErrorCause from 'merge-error-cause'
import { each } from 'test-each'


each([undefined, null, '', new Set([])], ({ title }, error) => {
  test(`Error is normalized | ${title}`, (t) => {
    t.true(mergeErrorCause(error) instanceof Error)
  })
})

each([TypeError, Error], ({ title }, ErrorClass) => {
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
    const cause = new TypeError('cause')
    error.cause = cause
    error.cause.errors = [new TypeError('innerCause'), error]
    error.cause.errors[0].cause = error
    const { message, errors } = mergeErrorCause(error)
    t.is(message, 'cause\ntest')
    t.is(errors.length, 1)
    t.is(errors[0].message, 'innerCause')
  })
})

each([true, false], ({ title }, wrap) => {
  test(`Parent and child names are kept | ${title}`, (t) => {
    const error = new TypeError('test')
    const cause = new RangeError('cause')
    error.cause = cause
    error.wrap = wrap
    mergeErrorCause(error)
    t.is(error.name, 'TypeError')
    t.is(cause.name, 'RangeError')
  })

  test(`Parent and child names are kept even when mismatched | ${title}`, (t) => {
    const error = new TypeError('test')
    error.name = 'RangeError'
    const cause = new TypeError('cause')
    error.cause = cause
    error.cause.name = 'RangeError'
    error.wrap = wrap
    mergeErrorCause(error)
    t.is(error.name, 'RangeError')
    t.is(cause.name, 'RangeError')
  })

  test(`Aggregate errors' names are kept | ${title}`, (t) => {
    const error = new TypeError('test')
    error.cause = new RangeError('cause')
    error.cause.errors = [new RangeError('innerError')]
    error.wrap = wrap
    t.is(mergeErrorCause(error).errors[0].name, 'RangeError')
  })
})

each([true, false], [true, false], ({ title }, wrap, resetStack) => {
  test(`Parent and child names are kept in stack | ${title}`, (t) => {
    const error = new TypeError('test')
    const cause = new RangeError('cause')
    error.cause = cause

    if (resetStack) {
      error.cause.stack = ''
    }

    error.wrap = wrap
    mergeErrorCause(error)
    t.true(error.stack.includes('TypeError'))
    t.true(cause.stack.includes('RangeError'))
  })
})

each([TypeError, Error], ({ title }, ErrorClass) => {
  test(`Child error properties are merged | ${title}`, (t) => {
    const error = new ErrorClass('test')
    error.cause = new TypeError('cause')
    error.cause.prop = true
    t.true(mergeErrorCause(error).prop)
  })

  test(`Parent error properties are merged | ${title}`, (t) => {
    const error = new ErrorClass('test')
    error.cause = new TypeError('cause')
    error.prop = true
    t.true(mergeErrorCause(error).prop)
  })

  test(`Parent error properties are merged with priority | ${title}`, (t) => {
    const error = new ErrorClass('test')
    error.cause = new TypeError('cause')
    error.prop = true
    error.cause.prop = false
    t.true(mergeErrorCause(error).prop)
  })

  test(`Symbol error properties are merged | ${title}`, (t) => {
    const error = new ErrorClass('test')
    error.cause = new TypeError('cause')
    const symbol = Symbol('prop')
    error.cause[symbol] = true
    t.true(mergeErrorCause(error)[symbol])
  })
})
