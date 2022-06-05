// `AggregateError` is not available in Node <15.0.0 and in some browsers
export const hasAggregateErrors = function () {
  try {
    // eslint-disable-next-line no-unused-expressions
    AggregateError
    return true
  } catch {
    return false
  }
}
