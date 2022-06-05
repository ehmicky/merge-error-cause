// Merge error properties, shallowly, with parent error having priority
export const copyProps = function (mergedError, parent, child) {
  mergeProps(mergedError, child)
  mergeProps(mergedError, parent)
}

// Do not merge inherited properties nor non-enumerable properties.
// Works with symbol properties.
const mergeProps = function (mergedError, error) {
  // eslint-disable-next-line guard-for-in, fp/no-loops
  for (const propName in error) {
    mergeProp(mergedError, error, propName)
  }

  // eslint-disable-next-line fp/no-loops
  for (const propName of Object.getOwnPropertySymbols(error)) {
    mergeProp(mergedError, error, propName)
  }
}

const mergeProp = function (mergedError, error, propName) {
  const descriptor = Object.getOwnPropertyDescriptor(error, propName)

  if (descriptor !== undefined && !CORE_ERROR_PROPS.has(propName)) {
    // eslint-disable-next-line fp/no-mutating-methods
    Object.defineProperty(mergedError, propName, descriptor)
  }
}

// Do not copy core error properties.
// Does not assume they are not enumerable.
const CORE_ERROR_PROPS = new Set([
  'name',
  'message',
  'stack',
  'cause',
  'errors',
])
