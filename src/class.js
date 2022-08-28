import setErrorClass from 'set-error-class'

// Allow parent to re-use child's error class if either:
//  - Parent class is generic `Error`
//  - Parent as property `wrap: true`
export const mergeClass = function (parent, child, stackError) {
  const constructorError = shouldMergeClass(parent) ? child : parent
  setErrorClass(parent, constructorError.constructor, stackError.name)
  fixName(parent, constructorError)
}

const shouldMergeClass = function ({ name, wrap }) {
  return name === 'Error' || wrap === true
}

// `set-error-class` should have set the proper `error.name` providing either:
//   - It is set as `ErrorClass.prototype.name`
//   - It matches the `constructor.name`
// However, there are some cases where `error.name` is set only in the
// constructor and the `constructor.name` does not match it. We fix it for
// those cases to ensure the `name` property does not change.
const fixName = function (parent, constructorError) {
  if (parent.name !== constructorError.name) {
    // eslint-disable-next-line fp/no-mutation, no-param-reassign
    parent.name = constructorError.name
  }
}
