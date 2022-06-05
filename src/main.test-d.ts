import mergeErrorCause from 'merge-error-cause'
import { expectType, expectError } from 'tsd'

const error = new Error('test')
expectType<Error>(mergeErrorCause(error))
mergeErrorCause(undefined)
mergeErrorCause('test')

expectError(mergeErrorCause())
expectError(mergeErrorCause(new Error('test'), {}))
