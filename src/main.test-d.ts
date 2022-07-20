import { expectType, expectError } from 'tsd'

import mergeErrorCause from './main.js'

expectType<Error>(mergeErrorCause(new Error('test')))
mergeErrorCause(undefined)
mergeErrorCause('test')

expectError(mergeErrorCause())
expectError(mergeErrorCause(new Error('test'), {}))
