import { expectType, expectAssignable, expectError } from 'tsd'

import mergeErrorCause from 'merge-error-cause'

const error = new Error('test')
expectAssignable<Error>(mergeErrorCause(error))
expectAssignable<Error>(mergeErrorCause(undefined))
expectAssignable<Error>(mergeErrorCause('test'))
expectAssignable<Error>(mergeErrorCause(error as Error & { cause: true }))

expectError(mergeErrorCause())
expectError(mergeErrorCause(error, {}))

expectType<Error | undefined>(
  mergeErrorCause(error as Error & { cause: true }).cause,
)
expectType<0>(
  mergeErrorCause(error as Error & { cause: Error & { prop: 0 } }).prop,
)
expectType<1>(
  mergeErrorCause(error as Error & { prop: 1; cause: Error & { prop: 0 } })
    .prop,
)
