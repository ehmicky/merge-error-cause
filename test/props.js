import test from 'ava'
import mergeErrorCause from 'merge-error-cause'
import { each } from 'test-each'

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
