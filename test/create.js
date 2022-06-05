import test from 'ava'
import mergeErrorCause from 'merge-error-cause'
import { each } from 'test-each'

import { hasAggregateErrors } from './helpers/main.js'

each(
  [
    { ParentError: Error, ChildError: Error, name: 'Error' },
    ...(hasAggregateErrors && [
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
    ]),
  ],
  ({ title }, { ParentError, ChildError, name }) => {
    test(`Error types are merged | ${title}`, (t) => {
      const error = new ParentError('test')
      error.cause = new ChildError('cause')
      t.is(mergeErrorCause(error).name, name)
    })
  },
)
