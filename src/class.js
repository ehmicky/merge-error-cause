import setErrorClass from 'set-error-class'

// Allow parent to re-use child's error class if either:
//  - Parent class is generic `Error`
//  - Parent `error.wrap` is `true`
export const mergeClass = function (parent, child, stackError) {
  const constructorError = shouldMergeClass(parent) ? child : parent
  const parentA = setErrorClass(
    parent,
    constructorError.constructor,
    stackError.name,
  )
  fixName(parentA, constructorError)
  return parentA
}

const shouldMergeClass = function (parent) {
  const { wrap, name } = parent

  if (typeof wrap !== 'boolean') {
    return name === 'Error'
  }

  if (isOwn.call(parent, 'wrap')) {
    // eslint-disable-next-line no-param-reassign, fp/no-delete
    delete parent.wrap
  }

  return wrap
}

const { hasOwnProperty: isOwn } = Object.prototype

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
