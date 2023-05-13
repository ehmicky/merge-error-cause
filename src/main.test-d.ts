import mergeErrorCause from 'merge-error-cause'
import { expectType, expectAssignable } from 'tsd'

const error = new Error('test')
expectAssignable<Error>(mergeErrorCause(error))
expectAssignable<Error>(mergeErrorCause(undefined))
expectAssignable<Error>(mergeErrorCause('test'))
expectAssignable<Error>(mergeErrorCause(error as Error & { cause: true }))

// @ts-expect-error
mergeErrorCause()
// @ts-expect-error
mergeErrorCause(error, {})

expectType<unknown>(mergeErrorCause(error as Error & { cause: true }).cause)
expectType<0>(
  mergeErrorCause(error as Error & { cause: Error & { prop: 0 } }).prop,
)
expectType<1>(
  mergeErrorCause(error as Error & { prop: 1; cause: Error & { prop: 0 } })
    .prop,
)
