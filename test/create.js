import { runInNewContext } from 'vm'

import test from 'ava'
import errorType from 'error-type'
import mergeErrorCause from 'merge-error-cause'
import { each } from 'test-each'

const testErrorHandler = function (_, { testOpt }) {
  if (!testOpt) {
    throw new Error('test')
  }
}

const TestError = errorType('TestError', testErrorHandler)
const FakeAggregateError = errorType('FakeAggregateError')
// eslint-disable-next-line fp/no-mutation
FakeAggregateError.name = 'AggregateError'
// eslint-disable-next-line fp/no-mutation
FakeAggregateError.prototype.name = 'AggregateError'

each(
  [
    { ParentError: Error, ChildError: Error, name: 'Error' },
    ...('AggregateError' in globalThis
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
          {
            ParentError: runInNewContext('AggregateError'),
            ChildError: TypeError,
            name: 'TypeError',
          },
        ]
      : []),
    { ParentError: Error, ChildError: TypeError, name: 'TypeError' },
    { ParentError: TypeError, ChildError: Error, name: 'TypeError' },
    { ParentError: TypeError, ChildError: RangeError, name: 'TypeError' },
    { ParentError: TestError, ChildError: RangeError, name: 'RangeError' },
    { ParentError: Error, ChildError: TestError, name: 'Error' },
    {
      ParentError: FakeAggregateError,
      ChildError: Error,
      name: 'AggregateError' in globalThis ? 'AggregateError' : 'Error',
    },
    {
      ParentError: runInNewContext('Error'),
      ChildError: TypeError,
      name: 'TypeError',
    },
  ],
  ({ title }, { ParentError, ChildError, name }) => {
    test(`Error types are merged | ${title}`, (t) => {
      const error = new ParentError('test', { testOpt: true })
      error.cause = new ChildError('cause', { testOpt: true })
      t.is(mergeErrorCause(error).name, name)
    })
  },
)

if ('AggregateError' in globalThis) {
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
