import { expectType, expectAssignable, expectError } from 'tsd'

import mergeErrorCause from './main.js'

const error = new Error('test')
expectAssignable<Error>(mergeErrorCause(error))
expectAssignable<Error>(mergeErrorCause(undefined))
expectAssignable<Error>(mergeErrorCause('test'))

expectError(mergeErrorCause())
expectError(mergeErrorCause(error, {}))

expectType<undefined>(mergeErrorCause(error as Error & { cause: true }).cause)
expectType<0>(
  mergeErrorCause(error as Error & { cause: Error & { prop: 0 } }).prop,
)
expectType<1>(
  mergeErrorCause(error as Error & { prop: 1; cause: Error & { prop: 0 } })
    .prop,
)
