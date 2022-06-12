import mergeErrorCause from 'merge-error-cause'
import { expectType, expectError } from 'tsd'

expectType<Error>(mergeErrorCause(new Error('test')))
mergeErrorCause(undefined)
mergeErrorCause('test')

expectError(mergeErrorCause())
expectError(mergeErrorCause(new Error('test'), {}))
