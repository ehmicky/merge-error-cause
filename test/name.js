import test from 'ava'
import mergeErrorCause from 'merge-error-cause'
import { each } from 'test-each'

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
