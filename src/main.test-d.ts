import { expectAssignable, expectError } from 'tsd'

import mergeErrorCause from './main.js'

expectAssignable<Error>(mergeErrorCause(new Error('test')))
mergeErrorCause(undefined)
mergeErrorCause('test')

expectError(mergeErrorCause())
expectError(mergeErrorCause(new Error('test'), {}))

expectError(mergeErrorCause(new Error('test') as Error & { cause: true }).cause)
