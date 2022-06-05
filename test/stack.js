import test from 'ava'
import mergeErrorCause from 'merge-error-cause'

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
