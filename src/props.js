// Merge error properties, shallowly, with parent error having priority
// Do not merge inherited properties nor non-enumerable properties.
// Works with symbol properties.
export const copyProps = function (parent, child) {
  // eslint-disable-next-line fp/no-loops
  for (const propName of Reflect.ownKeys(child)) {
    mergeProp(parent, child, propName)
  }
}

const mergeProp = function (parent, child, propName) {
  if (propName in parent) {
    return
  }

  const descriptor = Object.getOwnPropertyDescriptor(child, propName)

  if (descriptor !== undefined && !CORE_ERROR_PROPS.has(propName)) {
    // eslint-disable-next-line fp/no-mutating-methods
    Object.defineProperty(parent, propName, descriptor)
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
