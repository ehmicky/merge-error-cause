import test from 'ava'
import mergeErrorCause from 'merge-error-cause'

const { propertyIsEnumerable: isEnum } = Object.prototype

const getFirstStackLine = function (stack) {
  const lines = stack.split('\n')
  const index = lines.findIndex(isStackLine)
  return lines[index]
}

const isStackLine = function (line) {
  return line.trim().startsWith('at ')
}

test('Child stack trace is used', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  const { stack } = error.cause
  t.is(
    getFirstStackLine(mergeErrorCause(error).stack),
    getFirstStackLine(stack),
  )
})

test('Child stack trace is used deeply', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  error.cause.cause = new Error('innerCause')
  const { stack } = error.cause.cause
  t.is(
    getFirstStackLine(mergeErrorCause(error).stack),
    getFirstStackLine(stack),
  )
})

test('Invalid child stack traces are not used', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  error.cause.stack = ''
  const { stack } = error
  t.is(
    getFirstStackLine(mergeErrorCause(error).stack),
    getFirstStackLine(stack),
  )
})

test('Invalid child stack traces are not used deeply', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  error.cause.cause = new Error('innerCause')
  error.cause.cause.stack = ''
  const { stack } = error.cause
  t.is(
    getFirstStackLine(mergeErrorCause(error).stack),
    getFirstStackLine(stack),
  )
})

test('error.stack is not enumerable', (t) => {
  const error = new Error('test')
  error.cause = new Error('cause')
  t.false(isEnum.call(mergeErrorCause, 'stack'))
})
