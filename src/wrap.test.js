import test from 'ava'
import { each } from 'test-each'

import mergeErrorCause from 'merge-error-cause'

// eslint-disable-next-line fp/no-class
class PrototypeWrapError extends Error {}
// eslint-disable-next-line fp/no-mutating-assign
Object.assign(PrototypeWrapError.prototype, { name: 'WrapError', wrap: true })

// eslint-disable-next-line fp/no-class
class InstanceWrapError extends Error {
  constructor(...args) {
    super(...args)
    // eslint-disable-next-line fp/no-this, fp/no-mutation
    this.wrap = true
  }
}

each(
  [Error, PrototypeWrapError, InstanceWrapError],
  ({ title }, ErrorClass) => {
    test(`Child is returned if parent wraps | ${title}`, (t) => {
      const error = new ErrorClass('test')
      error.cause = new TypeError('cause')
      t.is(error.cause, mergeErrorCause(error))
    })

    test(`Child is mutated if parent wraps | ${title}`, (t) => {
      const cause = new TypeError('cause')
      const error = new ErrorClass('test')
      error.cause = cause
      t.is(mergeErrorCause(error).message, 'cause\ntest')
      t.is(error.message, 'test')
    })
  },
)

each([false, undefined, 'true'], ({ title }, wrap) => {
  test(`Parent is returned if parent does not wrap | ${title}`, (t) => {
    const error = new RangeError('test')
    error.cause = new TypeError('cause')
    error.wrap = wrap
    t.is(error, mergeErrorCause(error))
  })

  test(`Parent is mutated if parent does not wrap | ${title}`, (t) => {
    const error = new RangeError('test')
    const cause = new TypeError('cause')
    error.cause = cause
    error.wrap = wrap
    t.is(mergeErrorCause(error).message, 'cause\ntest')
    t.is(cause.message, 'cause')
  })
})

test('parent.wrap has priority over Error name', (t) => {
  const error = new Error('test')
  error.cause = new TypeError('cause')
  error.wrap = false
  t.is(mergeErrorCause(error), error)
})

each(
  [false, true],
  [{}, { cause: new TypeError('cause') }],
  ({ title }, wrap, opts) => {
    test(`parent.wrap is deleted | ${title}`, (t) => {
      const error = new RangeError('test', opts)
      error.wrap = wrap
      t.false('wrap' in mergeErrorCause(error))
    })
  },
)

test('parent.wrap is not deleted when set on the error prototype', (t) => {
  const error = new PrototypeWrapError('test')
  error.cause = new TypeError('cause')
  t.false('wrap' in mergeErrorCause(error))
  t.true(PrototypeWrapError.prototype.wrap)
})
