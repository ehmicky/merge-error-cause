import test from 'ava'
import mergeErrorCause from 'merge-error-cause'
import { each } from 'test-each'

import { hasAggregateErrors } from './helpers/main.js'

// eslint-disable-next-line fp/no-class
class TestError extends Error {
  constructor(message, { testOpt }) {
    super(message)
    // eslint-disable-next-line fp/no-this, fp/no-mutation
    this.name = 'TestError'

    if (!testOpt) {
      throw new Error('test')
    }
  }
}

each(
  [
    { ParentError: Error, ChildError: Error, name: 'Error' },
    ...(hasAggregateErrors()
      ? [
          {
            ParentError: Error,
            ChildError: AggregateError,
            name: 'AggregateError',
          },
          {
            ParentError: AggregateError,
            ChildError: Error,
            name: 'AggregateError',
          },
          {
            ParentError: AggregateError,
            ChildError: AggregateError,
            name: 'AggregateError',
          },
          {
            ParentError: AggregateError,
            ChildError: TypeError,
            name: 'TypeError',
          },
          {
            ParentError: TypeError,
            ChildError: AggregateError,
            name: 'TypeError',
          },
        ]
      : []),
    { ParentError: Error, ChildError: TypeError, name: 'TypeError' },
    { ParentError: TypeError, ChildError: Error, name: 'TypeError' },
    { ParentError: TypeError, ChildError: RangeError, name: 'TypeError' },
    { ParentError: TestError, ChildError: RangeError, name: 'RangeError' },
    { ParentError: Error, ChildError: TestError, name: 'Error' },
  ],
  ({ title }, { ParentError, ChildError, name }) => {
    test(`Error types are merged | ${title}`, (t) => {
      const error = new ParentError('test', { testOpt: true })
      error.cause = new ChildError('cause', { testOpt: true })
      t.is(mergeErrorCause(error).name, name)
    })
  },
)

if (hasAggregateErrors()) {
  test('Aggregate errors get new types', (t) => {
    const innerError = new TypeError('innerError')
    const error = new RangeError('test')
    error.cause = new AggregateError([innerError], 'cause')
    const { name, errors } = mergeErrorCause(error)
    t.is(name, 'RangeError')
    t.is(errors[0].name, 'TypeError')
  })
}

test('New error name is reflected in stack', (t) => {
  const error = new TypeError('test')
  error.cause = new Error('cause')
  t.true(mergeErrorCause(error).stack.includes('TypeError'))
})
