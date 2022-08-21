import { expectAssignable, expectError } from 'tsd'

import mergeErrorCause from './main.js'

expectAssignable<Error>(mergeErrorCause(new Error('test')))
expectAssignable<Error>(mergeErrorCause(undefined))
expectAssignable<Error>(mergeErrorCause('test'))

expectError(mergeErrorCause())
expectError(mergeErrorCause(new Error('test'), {}))

expectError(mergeErrorCause(new Error('test') as Error & { cause: true }).cause)
